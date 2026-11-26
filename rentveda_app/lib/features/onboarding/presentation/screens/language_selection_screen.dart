import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/services/notification_service.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class LanguageSelectionScreen extends StatelessWidget {
  const LanguageSelectionScreen({super.key});

  Future<void> _selectLanguage(BuildContext context, String langCode) async {
    // 1. Update locale
    await context.setLocale(Locale(langCode));
    
    // 2. Save preference so this screen isn't shown again
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('language_selected', true);
    await prefs.setString('selected_language', langCode);
    NotificationService().syncLanguage(langCode);
    
    if (!context.mounted) return;
    
    // 3. Navigate to welcome screen
    context.go('/welcome');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo or Icon
              Container(
                height: 80,
                width: 80,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Text(
                    'R',
                    style: TextStyle(
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textMain,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 40),
              
              Text(
                'Choose your language',
                style: AppTypography.screenHeader.copyWith(fontSize: 28),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'अपनी भाषा चुनें',
                style: AppTypography.bodyMain.copyWith(color: AppColors.textSubtle, fontSize: 16),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              Expanded(
                child: SingleChildScrollView(
                  child: Wrap(
                    spacing: 16,
                    runSpacing: 16,
                    children: [
                      _buildLangBox(context, 'english', 'ENG', 'en'),
                      _buildLangBox(context, 'hindi', 'HI', 'hi'),
                      _buildLangBox(context, 'marathi', 'MR', 'mr'),
                      _buildLangBox(context, 'gujarati', 'GU', 'gu'),
                      _buildLangBox(context, 'punjabi', 'PA', 'pa'),
                      _buildLangBox(context, 'tamil', 'TA', 'ta'),
                      _buildLangBox(context, 'telugu', 'TE', 'te'),
                      _buildLangBox(context, 'kannada', 'KN', 'kn'),
                      _buildLangBox(context, 'bengali', 'BN', 'bn'),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLangBox(BuildContext context, String key, String subtitle, String code) {
    return SizedBox(
      width: (MediaQuery.of(context).size.width - 48 - 32) / 3,
      child: _LanguageBox(
        title: tr(key),
        subtitle: subtitle,
        isSelected: context.locale.languageCode == code,
        onTap: () => _selectLanguage(context, code),
      ),
    );
  }
}

class _LanguageBox extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  const _LanguageBox({
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : AppColors.bgSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.1),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
          ],
        ),
        child: Column(
          children: [
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isSelected ? AppColors.primary : AppColors.textSubtle,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppColors.textMain,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
