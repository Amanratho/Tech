import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;

  const BottomNavBar({super.key, required this.currentIndex});

  @override
  Widget build(BuildContext context) {
    final items = [
      _NavItem(icon: Icons.home_rounded, label: tr('home'), path: '/home'),
      _NavItem(icon: Icons.bar_chart_rounded, label: tr('navSummary'), path: '/summary'),
      _NavItem(icon: Icons.notifications_rounded, label: tr('navReminders'), path: '/payment-tracking'),
      _NavItem(icon: Icons.receipt_long_rounded, label: tr('navStatement'), path: '/statement'),
      _NavItem(icon: Icons.person_rounded, label: tr('profile'), path: '/profile'),
    ];

    return Container(
      height: 74,
      decoration: BoxDecoration(
        color: AppColors.bgSurface.withValues(alpha: 0.95),
        border: const Border(top: BorderSide(color: AppColors.border, width: 1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(items.length, (index) {
          final item = items[index];
          final isActive = currentIndex == index;

          return GestureDetector(
            onTap: () {
              if (!isActive) {
                context.go(item.path);
              }
            },
            behavior: HitTestBehavior.opaque,
            child: SizedBox(
              width: 68,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Active indicator bar
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    height: 3,
                    width: isActive ? 34 : 0,
                    margin: const EdgeInsets.only(bottom: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(2),
                      boxShadow: isActive
                          ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.5), blurRadius: 8)]
                          : [],
                    ),
                  ),
                  Icon(
                    item.icon,
                    size: isActive ? 24 : 22,
                    color: isActive ? AppColors.primaryGold : AppColors.textSubtle,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.label,
                    style: AppTypography.caption.copyWith(
                      fontSize: 12,
                      fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                      color: isActive ? AppColors.primaryGold : AppColors.textSubtle,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final String path;
  _NavItem({required this.icon, required this.label, required this.path});
}
