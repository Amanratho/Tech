import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class ClientListItem extends StatelessWidget {
  final Map<String, dynamic> user;
  final VoidCallback onTap;

  const ClientListItem({
    super.key,
    required this.user,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final name = user['customerName'] ?? tr('Unknown');
    final mobile = user['mobileNumber']?.toString() ?? '';
    final pendingAmount = (user['pendingAmount'] ?? 0).toDouble();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgSurface,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 4)],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.bgMain,
                    border: Border.all(color: AppColors.border),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.person_outline, size: 20, color: AppColors.textSubtle),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: AppTypography.cardHeader,
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.phone, size: 10, color: AppColors.textSubtle),
                        const SizedBox(width: 5),
                        Text(
                          mobile,
                          style: AppTypography.caption,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
            Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (pendingAmount > 0) ...[
                      Text(
                        tr('filterPending').toUpperCase(),
                        style: AppTypography.badgeText.copyWith(
                          fontSize: 12,
                          color: AppColors.danger,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '₹${NumberFormat('#,##,###').format(pendingAmount.toInt())}',
                        style: AppTypography.cardHeader.copyWith(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: AppColors.danger,
                        ),
                      ),
                    ] else ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.successBg,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.successBorder),
                        ),
                        child: Text(
                          tr('filterPaid') == 'filterPaid' ? 'Paid' : tr('filterPaid'),
                          style: AppTypography.badgeText.copyWith(
                            fontSize: 12,
                            color: AppColors.successDark,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(width: 4),
                const Icon(Icons.chevron_right, size: 20, color: AppColors.textSubtle),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
