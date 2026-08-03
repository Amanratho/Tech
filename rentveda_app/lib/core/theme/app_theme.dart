import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';
import 'app_typography.dart';

class AppTheme {
  static Color get primaryColor => AppColors.primary;
  static Color get primaryDark => AppColors.primaryDark;
  static Color get backgroundColor => AppColors.bgMain;
  static Color get surfaceColor => AppColors.bgSurface;
  static Color get textPrimary => AppColors.textMain;
  static Color get textSecondary => AppColors.textMuted;
  static Color get errorColor => AppColors.danger;

  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.bgMain,
      colorScheme: ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.primaryDark,
        surface: AppColors.bgSurface,
        error: AppColors.danger,
        onPrimary: AppColors.textMain,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: AppTypography.screenHeader,
        titleLarge: AppTypography.sectionHeader,
        titleMedium: AppTypography.cardHeader,
        bodyLarge: AppTypography.bodyMain,
        bodyMedium: AppTypography.bodySecondary,
        bodySmall: AppTypography.caption,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textMain,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16),
          textStyle: AppTypography.buttonText,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.bgMain,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.borderFocus, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}
