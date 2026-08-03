import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/billing_history_provider.dart';

class EditBillSheet extends ConsumerStatefulWidget {
  final Map<String, dynamic> bill;

  const EditBillSheet({super.key, required this.bill});

  @override
  ConsumerState<EditBillSheet> createState() => _EditBillSheetState();
}

class _EditBillSheetState extends ConsumerState<EditBillSheet> {
  late TextEditingController _nameController;
  late TextEditingController _mobileController;
  late TextEditingController _addressController;
  late TextEditingController _operatorController;
  late TextEditingController _priceController;
  late TextEditingController _quantityController;
  late TextEditingController _paidController;
  late TextEditingController _pendingController;
  late TextEditingController _jobWorkController;

  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.bill['customerName']?.toString() ?? '');
    _mobileController = TextEditingController(text: widget.bill['mobileNumber']?.toString() ?? '');
    _addressController = TextEditingController(text: widget.bill['address']?.toString() ?? widget.bill['customerAddress']?.toString() ?? '');
    _operatorController = TextEditingController(text: widget.bill['operatorName']?.toString() ?? '');
    
    _priceController = TextEditingController(text: widget.bill['price']?.toString() ?? '');
    _quantityController = TextEditingController(text: widget.bill['quantity']?.toString() ?? '');
    
    _paidController = TextEditingController(text: widget.bill['paidAmount']?.toString() ?? '0');
    _pendingController = TextEditingController(text: widget.bill['pendingAmount']?.toString() ?? '0');
    
    _jobWorkController = TextEditingController(text: widget.bill['jobWork']?.toString() ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _addressController.dispose();
    _operatorController.dispose();
    _priceController.dispose();
    _quantityController.dispose();
    _paidController.dispose();
    _pendingController.dispose();
    _jobWorkController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    setState(() => _isSaving = true);
    
    final formData = {
      '_id': widget.bill['_id'],
      'customerName': _nameController.text,
      'mobileNumber': _mobileController.text,
      'address': _addressController.text,
      'operatorName': _operatorController.text,
      'price': double.tryParse(_priceController.text) ?? 0,
      'quantity': double.tryParse(_quantityController.text) ?? 0,
      'paidAmount': double.tryParse(_paidController.text) ?? 0,
      'pendingAmount': double.tryParse(_pendingController.text) ?? 0,
      'jobWork': _jobWorkController.text,
    };

    final success = await ref.read(billingHistoryProvider.notifier).editBill(formData);
    
    setState(() => _isSaving = false);
    
    if (success && mounted) {
      Fluttertoast.showToast(msg: tr('successUpdated'), backgroundColor: AppColors.successDark);
      Navigator.pop(context);
    } else if (mounted) {
      Fluttertoast.showToast(msg: tr('errorFailed'), backgroundColor: AppColors.danger);
    }
  }

  Widget _buildTextField(String label, TextEditingController controller, {bool isNumber = false, Color focusColor = AppColors.primary}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 10),
        ),
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          keyboardType: isNumber ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.text,
          style: AppTypography.bodyMain.copyWith(fontSize: 12),
          decoration: InputDecoration(
            filled: true,
            fillColor: AppColors.bgMain,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: focusColor, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    // Auto calculate total
    final price = double.tryParse(_priceController.text) ?? 0;
    final qty = double.tryParse(_quantityController.text) ?? 0;
    final total = price * qty;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.bgMain,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: AppColors.bgSurface,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              border: Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.edit, color: AppColors.primary, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'Edit Bill', // Keeping English as per React code for this specific modal title
                      style: AppTypography.cardHeader.copyWith(fontSize: 14),
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

          // Scrollable Form
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Customer Info
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.bgSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CUSTOMER INFO',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildTextField('Customer Name', _nameController),
                        const SizedBox(height: 12),
                        _buildTextField('Mobile Number', _mobileController, isNumber: true),
                        const SizedBox(height: 12),
                        _buildTextField('Address', _addressController),
                        const SizedBox(height: 12),
                        _buildTextField('Operator Name', _operatorController),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Pricing
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.bgSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'PRICING',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(child: _buildTextField('Price (₹)', _priceController, isNumber: true)),
                            const SizedBox(width: 12),
                            Expanded(child: _buildTextField('Quantity', _quantityController, isNumber: true)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.bgMain,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Total Amount', style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted)),
                              Text(
                                '₹${total.toStringAsFixed(0)}',
                                style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w700, color: AppColors.primaryDark),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Payment
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.bgSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'PAYMENT',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(child: _buildTextField('Paid (₹)', _paidController, isNumber: true, focusColor: AppColors.success)),
                            const SizedBox(width: 12),
                            Expanded(child: _buildTextField('Pending (₹)', _pendingController, isNumber: true, focusColor: AppColors.danger)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _buildTextField('Job Work', _jobWorkController),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Footer Buttons
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.bgSurface,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: Row(
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
                    onPressed: _isSaving ? null : _handleSave,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.textMain,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: _isSaving
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.check, size: 16),
                              const SizedBox(width: 8),
                              Text(tr('saveButton'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600)),
                            ],
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
