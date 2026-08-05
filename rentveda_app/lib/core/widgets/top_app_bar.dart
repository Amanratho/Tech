import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class RentVedaAppBar extends StatelessWidget implements PreferredSizeWidget {
  final bool showBackButton;
  
  const RentVedaAppBar({super.key, this.showBackButton = false});

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    final isEn = context.locale.languageCode == 'en';

    return Container(
      height: 56 + MediaQuery.of(context).padding.top,
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
      decoration: BoxDecoration(
        color: AppColors.bgSurface.withValues(alpha: 0.95),
        border: const Border(bottom: BorderSide(color: AppColors.border, width: 1)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Logo / Back Button
            Row(
              children: [
                if (showBackButton)
                  Padding(
                    padding: const EdgeInsets.only(right: 12.0),
                    child: GestureDetector(
                      onTap: () => Navigator.of(context).pop(),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.bgMain,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const Icon(Icons.arrow_back, size: 20, color: AppColors.textMain),
                      ),
                    ),
                  ),
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      'R',
                      style: AppTypography.screenHeader.copyWith(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textMain,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                RichText(
                  text: TextSpan(
                    style: AppTypography.screenHeader,
                    children: [
                      const TextSpan(text: 'Rent', style: TextStyle(color: AppColors.textMain)),
                      TextSpan(text: 'Veda', style: TextStyle(color: AppColors.primaryGold)),
                    ],
                  ),
                ),
              ],
            ),

            // Right side: Language toggle + Notification bell
            Row(
              children: [
                // Language toggle pill
                GestureDetector(
                  onTap: () {
                    if (isEn) {
                      context.setLocale(const Locale('hi'));
                    } else {
                      context.setLocale(const Locale('en'));
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: AppColors.bgPill,
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.language, size: 16, color: AppColors.primaryGold),
                        const SizedBox(width: 6),
                        Text(
                          isEn ? 'हिन्दी' : 'ENG',
                          style: AppTypography.bodySecondary.copyWith(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textMain,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Notification bell
                Stack(
                  children: [
                    const Icon(Icons.notifications_rounded, size: 26, color: AppColors.primaryGold),
                    Positioned(
                      top: 0,
                      right: 0,
                      child: Container(
                        width: 9,
                        height: 9,
                        decoration: BoxDecoration(
                          color: AppColors.danger,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.bgSurface, width: 1.5),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
