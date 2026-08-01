import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';

class QuickActions extends StatelessWidget {
  const QuickActions({super.key});

  @override
  Widget build(BuildContext context) {
    final actions = [
      _Action(title: tr('paymentTrackingButton') == 'paymentTrackingButton' ? 'Payments' : tr('paymentTrackingButton'), icon: Icons.receipt_long, color: const Color(0xFF16A34A), bgColor: const Color(0xFFF0FDF4), borderColor: const Color(0xFFBBF7D0), path: '/payment-tracking'),
      _Action(title: tr('billsHistoryButton') == 'billsHistoryButton' ? 'Bills' : tr('billsHistoryButton'), icon: Icons.history, color: const Color(0xFF2563EB), bgColor: const Color(0xFFEFF6FF), borderColor: const Color(0xFFBFDBFE), path: '/summary'),
      _Action(title: tr('machineStatusButton') == 'machineStatusButton' ? 'Machine' : tr('machineStatusButton'), icon: Icons.build_circle, color: const Color(0xFFEA580C), bgColor: const Color(0xFFFFF7ED), borderColor: const Color(0xFFFED7AA), path: '/summary'),
      _Action(title: tr('calculator') == 'calculator' ? 'Calculator' : tr('calculator'), icon: Icons.calculate, color: const Color(0xFFD97706), bgColor: const Color(0xFFFFFBEB), borderColor: const Color(0xFFFDE68A), path: '/summary'),
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE2E2E2)),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 4)],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: actions.map((action) {
            return GestureDetector(
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
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 4)],
                    ),
                    child: Icon(action.icon, size: 20, color: action.color),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    action.title,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF4F4633),
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
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
  _Action({required this.title, required this.icon, required this.color, required this.bgColor, required this.borderColor, required this.path});
}
