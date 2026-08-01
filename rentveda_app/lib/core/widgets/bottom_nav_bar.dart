import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;

  const BottomNavBar({super.key, required this.currentIndex});

  static const Color primaryColor = Color(0xFFFFCC00);
  static const Color inactiveColor = Color(0xFF9CA3AF);

  @override
  Widget build(BuildContext context) {
    final items = [
      _NavItem(icon: Icons.home_rounded, label: 'Home', path: '/home'),
      _NavItem(icon: Icons.bar_chart_rounded, label: 'Summary', path: '/summary'),
      _NavItem(icon: Icons.notifications_rounded, label: 'Reminders', path: '/reminders'),
      _NavItem(icon: Icons.receipt_long_rounded, label: 'Statement', path: '/statement'),
      _NavItem(icon: Icons.person_rounded, label: 'Profile', path: '/profile'),
    ];

    return Container(
      height: 72,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.95),
        border: const Border(top: BorderSide(color: Color(0xFFE5E7EB), width: 1)),
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
              width: 64,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Active indicator bar
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    height: 3,
                    width: isActive ? 32 : 0,
                    margin: const EdgeInsets.only(bottom: 6),
                    decoration: BoxDecoration(
                      color: primaryColor,
                      borderRadius: BorderRadius.circular(2),
                      boxShadow: isActive
                          ? [BoxShadow(color: primaryColor.withValues(alpha: 0.5), blurRadius: 8)]
                          : [],
                    ),
                  ),
                  Icon(
                    item.icon,
                    size: isActive ? 22 : 20,
                    color: isActive ? primaryColor : inactiveColor,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    item.label,
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: isActive ? primaryColor : inactiveColor,
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
