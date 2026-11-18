import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import 'package:url_launcher/url_launcher.dart';

class BillCard extends StatelessWidget {
  final Map<String, dynamic> bill;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onView;

  const BillCard({
    super.key,
    required this.bill,
    required this.onEdit,
    required this.onDelete,
    required this.onView,
  });

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final customerName = bill['customerName']?.toString() ?? 'N/A';
    final mobileNumber = bill['mobileNumber']?.toString() ?? '';
    final address = bill['address']?.toString() ?? bill['customerAddress']?.toString() ?? 'N/A';
    final operatorName = bill['operatorName']?.toString() ?? 'N/A';
    
    final paidAmount = (bill['paidAmount'] ?? 0).toDouble();
    final pendingAmount = (bill['pendingAmount'] ?? 0).toDouble();
    final totalAmount = paidAmount + pendingAmount;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Left Side: Phone Button + Info
          Expanded(
            child: Row(
              children: [
                // Phone Button
                InkWell(
                  onTap: mobileNumber.isNotEmpty ? () => _makePhoneCall(mobileNumber) : null,
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.successBg,
                      border: Border.all(color: AppColors.successBorder),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.phone,
                      size: 20,
                      color: AppColors.success,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              customerName,
                              style: AppTypography.cardHeader.copyWith(fontSize: 14),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (bill['isEdited'] == true || (bill['editCount'] != null && (bill['editCount'] as num) > 0)) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.orange.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: Colors.orange.withValues(alpha: 0.4), width: 0.8),
                              ),
                              child: Text(
                                (bill['editCount'] != null && (bill['editCount'] as num) > 1)
                                    ? 'v${bill['editCount']} (Edited)'
                                    : 'Edited',
                                style: const TextStyle(
                                  fontSize: 9,
                                  color: Colors.deepOrange,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 10, color: AppColors.textMuted),
                          const SizedBox(width: 2),
                          Flexible(
                            child: Text(
                              address,
                              style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 4),
                            child: Text('•', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                          ),
                          const Icon(Icons.person, size: 10, color: AppColors.textMuted),
                          const SizedBox(width: 2),
                          Flexible(
                            child: Text(
                              operatorName,
                              style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
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
          
          // Right Side: Amount + Actions
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Amount
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    tr('totalAmount'),
                    style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted),
                  ),
                  Text(
                    '₹${totalAmount.toStringAsFixed(0)}',
                    style: AppTypography.bodyMain.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 8),
              
              // Edit
              _ActionButton(
                icon: Icons.edit,
                color: Colors.blue,
                onTap: onEdit,
              ),
              const SizedBox(width: 4),
              
              // Delete
              _ActionButton(
                icon: Icons.delete_outline,
                color: AppColors.danger,
                onTap: onDelete,
              ),
              const SizedBox(width: 4),
              
              // View
              _ActionButton(
                icon: Icons.visibility,
                color: Colors.orange,
                onTap: onView,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          border: Border.all(color: color.withValues(alpha: 0.2)),
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: 20,
          color: color,
        ),
      ),
    );
  }
}
