import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class CollectPaymentDialog extends StatefulWidget {
  final Map<String, dynamic> entry;
  final Function(double, String, String) onSubmit;

  const CollectPaymentDialog({
    super.key,
    required this.entry,
    required this.onSubmit,
  });

  @override
  State<CollectPaymentDialog> createState() => _CollectPaymentDialogState();
}

class _CollectPaymentDialogState extends State<CollectPaymentDialog> {
  late TextEditingController _nameController;
  late TextEditingController _mobileController;
  late TextEditingController _amountController;
  
  late double pendingAmount;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.entry['customerName'] ?? '');
    _mobileController = TextEditingController(text: widget.entry['mobileNumber']?.toString() ?? '');
    
    pendingAmount = double.tryParse(widget.entry['pendingAmount']?.toString() ?? '') ?? 0.0;
    _amountController = TextEditingController(
      text: pendingAmount % 1 == 0 ? pendingAmount.toInt().toString() : pendingAmount.toStringAsFixed(2),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: AppColors.bgSurface,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  tr('collectPayment'),
                  style: AppTypography.sectionHeader,
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: AppColors.bgMain,
                      border: Border.all(color: AppColors.border),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, size: 16, color: AppColors.textDarkBrown),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Input fields (read-only, just for display)
            Text(tr('customerName'), style: AppTypography.bodySecondary),
            const SizedBox(height: 4),
            _buildTextField(_nameController, readOnly: true),
            const SizedBox(height: 12),

            Text(tr('mobileNumber'), style: AppTypography.bodySecondary),
            const SizedBox(height: 4),
            _buildTextField(_mobileController, keyboardType: TextInputType.phone, readOnly: true),
            const SizedBox(height: 16),

            // Pending amount display
            Text(tr('pendingAmount'), style: AppTypography.bodySecondary),
            const SizedBox(height: 4),
            Text(
              '₹${pendingAmount % 1 == 0 ? pendingAmount.toInt() : pendingAmount.toStringAsFixed(2)}',
              style: AppTypography.screenHeader.copyWith(
                fontSize: 20,
                color: AppColors.danger,
              ),
            ),
            const SizedBox(height: 16),

            // Payment Amount Input
            Text(tr('pendingAmount') == 'pendingAmount' ? 'Enter Payment Amount' : tr('pendingAmount'), style: AppTypography.bodySecondary),
            const SizedBox(height: 4),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: AppTypography.bodyMain.copyWith(fontSize: 15, fontWeight: FontWeight.w700),
              decoration: InputDecoration(
                prefixText: '₹ ',
                prefixStyle: AppTypography.bodyMain.copyWith(color: AppColors.textSubtle),
                filled: true,
                fillColor: AppColors.bgMain,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderFocus, width: 2)),
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  final amount = double.tryParse(_amountController.text) ?? 0;
                  if (amount > 0 && amount <= pendingAmount) {
                    widget.onSubmit(amount, _nameController.text, _mobileController.text);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(
                  tr('submit'),
                  style: AppTypography.buttonText.copyWith(color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, {TextInputType keyboardType = TextInputType.text, bool readOnly = false}) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      readOnly: readOnly,
      enabled: !readOnly,
      style: AppTypography.bodyMain.copyWith(
        color: readOnly ? AppColors.textMuted : AppColors.textMain,
      ),
      decoration: InputDecoration(
        filled: true,
        fillColor: readOnly ? AppColors.bgMain.withValues(alpha: 0.5) : AppColors.bgMain,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
        disabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.borderFocus, width: 2)),
      ),
    );
  }
}
