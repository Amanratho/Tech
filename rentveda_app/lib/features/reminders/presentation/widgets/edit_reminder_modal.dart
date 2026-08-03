import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/reminders_provider.dart';

class EditReminderModal extends ConsumerStatefulWidget {
  final Map<String, dynamic> reminder;

  const EditReminderModal({super.key, required this.reminder});

  @override
  ConsumerState<EditReminderModal> createState() => _EditReminderModalState();
}

class _EditReminderModalState extends ConsumerState<EditReminderModal> {
  late DateTime? _selectedDate;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final dateStr = widget.reminder['reminderDate']?.toString();
    if (dateStr != null && dateStr.isNotEmpty) {
      _selectedDate = DateTime.tryParse(dateStr);
    } else {
      _selectedDate = null;
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final today = DateTime.now();
    final initialDate = _selectedDate != null && _selectedDate!.isAfter(today) ? _selectedDate! : today;

    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: today, // Cannot select past dates
      lastDate: DateTime(2101),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primaryDark,
              onPrimary: Colors.white,
              onSurface: AppColors.textMain,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _handleSave() async {
    if (_selectedDate == null) {
      Fluttertoast.showToast(msg: tr('reminderSelectValidDate'), backgroundColor: AppColors.warningDark);
      return;
    }

    setState(() => _isSaving = true);
    
    final id = widget.reminder['_id']?.toString() ?? '';
    // Format to YYYY-MM-DD
    final formattedDate = DateFormat('yyyy-MM-dd').format(_selectedDate!);
    
    final success = await ref.read(remindersProvider.notifier).updateReminderDate(id, formattedDate);
    
    setState(() => _isSaving = false);
    
    if (success && mounted) {
      Fluttertoast.showToast(msg: tr('reminderUpdatedSuccess'), backgroundColor: AppColors.successDark);
      Navigator.pop(context);
    } else if (mounted) {
      Fluttertoast.showToast(msg: tr('reminderUpdateFailed'), backgroundColor: AppColors.danger);
    }
  }

  @override
  Widget build(BuildContext context) {
    final customerName = widget.reminder['customerName']?.toString() ?? 'N/A';
    final mobileNumber = widget.reminder['customerMobile']?.toString() ?? widget.reminder['mobileNumber']?.toString() ?? 'N/A';
    final pendingAmount = widget.reminder['pendingAmount']?.toString() ?? '0';

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.access_time, color: AppColors.primaryGold, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      tr('reminderEditModalTitle'),
                      style: AppTypography.cardHeader,
                    ),
                  ],
                ),
                InkWell(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const Icon(Icons.close, size: 16, color: AppColors.textMuted),
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Info Box
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.bgMain,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(customerName, style: AppTypography.cardHeader.copyWith(fontSize: 14)),
                      const SizedBox(height: 2),
                      Text(mobileNumber, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 10)),
                      const SizedBox(height: 6),
                      Text(
                        'Due: ₹$pendingAmount',
                        style: AppTypography.bodyMain.copyWith(color: AppColors.successDark, fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Date Picker Input
                Text(
                  tr('reminderNewFollowUpDate'),
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () => _selectDate(context),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: AppColors.bgMain,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _selectedDate == null ? 'Select a date' : DateFormat('dd MMM yyyy').format(_selectedDate!),
                          style: AppTypography.bodyMain.copyWith(
                            color: _selectedDate == null ? AppColors.textSubtle : AppColors.textMain,
                          ),
                        ),
                        const Icon(Icons.calendar_month, color: AppColors.textMuted, size: 20),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          side: const BorderSide(color: AppColors.border),
                        ),
                        child: Text(tr('reminderCancel'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _handleSave,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: AppColors.textMain,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: _isSaving
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                            : Text(tr('reminderSaveDate'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
