import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/screens/welcome_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/summary/presentation/screens/summary_screen.dart';
import '../../features/reminders/presentation/screens/reminders_screen.dart';
import '../../features/statement/presentation/screens/statement_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../widgets/bottom_nav_bar.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

class AppRouter {
  static final router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/welcome',
    redirect: (context, state) async {
      // Very basic auth check for routing
      const storage = FlutterSecureStorage();
      final token = await storage.read(key: 'token');
      final isGoingToWelcome = state.uri.toString() == '/welcome';

      if (token == null && !isGoingToWelcome) {
        return '/welcome';
      }
      if (token != null && isGoingToWelcome) {
        return '/home';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/welcome',
        name: 'welcome',
        builder: (context, state) => const WelcomeScreen(),
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
            pageBuilder: (context, state) => const NoTransitionPage(child: SummaryScreen()),
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
        ],
      ),
    ],
  );
}
