import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:easy_localization/easy_localization.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase initialization warning: $e');
  }
  await EasyLocalization.ensureInitialized();
  AppRouter.initialize();
  
  runApp(
    EasyLocalization(
      supportedLocales: const [
        Locale('en'), Locale('hi'), Locale('mr'), Locale('gu'),
        Locale('pa'), Locale('ta'), Locale('te'), Locale('kn'), Locale('bn')
      ],
      path: 'assets/translations',
      fallbackLocale: const Locale('en'),
      child: const ProviderScope(
        child: RentVedaApp(),
      ),
    ),
  );
}

class RentVedaApp extends StatelessWidget {
  const RentVedaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'RentVeda',
      theme: AppTheme.lightTheme,
      routerConfig: AppRouter.router,
      debugShowCheckedModeBanner: false,
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
    );
  }
}
