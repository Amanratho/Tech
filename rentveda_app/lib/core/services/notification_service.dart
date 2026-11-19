import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../network/api_client.dart';
import '../router/app_router.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Background Firebase init note: $e');
  }
  debugPrint('Handling background notification: ${message.messageId} - ${message.notification?.title}');
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  /// Stores route when app is opened directly from a notification in terminated state.
  static String? pendingRoute;

  /// Callback triggered whenever a reminder notification is clicked or received
  static VoidCallback? onReminderRefreshNeeded;

  static String? consumePendingRoute() {
    final route = pendingRoute;
    pendingRoute = null;
    return route;
  }

  Future<void> initialize() async {
    try {
      // 1. Request user permission for notifications (Required for Android 13+)
      final settings = await _fcm.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint('FCM Authorization status: ${settings.authorizationStatus}');

      // 2. Set foreground presentation options
      await _fcm.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // 3. Set background message handler
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // 4. Handle notifications when app is in foreground
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Foreground notification received: ${message.notification?.title}');
        _handleForegroundNotification(message);
      });

      // 5. Handle notification tap when app is in background
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('Notification clicked from background: ${message.data}');
        _handleNotificationClick(message);
      });

      // 6. Handle notification tap when app was terminated
      final initialMessage = await _fcm.getInitialMessage();
      if (initialMessage != null) {
        debugPrint('Notification clicked from terminated state: ${initialMessage.data}');
        pendingRoute = _extractRoute(initialMessage);
      }

      // 7. Register token with backend
      await syncFcmToken();

      // 8. Listen to token refresh
      _fcm.onTokenRefresh.listen((newToken) {
        debugPrint('FCM Token refreshed: $newToken');
        _sendTokenToBackend(newToken);
      });
    } catch (e) {
      debugPrint('NotificationService init error: $e');
    }
  }

  static String _extractRoute(RemoteMessage message) {
    String? route = message.data['route']?.toString();
    if (route != null && route.isNotEmpty) {
      if (!route.startsWith('/')) {
        route = '/$route';
      }
      return route;
    }
    return '/reminders';
  }

  void _handleNotificationClick(RemoteMessage message) {
    try {
      final route = _extractRoute(message);
      navigateToRoute(route);
    } catch (e) {
      debugPrint('Error routing on notification click: $e');
    }
  }

  static void navigateToRoute(String route) {
    try {
      debugPrint('Navigating to route on notification: $route');
      // Trigger refresh if reminders screen is active
      onReminderRefreshNeeded?.call();

      // If any modal or dialog is open on rootNavigator, close it
      final navState = AppRouter.rootNavigatorKey.currentState;
      if (navState != null && navState.canPop()) {
        navState.popUntil((r) => r.isFirst);
      }
      AppRouter.router.go(route);
    } catch (e) {
      debugPrint('Error in navigateToRoute: $e');
      try {
        AppRouter.router.push(route);
      } catch (e2) {
        debugPrint('Fallback push error: $e2');
      }
    }
  }

  void _handleForegroundNotification(RemoteMessage message) {
    try {
      final title = message.notification?.title ?? 'रेंटवेदा रिमाइंडर (RentVeda)';
      final body = message.notification?.body ?? '';
      final route = _extractRoute(message);

      // Refresh list if user is currently looking at reminders
      onReminderRefreshNeeded?.call();

      final context = AppRouter.rootNavigatorKey.currentContext;
      if (context != null && context.mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            behavior: SnackBarBehavior.floating,
            backgroundColor: const Color(0xFF1E293B),
            elevation: 8,
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            duration: const Duration(seconds: 6),
            content: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFCC00).withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.notifications_active, color: Color(0xFFFFCC00), size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.w700, color: Colors.white, fontSize: 13),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (body.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          body,
                          style: const TextStyle(color: Colors.white70, fontSize: 12),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            action: SnackBarAction(
              label: 'देखें',
              textColor: const Color(0xFFFFCC00),
              onPressed: () {
                navigateToRoute(route);
              },
            ),
          ),
        );
      }
    } catch (e) {
      debugPrint('Error showing foreground notification: $e');
    }
  }

  Future<void> syncFcmToken() async {
    try {
      final token = await _fcm.getToken();
      if (token != null) {
        debugPrint('FCM Device Token: $token');
        await _sendTokenToBackend(token);
      }
    } catch (e) {
      debugPrint('Error syncing FCM token: $e');
    }
  }

  Future<void> _sendTokenToBackend(String token) async {
    try {
      final uid = await _storage.read(key: 'uid');
      if (uid == null || uid.isEmpty) return;

      final apiClient = ApiClient();
      await apiClient.dio.put('/users/fcm-token', data: {
        'uid': uid,
        'fcmToken': token,
      });
      debugPrint('FCM Token successfully synced with backend for UID: $uid');
    } catch (e) {
      debugPrint('Failed to send FCM token to backend: $e');
    }
  }
}
