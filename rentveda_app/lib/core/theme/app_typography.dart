import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTypography {
  // Screen Header Title (e.g. 20px Bold for primary screen titles)
  static TextStyle get screenHeader => GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w800,
        color: AppColors.textMain,
        letterSpacing: -0.5,
      );

  // Section Header (e.g. 16px ExtraBold for section titles like "Explore Our Machines")
  static TextStyle get sectionHeader => GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppColors.textMain,
      );

  // Card Header / Item Name (e.g. 15px Bold for client names, machine names)
  static TextStyle get cardHeader => GoogleFonts.inter(
        fontSize: 15,
        fontWeight: FontWeight.w700,
        color: AppColors.textMain,
      );

  // Main Body / Form Input / Action Title (14px Medium)
  static TextStyle get bodyMain => GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: AppColors.textMain,
      );

  // Secondary Body / Subtitles (13px Medium)
  static TextStyle get bodySecondary => GoogleFonts.inter(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: AppColors.textDarkBrown,
      );

  // Caption / Dates / Phone Numbers / Micro Text (12px SemiBold - No text below 12px!)
  static TextStyle get caption => GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: AppColors.textSubtle,
      );

  // Badge & Status Pills (12px ExtraBold for high contrast readability)
  static TextStyle get badgeText => GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w800,
        letterSpacing: 0.5,
      );

  // Primary Action Buttons (15px Bold)
  static TextStyle get buttonText => GoogleFonts.inter(
        fontSize: 15,
        fontWeight: FontWeight.w700,
      );
}
