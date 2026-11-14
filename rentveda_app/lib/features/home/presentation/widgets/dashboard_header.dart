import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

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
                      style: AppTypography.screenHeader,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      tr('greetingSubtitle'),
                      style: AppTypography.bodySecondary,
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.bgSurface,
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4)],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.calendar_today, size: 13, color: AppColors.primaryGold),
                      const SizedBox(width: 5),
                      Text(
                        DateFormat('dd MMM yyyy').format(today),
                        style: AppTypography.caption.copyWith(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryGold,
                        ),
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
                  valueColor: AppColors.successDark,
                  icon: Icons.account_balance_wallet,
                  iconBg: AppColors.successBg,
                  iconBorder: AppColors.successBorder,
                  iconColor: AppColors.successDark,
                  onTap: onSummaryTap,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MetricCard(
                  title: tr('totalPendingDues').toUpperCase(),
                  value: '₹${NumberFormat('#,##,###').format(totalPending.toInt())}',
                  valueColor: AppColors.dangerDark,
                  icon: Icons.money_off,
                  iconBg: AppColors.dangerBg,
                  iconBorder: AppColors.dangerBorder,
                  iconColor: AppColors.dangerDark,
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
                  valueColor: AppColors.textMain,
                  icon: Icons.receipt_long,
                  iconBg: AppColors.primaryGoldBg,
                  iconBorder: AppColors.warning.withValues(alpha: 0.4),
                  iconColor: AppColors.primaryGold,
                  onTap: onBillsTap,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MetricCard(
                  title: tr('totalMachinesCount').toUpperCase(),
                  value: '${machines.length}',
                  valueColor: AppColors.textMain,
                  icon: Icons.inventory_2,
                  iconBg: AppColors.primaryGoldBg,
                  iconBorder: AppColors.warning.withValues(alpha: 0.4),
                  iconColor: AppColors.primaryGold,
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
                color: AppColors.dangerBg,
                border: Border.all(color: AppColors.dangerBorder),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: AppColors.dangerBg,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.warning_amber_rounded, size: 20, color: AppColors.dangerDark),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          tr('overdueAlertTitle'),
                          style: AppTypography.cardHeader.copyWith(
                            fontSize: 13,
                            color: AppColors.dangerDark,
                          ),
                        ),
                        Text(
                          tr('overdueAlertMsg'),
                          style: AppTypography.caption.copyWith(
                            fontSize: 12,
                            color: AppColors.danger,
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: onPaymentsTap,
                    child: Text(
                      tr('viewDues'),
                      style: AppTypography.buttonText.copyWith(
                        fontSize: 13,
                        color: AppColors.dangerDark,
                      ),
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
          color: AppColors.bgSurface,
          border: Border.all(color: AppColors.border),
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
                  child: Text(
                    title,
                    style: AppTypography.badgeText.copyWith(
                      fontSize: 12,
                      color: AppColors.textDarkBrown,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: iconBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: iconBorder),
                  ),
                  child: Icon(icon, size: 15, color: iconColor),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: AppTypography.screenHeader.copyWith(
                fontSize: 20,
                color: valueColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
