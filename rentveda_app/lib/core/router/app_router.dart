import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../network/api_client.dart';
import '../../features/auth/presentation/screens/welcome_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/eod_dashboard/presentation/screens/eod_dashboard_screen.dart';
import '../../features/summary/presentation/screens/summary_screen.dart';
import '../../features/reminders/presentation/screens/reminders_screen.dart';
import '../../features/statement/presentation/screens/statement_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/profile/presentation/screens/edit_profile_screen.dart';
import '../../features/profile/presentation/screens/about_screen.dart';
import '../../features/profile/presentation/screens/contact_screen.dart';
import '../../features/machine_registration/presentation/screens/update_machinery_screen.dart';
import '../../features/machine_registration/presentation/screens/edit_machine_screen.dart';
import '../../features/payments/presentation/screens/payment_tracking_screen.dart';
import '../../features/start_entry/presentation/screens/start_entry_screen.dart';
import '../../features/invoice/presentation/screens/invoice_screen.dart';
import '../../features/machine_maintenance/presentation/screens/machine_maintenance_screen.dart';
import '../../features/calculator/presentation/screens/calculator_screen.dart';
import '../../features/machine_registration/presentation/screens/add_machine_screen.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/top_app_bar.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../features/onboarding/presentation/screens/language_selection_screen.dart';
import '../../features/splash/presentation/screens/splash_screen.dart';
import '../../features/tracker/presentation/screens/area_tracker_map_screen.dart';
import '../../features/admin/presentation/screens/admin_dashboard_screen.dart';


class AppRouter {
  static final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();
  static final GlobalKey<NavigatorState> shellNavigatorKey = GlobalKey<NavigatorState>();

  static void initialize() {
    ApiClient.onAuthExpired = () {
      router.go('/welcome');
    };
  }

  static final router = GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    redirect: (context, state) async {
      final isGoingToSplash = state.uri.toString() == '/splash';
      if (isGoingToSplash) return null;

      final prefs = await SharedPreferences.getInstance();
      final hasSelectedLanguage = prefs.getBool('language_selected') ?? false;
      final isGoingToLanguage = state.uri.toString() == '/language';

      if (!hasSelectedLanguage) {
        return isGoingToLanguage ? null : '/language';
      }

      // At this point, hasSelectedLanguage is true.
      // Very basic auth check for routing
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'token');
      
      // If they already selected a language, going to /language should redirect them to auth flow
      final isGoingToWelcomeOrLanguage = state.uri.toString() == '/welcome' || state.uri.toString() == '/language';

      if (token == null && !isGoingToWelcomeOrLanguage) {
        return '/welcome';
      }
      if (token != null && isGoingToWelcomeOrLanguage) {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/language',
        name: 'language',
        builder: (context, state) => const LanguageSelectionScreen(),
      ),
      GoRoute(
        path: '/welcome',
        name: 'welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: '/start-entry',
        name: 'start-entry',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return StartEntryScreen(extra: extra);
        },
      ),
      GoRoute(
        path: '/invoice',
        name: 'invoice',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? {};
          return InvoiceScreen(extra: extra);
        },
      ),
      GoRoute(
        path: '/add-machine',
        name: 'add-machine',
        builder: (context, state) => const AddMachineScreen(),
      ),
      GoRoute(
        path: '/edit-profile',
        name: 'edit-profile',
        builder: (context, state) {
          final extra = state.extra;
          String? focusSection;
          if (extra is Map<String, dynamic>) {
            focusSection = extra['focusSection'] as String?;
          } else if (extra is String) {
            focusSection = extra;
          }
          return EditProfileScreen(focusSection: focusSection);
        },
      ),
      GoRoute(
        path: '/about',
        name: 'about',
        builder: (context, state) => const AboutScreen(),
      ),
      GoRoute(
        path: '/contact',
        name: 'contact',
        builder: (context, state) => const ContactScreen(),
      ),
      GoRoute(
        path: '/update-machinery',
        name: 'update-machinery',
        builder: (context, state) => const UpdateMachineryScreen(),
      ),
      GoRoute(
        path: '/edit-machine/:id',
        name: 'edit-machine',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          final extra = state.extra as Map<String, dynamic>?;
          return EditMachineScreen(machineId: id, extraMachineData: extra);
        },
      ),
      GoRoute(
        path: '/area-tracker',
        name: 'area-tracker',
        builder: (context, state) => const AreaTrackerMapScreen(),
      ),
      GoRoute(
        path: '/admin-dashboard',
        name: 'admin-dashboard',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      ShellRoute(
        navigatorKey: AppRouter.shellNavigatorKey,
        builder: (context, state, child) {
          int currentIndex = -1;
          if (state.uri.path == '/home') currentIndex = 0;
          if (state.uri.path == '/summary') currentIndex = 1;
          if (state.uri.path == '/reminders') currentIndex = 2;
          if (state.uri.path == '/statement') currentIndex = 3;
          if (state.uri.path == '/profile') currentIndex = 4;

          final isHome = state.uri.path == '/home';
          final isTopLevelTab = currentIndex != -1;
          final canShellPop = AppRouter.shellNavigatorKey.currentState?.canPop() ?? false;

          return PopScope(
            canPop: isHome && !canShellPop,
            onPopInvokedWithResult: (didPop, result) {
              if (didPop) return;
              if (AppRouter.shellNavigatorKey.currentState?.canPop() ?? false) {
                AppRouter.shellNavigatorKey.currentState?.pop();
                return;
              }
              if (!isHome) {
                context.go('/home');
              }
            },
            child: Scaffold(
              appBar: RentVedaAppBar(
                showBackButton: !isTopLevelTab,
                onBackTap: () {
                  if (AppRouter.shellNavigatorKey.currentState?.canPop() ?? false) {
                    AppRouter.shellNavigatorKey.currentState?.pop();
                  } else {
                    context.go('/home');
                  }
                },
              ),
              body: child,
              bottomNavigationBar: BottomNavBar(currentIndex: currentIndex),
            ),
          );
        },
        routes: [
          GoRoute(
            path: '/home',
            name: 'home',
            pageBuilder: (context, state) => const NoTransitionPage(child: HomeScreen()),
          ),
          GoRoute(
            path: '/summary',
            name: 'summary',
            pageBuilder: (context, state) => const NoTransitionPage(child: EodDashboardScreen()),
          ),
          GoRoute(
            path: '/reminders',
            name: 'reminders',
            pageBuilder: (context, state) {
              final extra = state.extra as Map<String, dynamic>?;
              return NoTransitionPage(child: RemindersScreen(extra: extra));
            },
          ),
          GoRoute(
            path: '/statement',
            name: 'statement',
            pageBuilder: (context, state) => const NoTransitionPage(child: StatementScreen()),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            pageBuilder: (context, state) => const NoTransitionPage(child: ProfileScreen()),
          ),
          GoRoute(
            path: '/payment-tracking',
            name: 'payment-tracking',
            pageBuilder: (context, state) => const NoTransitionPage(child: PaymentTrackingScreen()),
          ),
          GoRoute(
            path: '/bill-history',
            name: 'bill-history',
            pageBuilder: (context, state) => const NoTransitionPage(child: SummaryScreen()),
          ),
          GoRoute(
            path: '/machine-maintenance',
            name: 'machine-maintenance',
            pageBuilder: (context, state) => const NoTransitionPage(child: MachineMaintenanceScreen()),
          ),
          GoRoute(
            path: '/calculator',
            name: 'calculator',
            pageBuilder: (context, state) => const NoTransitionPage(child: CalculatorScreen()),
          ),
        ],
      ),
    ],
  );
}
