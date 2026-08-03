import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/billing_history_provider.dart';

class DeleteBillDialog extends ConsumerStatefulWidget {
  final Map<String, dynamic> bill;

  const DeleteBillDialog({super.key, required this.bill});

  @override
  ConsumerState<DeleteBillDialog> createState() => _DeleteBillDialogState();
}

class _DeleteBillDialogState extends ConsumerState<DeleteBillDialog> {
  bool _isDeleting = false;

  Future<void> _handleDelete() async {
    setState(() => _isDeleting = true);
    final id = widget.bill['_id']?.toString() ?? '';
    
    final success = await ref.read(billingHistoryProvider.notifier).deleteBill(id);
    
    setState(() => _isDeleting = false);
    
    if (success && mounted) {
      Fluttertoast.showToast(msg: tr('successUpdated'), backgroundColor: AppColors.successDark);
      Navigator.pop(context);
    } else if (mounted) {
      Fluttertoast.showToast(msg: tr('errorFailed'), backgroundColor: AppColors.danger);
    }
  }

  @override
  Widget build(BuildContext context) {
    final customerName = widget.bill['customerName']?.toString() ?? 'N/A';
    final amount = ((widget.bill['paidAmount'] ?? 0) + (widget.bill['pendingAmount'] ?? 0)).toString();

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: AppColors.bgSurface,
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.dangerBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.warning_amber_rounded, size: 28, color: AppColors.danger),
            ),
            const SizedBox(height: 16),
            
            // Title
            Text(
              tr('deleteBillTitle'),
              style: AppTypography.cardHeader,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            
            // Message
            Text(
              tr('deleteBillMessage'),
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              customerName,
              style: AppTypography.bodyMain.copyWith(color: AppColors.primaryDark, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              '${tr('billAmount')}$amount',
              style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 10),
              textAlign: TextAlign.center,
            ),
            
            const SizedBox(height: 24),
            
            // Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      side: const BorderSide(color: AppColors.border),
                    ),
                    child: Text(tr('cancelButton'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isDeleting ? null : _handleDelete,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.danger,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: _isDeleting
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.delete_outline, size: 16),
                              const SizedBox(width: 8),
                              Text(tr('deleteButton'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600, color: Colors.white)),
                            ],
                          ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
