import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
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

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

class AppRouter {
  static final router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/welcome',
    redirect: (context, state) async {
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
        builder: (context, state) => const EditProfileScreen(),
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
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          int currentIndex = 0;
          if (state.uri.toString().startsWith('/home')) currentIndex = 0;
          if (state.uri.toString().startsWith('/summary')) currentIndex = 1;
          if (state.uri.toString().startsWith('/reminders')) currentIndex = 2;
          if (state.uri.toString().startsWith('/statement')) currentIndex = 3;
          if (state.uri.toString().startsWith('/profile')) currentIndex = 4;

          return Scaffold(
            appBar: const RentVedaAppBar(),
            body: child,
            bottomNavigationBar: BottomNavBar(currentIndex: currentIndex),
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
            pageBuilder: (context, state) => const NoTransitionPage(child: RemindersScreen()),
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
