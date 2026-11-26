import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/services.dart';
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

    if (!_isFullyPaid) {
      _priceController.addListener(_recalculateAmounts);
      _quantityController.addListener(_recalculateAmounts);
      _paidController.addListener(_recalculatePending);
    }
  }

  bool get _isFullyPaid {
    final pending = double.tryParse(widget.bill['pendingAmount']?.toString() ?? '0') ?? 0;
    final paid = double.tryParse(widget.bill['paidAmount']?.toString() ?? '0') ?? 0;
    return pending <= 0 && paid > 0;
  }

  double _computeTotal(double price, double qty, String qtyStr) {
    final rentType = widget.bill['rentType']?.toString().toLowerCase() ?? '';
    if (rentType.contains('hour')) {
      final trimmed = qtyStr.trim();
      if (trimmed.contains('.')) {
        final parts = trimmed.split('.');
        final hours = double.tryParse(parts[0]) ?? 0.0;
        final minPart = parts[1].padRight(2, '0').substring(0, 2);
        final mins = double.tryParse(minPart) ?? 0.0;
        final totalHours = hours + (mins / 60.0);
        return price * totalHours;
      }
    }
    return price * qty;
  }

  void _recalculateAmounts() {
    final price = double.tryParse(_priceController.text) ?? 0;
    final qty = double.tryParse(_quantityController.text) ?? 0;
    final total = _computeTotal(price, qty, _quantityController.text);
    final currentPaid = double.tryParse(_paidController.text) ?? 0;
    
    final newPending = total - currentPaid;
    final displayPending = newPending < 0 ? 0.0 : newPending;
    final pendingStr = displayPending % 1 == 0 ? displayPending.toInt().toString() : displayPending.toStringAsFixed(2);
    if (pendingStr != _pendingController.text) {
      _pendingController.text = pendingStr;
    }
    setState(() {}); // Trigger rebuild for total text and validation
  }

  void _recalculatePending() {
    final price = double.tryParse(_priceController.text) ?? 0;
    final qty = double.tryParse(_quantityController.text) ?? 0;
    final total = _computeTotal(price, qty, _quantityController.text);
    final currentPaid = double.tryParse(_paidController.text) ?? 0;
    
    final newPending = total - currentPaid;
    final displayPending = newPending < 0 ? 0.0 : newPending;
    final pendingStr = displayPending % 1 == 0 ? displayPending.toInt().toString() : displayPending.toStringAsFixed(2);
    if (pendingStr != _pendingController.text) {
      _pendingController.text = pendingStr;
    }
    setState(() {});
  }

  bool get _hasError {
    final price = double.tryParse(_priceController.text) ?? 0;
    final qty = double.tryParse(_quantityController.text) ?? 0;
    final total = _computeTotal(price, qty, _quantityController.text);
    final currentPaid = double.tryParse(_paidController.text) ?? 0;
    return currentPaid > total;
  }

  @override
  void dispose() {
    if (!_isFullyPaid) {
      _priceController.removeListener(_recalculateAmounts);
      _quantityController.removeListener(_recalculateAmounts);
      _paidController.removeListener(_recalculatePending);
    }
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
    
    final currentEditCount = (widget.bill['editCount'] as num?)?.toInt() ?? 0;
    final price = double.tryParse(_priceController.text) ?? 0;
    final qty = double.tryParse(_quantityController.text) ?? 0;
    final computedTotal = _computeTotal(price, qty, _quantityController.text);
    final paid = double.tryParse(_paidController.text) ?? 0;
    final pending = double.tryParse(_pendingController.text) ?? 0;

    final formData = {
      '_id': widget.bill['_id'],
      'customerName': _nameController.text,
      'mobileNumber': _mobileController.text,
      'address': _addressController.text,
      'operatorName': _operatorController.text,
      'price': price,
      'quantity': qty,
      'totalAmount': computedTotal,
      'paidAmount': paid,
      'pendingAmount': pending,
      'rentType': widget.bill['rentType'],
      'jobWork': _jobWorkController.text,
      'isEdited': true,
      'editCount': currentEditCount + 1,
    };

    final success = await ref.read(billingHistoryProvider.notifier).editBill(formData);
    
    if (!mounted) return;
    setState(() => _isSaving = false);
    
    if (success) {
      Fluttertoast.showToast(msg: tr('successUpdated'), backgroundColor: AppColors.successDark);
      Navigator.pop(context);
    } else {
      Fluttertoast.showToast(msg: tr('errorFailed'), backgroundColor: AppColors.danger);
    }
  }

  Widget _buildTextField(String label, TextEditingController controller, {bool isNumber = false, Color focusColor = AppColors.primary, bool readOnly = false}) {
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
          readOnly: readOnly,
          keyboardType: isNumber ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.text,
          inputFormatters: isNumber ? [FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*'))] : null,
          style: AppTypography.bodyMain.copyWith(
            fontSize: 12,
            color: readOnly ? AppColors.textMuted : AppColors.textMain,
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: readOnly ? AppColors.border.withValues(alpha: 0.3) : AppColors.bgMain,
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
              borderSide: BorderSide(color: readOnly ? AppColors.border : focusColor, width: 1.5),
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
                      tr('editBill'),
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
                          tr('customerInfo'),
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildTextField(tr('customerName'), _nameController),
                        const SizedBox(height: 12),
                        _buildTextField(tr('mobileNumber'), _mobileController, isNumber: true),
                        const SizedBox(height: 12),
                        _buildTextField(tr('address'), _addressController),
                        const SizedBox(height: 12),
                        _buildTextField(tr('operatorName'), _operatorController),
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
                          tr('pricing'),
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
                            Expanded(child: _buildTextField(tr('priceRs'), _priceController, isNumber: true, readOnly: _isFullyPaid)),
                            const SizedBox(width: 12),
                            Expanded(child: _buildTextField(tr('quantity'), _quantityController, isNumber: true, readOnly: _isFullyPaid)),
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
                              Text(tr('totalAmount'), style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted)),
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
                          tr('payment'),
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
                            Expanded(child: _buildTextField(tr('paidRs'), _paidController, isNumber: true, focusColor: AppColors.success, readOnly: _isFullyPaid)),
                            const SizedBox(width: 12),
                            Expanded(child: _buildTextField(tr('pendingRs'), _pendingController, isNumber: true, focusColor: AppColors.danger, readOnly: true)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _buildTextField(tr('jobWork'), _jobWorkController, readOnly: _isFullyPaid),
                      ],
                    ),
                  ),
                  if (_hasError) ...[
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.error_outline, color: AppColors.danger, size: 14),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Total Amount cannot be less than Paid Amount.',
                            style: AppTypography.caption.copyWith(color: AppColors.danger, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ],
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
                    onPressed: (_isSaving || _hasError) ? null : _handleSave,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.5),
                      foregroundColor: AppColors.textMain,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: _isSaving
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.textMain))
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
