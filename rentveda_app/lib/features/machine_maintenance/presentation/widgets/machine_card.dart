import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/machine_maintenance_provider.dart';
import 'financial_tracker.dart';

class MachineCard extends StatefulWidget {
  final MachineSummary machine;

  const MachineCard({super.key, required this.machine});

  @override
  State<MachineCard> createState() => _MachineCardState();
}

class _MachineCardState extends State<MachineCard> {
  bool _showDetails = false;

  @override
  Widget build(BuildContext context) {
    final m = widget.machine;
    final netProfit = m.calculatedTotalAmount + m.totalIncome - m.totalExpense;
    final isProfit = netProfit >= 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: m.isArchived ? const Color(0xFFFFF7ED) : Colors.white,
        border: Border.all(color: m.isArchived ? const Color(0xFFFDBA74) : AppColors.border),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: Column(
          children: [
            // Entire Header is clickable to expand/collapse
            InkWell(
              borderRadius: BorderRadius.vertical(
                top: const Radius.circular(16),
                bottom: Radius.circular(_showDetails ? 0 : 16),
              ),
              onTap: () {
                setState(() {
                  _showDetails = !_showDetails;
                });
              },
              child: Column(
                children: [
                  // Main Bar
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Image
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: m.image.isNotEmpty
                                ? Image.network(
                                    m.image,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) => const Icon(Icons.handyman, color: Colors.grey),
                                  )
                                : const Icon(Icons.handyman, color: Colors.grey),
                          ),
                        ),
                        const SizedBox(width: 16),

                        // Info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Name & Badge
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      m.name,
                                      style: AppTypography.cardHeader.copyWith(fontWeight: FontWeight.bold),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (m.isArchived)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFFEDD5),
                                        border: Border.all(color: const Color(0xFFFED7AA)),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.archive, size: 10, color: Color(0xFFC2410C)),
                                          const SizedBox(width: 4),
                                          Text(
                                            tr('archivedBadge').toUpperCase(),
                                            style: AppTypography.caption.copyWith(
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                              color: const Color(0xFFC2410C),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 8),

                              // Metrics
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFEFCE8),
                                      border: Border.all(color: const Color(0xFFFEF08A)),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.currency_rupee, size: 12, color: Color(0xFFA16207)),
                                        Text(
                                          m.calculatedTotalAmount.toStringAsFixed(0),
                                          style: AppTypography.caption.copyWith(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: const Color(0xFFA16207),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF3F4F6),
                                      border: Border.all(color: const Color(0xFFE5E7EB)),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.build, size: 10, color: Color(0xFF4B5563)),
                                        const SizedBox(width: 4),
                                        Text(
                                          '${m.calculatedTotalWork.toStringAsFixed(0)} ${m.rentType}',
                                          style: AppTypography.caption.copyWith(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: const Color(0xFF4B5563),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Footer (Net Profit & Toggle)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      border: Border(top: BorderSide(color: AppColors.border)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Net Profit Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isProfit ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                            border: Border.all(color: isProfit ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA)),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.show_chart, size: 14, color: isProfit ? AppColors.successDark : AppColors.danger),
                              const SizedBox(width: 4),
                              Text(
                                '${tr('netProfitLabel')}: ₹${netProfit.toStringAsFixed(0)}',
                                style: AppTypography.caption.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: isProfit ? AppColors.successDark : AppColors.danger,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Toggle Button
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEFCE8),
                            border: Border.all(color: const Color(0xFFFEF08A)),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Text(
                                _showDetails ? tr('hideDetailsButton') : tr('viewDetailsButton'),
                                style: AppTypography.caption.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFFA16207),
                                ),
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                _showDetails ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                size: 14,
                                color: const Color(0xFFA16207),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Collapsible Details
            AnimatedSize(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              child: _showDetails
                  ? FinancialTracker(machineId: m.id, isArchived: m.isArchived)
                  : const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}
