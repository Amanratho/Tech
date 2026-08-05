import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class QuickActions extends StatelessWidget {
  const QuickActions({super.key});

  @override
  Widget build(BuildContext context) {
    final actions = [
      _Action(title: tr('explore'), icon: Icons.receipt_long, color: AppColors.successDark, bgColor: AppColors.successBg, borderColor: AppColors.successBorder, path: '/payment-tracking'),
      _Action(title: tr('seeBills'), icon: Icons.history, color: const Color(0xFF2563EB), bgColor: const Color(0xFFEFF6FF), borderColor: const Color(0xFFBFDBFE), path: '/summary'),
      _Action(title: tr('seeStatus'), icon: Icons.build_circle, color: const Color(0xFFEA580C), bgColor: const Color(0xFFFFF7ED), borderColor: const Color(0xFFFED7AA), path: '/machine-maintenance'),
      _Action(title: tr('calculator'), icon: Icons.calculate, color: const Color(0xFFD97706), bgColor: const Color(0xFFFFFBEB), borderColor: const Color(0xFFFDE68A), path: '/calculator'),
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.bgSurface,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 4)],
        ),
        child: Row(
          children: actions.map((action) {
            return Expanded(
              child: GestureDetector(
                onTap: () => context.push(action.path),
                child: Column(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: action.bgColor,
                        border: Border.all(color: action.borderColor),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(action.icon, size: 22, color: action.color),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      action.title,
                      style: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.textDarkBrown,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _Action {
  final String title;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final Color borderColor;
  final String path;

  _Action({
    required this.title,
    required this.icon,
    required this.color,
    required this.bgColor,
    required this.borderColor,
    required this.path,
  });
}
