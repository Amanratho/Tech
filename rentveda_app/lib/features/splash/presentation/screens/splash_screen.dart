import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/services/notification_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeIn,
      ),
    );

    _controller.forward();

    // After animation, check if app was opened by a notification click
    Future.delayed(const Duration(milliseconds: 2500), () async {
      if (!mounted) return;

      final pending = NotificationService.consumePendingRoute();
      if (pending != null && pending.isNotEmpty) {
        const storage = FlutterSecureStorage();
        final token = await storage.read(key: 'token');
        if (token != null && token.isNotEmpty) {
          if (mounted) {
            context.go(pending);
            return;
          }
        } else {
          // Keep pendingRoute saved so user can be redirected after login
          NotificationService.pendingRoute = pending;
        }
      }

      if (mounted) {
        context.go('/welcome');
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: FadeTransition(
          opacity: _animation,
          child: Image.asset(
            'assets/images/rentVedaIcon.png',
            width: 200,
            height: 200,
          ),
        ),
      ),
    );
  }
}
