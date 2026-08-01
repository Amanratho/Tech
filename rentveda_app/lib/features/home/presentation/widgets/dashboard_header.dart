import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:easy_localization/easy_localization.dart';

class DashboardHeader extends StatelessWidget {
  final List<dynamic> payments;
  final List<dynamic> reminders;
  final List<dynamic> machines;
  final VoidCallback? onSummaryTap;
  final VoidCallback? onPaymentsTap;
  final VoidCallback? onBillsTap;
  final VoidCallback? onMachinesTap;

  const DashboardHeader({
    super.key,
    required this.payments,
    required this.reminders,
    required this.machines,
    this.onSummaryTap,
    this.onPaymentsTap,
    this.onBillsTap,
    this.onMachinesTap,
  });

  @override
  Widget build(BuildContext context) {
    // Calculate greeting
    final hour = DateTime.now().hour;
    String greetingKey;
    if (hour < 12) {
      greetingKey = 'greetingMorning';
    } else if (hour < 17) {
      greetingKey = 'greetingAfternoon';
    } else {
      greetingKey = 'greetingEvening';
    }

    // Calculate metrics
    double todayIncome = 0;
    int todayEntries = 0;
    double totalPending = 0;
    final today = DateTime.now();

    for (var p in payments) {
      final createdAt = DateTime.tryParse(p['createdAt'] ?? '');
      if (createdAt != null &&
          createdAt.year == today.year &&
          createdAt.month == today.month &&
          createdAt.day == today.day) {
        todayIncome += (p['paidAmount'] ?? 0).toDouble();
        todayEntries++;
      }
      totalPending += (p['pendingAmount'] ?? 0).toDouble();
    }

    // Overdue reminders
    int overdueCount = 0;
    for (var r in reminders) {
      final reminderDate = DateTime.tryParse(r['reminderDate'] ?? '');
      if (reminderDate != null && reminderDate.isBefore(today)) {
        overdueCount++;
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting + Date
          GestureDetector(
            onTap: onSummaryTap,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tr(greetingKey),
                      style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF1A1C1C)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      tr('greetingSubtitle'),
                      style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF4F4633), fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE2E2E2)),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4)],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.calendar_today, size: 12, color: Color(0xFF795900)),
                      const SizedBox(width: 4),
                      Text(
                        DateFormat('dd MMM yyyy').format(today),
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF795900)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 2x2 Metric Cards
          Row(
            children: [
              Expanded(
                child: _MetricCard(
                  title: tr('todayIncome').toUpperCase(),
                  value: '₹${NumberFormat('#,##,###').format(todayIncome.toInt())}',
                  valueColor: const Color(0xFF16A34A),
                  icon: Icons.account_balance_wallet,
                  iconBg: const Color(0xFFDCFCE7),
                  iconBorder: const Color(0xFFBBF7D0),
                  iconColor: const Color(0xFF16A34A),
                  onTap: onSummaryTap,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MetricCard(
                  title: tr('totalPendingDues').toUpperCase(),
                  value: '₹${NumberFormat('#,##,###').format(totalPending.toInt())}',
                  valueColor: const Color(0xFFDC2626),
                  icon: Icons.money_off,
                  iconBg: const Color(0xFFFEE2E2),
                  iconBorder: const Color(0xFFFECACA),
                  iconColor: const Color(0xFFDC2626),
                  onTap: onPaymentsTap,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _MetricCard(
                  title: tr('activeWorkEntries').toUpperCase(),
                  value: '$todayEntries',
                  valueColor: const Color(0xFF1A1C1C),
                  icon: Icons.receipt_long,
                  iconBg: const Color(0xFFFFFDF0),
                  iconBorder: const Color(0xFFFBC02D).withValues(alpha: 0.4),
                  iconColor: const Color(0xFF795900),
                  onTap: onBillsTap,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MetricCard(
                  title: tr('totalMachinesCount').toUpperCase(),
                  value: '${machines.length}',
                  valueColor: const Color(0xFF1A1C1C),
                  icon: Icons.inventory_2,
                  iconBg: const Color(0xFFFFFDF0),
                  iconBorder: const Color(0xFFFBC02D).withValues(alpha: 0.4),
                  iconColor: const Color(0xFF795900),
                  onTap: onMachinesTap,
                ),
              ),
            ],
          ),

          // Overdue Alert
          if (overdueCount > 0) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                border: Border.all(color: const Color(0xFFFECACA)),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.warning_amber_rounded, size: 18, color: Color(0xFFDC2626)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          tr('overdueAlertTitle'),
                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF991B1B)),
                        ),
                        Text(
                          tr('overdueAlertMsg'),
                          style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFFB91C1C)),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: onPaymentsTap,
                    child: Text(
                      tr('viewDues'),
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFFDC2626)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final Color valueColor;
  final IconData icon;
  final Color iconBg;
  final Color iconBorder;
  final Color iconColor;
  final VoidCallback? onTap;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.valueColor,
    required this.icon,
    required this.iconBg,
    required this.iconBorder,
    required this.iconColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE2E2E2)),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 4)],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Flexible(
                  child: Text(title,
                    style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: const Color(0xFF4F4633), letterSpacing: 0.5),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: iconBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: iconBorder),
                  ),
                  child: Icon(icon, size: 14, color: iconColor),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(value, style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: valueColor)),
          ],
        ),
      ),
    );
  }
}
