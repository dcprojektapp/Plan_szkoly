import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/constants/app_strings.dart';
import 'presentation/screens/home/home_screen.dart';
import 'presentation/screens/scanner/qr_scanner_screen.dart';
import 'presentation/screens/search/search_screen.dart';
import 'presentation/screens/navigation/navigation_screen.dart';
import 'presentation/screens/plan/school_plan_screen.dart';

class SchoolNavApp extends StatelessWidget {
  const SchoolNavApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppStrings.appName,
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (context) => const HomeScreen(),
        '/scanner': (context) => const QrScannerScreen(),
        '/search': (context) => const SearchScreen(),
        '/navigation': (context) => const NavigationScreen(),
        '/plan': (context) => const SchoolPlanScreen(),
      },
    );
  }
}
