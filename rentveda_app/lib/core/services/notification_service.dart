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

      // 2. Set foreground presentation options (so alert shows even if app is foreground)
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
        // Wait briefly for app router initialization
        Future.delayed(const Duration(milliseconds: 500), () {
          _handleNotificationClick(initialMessage);
        });
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

  void _handleNotificationClick(RemoteMessage message) {
    try {
      final route = message.data['route']?.toString() ?? '/reminders';
      AppRouter.router.push(route);
    } catch (e) {
      debugPrint('Error routing on notification click: $e');
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
