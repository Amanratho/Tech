import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/reminders_provider.dart';

class ConfirmReminderDialog extends ConsumerStatefulWidget {
  final Map<String, dynamic> reminder;
  final String action; // "COMPLETE" or "DELETE"

  const ConfirmReminderDialog({
    super.key,
    required this.reminder,
    required this.action,
  });

  @override
  ConsumerState<ConfirmReminderDialog> createState() => _ConfirmReminderDialogState();
}

class _ConfirmReminderDialogState extends ConsumerState<ConfirmReminderDialog> {
  bool _isLoading = false;

  Future<void> _handleConfirm() async {
    setState(() => _isLoading = true);
    final id = widget.reminder['_id']?.toString() ?? '';
    
    final success = await ref.read(remindersProvider.notifier).performAction(id, widget.action);
    
    setState(() => _isLoading = false);
    
    if (success && mounted) {
      if (widget.action == "COMPLETE") {
        Fluttertoast.showToast(msg: tr('reminderMarkedCompleted'), backgroundColor: AppColors.successDark);
      } else {
        Fluttertoast.showToast(msg: tr('reminderDeletedSuccess'), backgroundColor: AppColors.successDark);
      }
      Navigator.pop(context);
    } else if (mounted) {
      Fluttertoast.showToast(msg: tr('reminderActionFailed'), backgroundColor: AppColors.danger);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isComplete = widget.action == "COMPLETE";
    
    final title = isComplete ? tr('reminderCompleteTitle') : tr('reminderDeleteTitle');
    final message = isComplete ? tr('reminderCompleteConfirmMsg') : tr('reminderDeleteConfirmMsg');
    final confirmText = isComplete ? tr('reminderMarkPaidBtn') : tr('reminderDeleteBtn');
    
    final accentColor = isComplete ? AppColors.successDark : AppColors.danger;
    final accentBgColor = isComplete ? AppColors.successBg : AppColors.dangerBg;
    final icon = isComplete ? Icons.check_circle_outline : Icons.warning_amber_rounded;

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
                color: accentBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 28, color: accentColor),
            ),
            const SizedBox(height: 16),
            
            // Title
            Text(
              title,
              style: AppTypography.cardHeader,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            
            // Message
            Text(
              message,
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
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
                    child: Text(tr('reminderCancelBtn'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleConfirm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: accentColor,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: _isLoading
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(isComplete ? Icons.check : Icons.delete_outline, size: 16),
                              const SizedBox(width: 8),
                              Text(confirmText, style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600, color: Colors.white)),
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
