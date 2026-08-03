import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class TransactionHistorySheet extends StatelessWidget {
  final List<dynamic> entries;
  final String clientName;
  final Function(Map<String, dynamic>) onCollectPayment;

  const TransactionHistorySheet({
    super.key,
    required this.entries,
    required this.clientName,
    required this.onCollectPayment,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.bgMain,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: const BoxDecoration(
              color: AppColors.bgMain,
              border: Border(bottom: BorderSide(color: AppColors.border)),
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Icon(Icons.arrow_back, size: 22, color: AppColors.textMain),
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      clientName,
                      style: AppTypography.sectionHeader,
                    ),
                    Text(
                      tr('billsHistory'),
                      style: AppTypography.bodySecondary,
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: entries.length,
              itemBuilder: (context, index) {
                final entry = entries[index] as Map<String, dynamic>;
                final createdAt = DateTime.tryParse(entry['createdAt'] ?? '') ?? DateTime.now();
                final pendingAmount = (entry['pendingAmount'] ?? 0).toDouble();
                final totalAmount = (entry['totalAmount'] ?? 0).toDouble();

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.bgSurface,
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 4)],
                  ),
                  child: Column(
                    children: [
                      // Top Row (Date and Badge)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            DateFormat('dd MMM yyyy').format(createdAt),
                            style: AppTypography.caption,
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: pendingAmount <= 0 ? AppColors.successBg : AppColors.dangerBg,
                              border: Border.all(color: pendingAmount <= 0 ? AppColors.successBorder : AppColors.dangerBorder),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  pendingAmount <= 0 ? Icons.check_circle : Icons.error,
                                  size: 12,
                                  color: pendingAmount <= 0 ? AppColors.successDark : AppColors.dangerDark,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  pendingAmount <= 0 ? (tr('filterPaid') == 'filterPaid' ? 'Paid' : tr('filterPaid')) : (tr('filterPending') == 'filterPending' ? 'Pending' : tr('filterPending')),
                                  style: AppTypography.badgeText.copyWith(
                                    fontSize: 12,
                                    color: pendingAmount <= 0 ? AppColors.successDark : AppColors.dangerDark,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Middle Row (Amounts)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(tr('total'), style: AppTypography.bodySecondary.copyWith(fontSize: 12)),
                              const SizedBox(height: 2),
                              Text('₹${totalAmount.toInt()}', style: AppTypography.cardHeader.copyWith(fontSize: 15)),
                            ],
                          ),
                          if (pendingAmount > 0)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(tr('pendingAmount'), style: AppTypography.bodySecondary.copyWith(fontSize: 12, color: AppColors.dangerDark)),
                                const SizedBox(height: 2),
                                Text('₹${pendingAmount.toInt()}', style: AppTypography.screenHeader.copyWith(fontSize: 16, color: AppColors.danger)),
                              ],
                            )
                          else
                            Text(tr('filterPaid') == 'filterPaid' ? 'Paid' : tr('filterPaid'), style: AppTypography.cardHeader.copyWith(fontSize: 15, color: AppColors.successDark)),
                        ],
                      ),

                      // Collect Button
                      if (pendingAmount > 0) ...[
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => onCollectPayment(entry),
                            icon: const Icon(Icons.money, size: 18),
                            label: Text(tr('submit') == 'submit' ? 'Collect Payment' : 'Collect Payment'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: AppColors.textMain,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              textStyle: AppTypography.buttonText.copyWith(fontSize: 14),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
