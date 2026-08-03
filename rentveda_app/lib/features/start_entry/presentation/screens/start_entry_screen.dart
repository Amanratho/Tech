import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/start_entry_provider.dart';

class StartEntryScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> extra;
  
  const StartEntryScreen({super.key, required this.extra});

  @override
  ConsumerState<StartEntryScreen> createState() => _StartEntryScreenState();
}

class _StartEntryScreenState extends ConsumerState<StartEntryScreen> {
  // Input Controllers
  final _mobileController = TextEditingController();
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _operatorController = TextEditingController();
  final _jobWorkController = TextEditingController();
  final _priceController = TextEditingController();
  final _qtyController = TextEditingController();
  final _paidController = TextEditingController();
  final _pendingController = TextEditingController();
  
  // State
  bool _isCustomerFound = false;
  double _totalAmount = 0.0;
  
  // Reminder State
  bool _setReminder = false;
  DateTime? _reminderDate;
  final _smsMobileController = TextEditingController();

  late String _machineId;
  late String _machineName;
  late String _rentType;

  @override
  void initState() {
    super.initState();
    _machineId = widget.extra['machineId'] ?? '';
    _machineName = widget.extra['machineName'] ?? 'Machine';
    _rentType = widget.extra['rentType'] ?? 'Hour';
    
    _priceController.addListener(_calculateTotal);
    _qtyController.addListener(_calculateTotal);
    _paidController.addListener(_handlePaidChange);
    _pendingController.addListener(_handlePendingChange);
  }

  @override
  void dispose() {
    _mobileController.dispose();
    _nameController.dispose();
    _addressController.dispose();
    _operatorController.dispose();
    _jobWorkController.dispose();
    _priceController.dispose();
    _qtyController.dispose();
    _paidController.dispose();
    _pendingController.dispose();
    _smsMobileController.dispose();
    super.dispose();
  }

  void _calculateTotal() {
    final price = double.tryParse(_priceController.text) ?? 0.0;
    final qty = double.tryParse(_qtyController.text) ?? 0.0;
    
    double total = 0.0;
    if (_rentType == 'Hour') {
      final hours = qty.floor();
      final minutes = (qty - hours) * 100;
      final totalHours = hours + (minutes / 60);
      total = price * totalHours;
    } else {
      total = price * qty;
    }
    
    setState(() {
      _totalAmount = double.parse(total.toStringAsFixed(2));
      
      // Only reset paid/pending if user isn't actively typing in them.
      // For simplicity, we just set pending to total and paid to 0 on rate/qty change.
      _pendingController.text = _totalAmount.toString();
      _paidController.text = '0';
    });
  }

  void _handlePaidChange() {
    if (_paidController.text.isEmpty) return;
    final paid = double.tryParse(_paidController.text) ?? 0.0;
    if (paid > _totalAmount) {
      _paidController.text = _totalAmount.toString();
      _pendingController.text = '0';
      return;
    }
    final pending = _totalAmount - paid;
    if (_pendingController.text != pending.toStringAsFixed(0) && _pendingController.text != pending.toString()) {
        _pendingController.text = pending % 1 == 0 ? pending.toInt().toString() : pending.toStringAsFixed(2);
    }
  }

  void _handlePendingChange() {
    if (_pendingController.text.isEmpty) return;
    final pending = double.tryParse(_pendingController.text) ?? 0.0;
    if (pending > _totalAmount) {
      _pendingController.text = _totalAmount.toString();
      _paidController.text = '0';
      return;
    }
    final paid = _totalAmount - pending;
    if (_paidController.text != paid.toStringAsFixed(0) && _paidController.text != paid.toString()) {
        _paidController.text = paid % 1 == 0 ? paid.toInt().toString() : paid.toStringAsFixed(2);
    }
  }

  Future<void> _handleMobileChange(String value) async {
    setState(() => _isCustomerFound = false);
    
    if (value.length == 10) {
      final customer = await ref.read(startEntryProvider.notifier).fetchCustomerByMobile(value);
      if (customer != null) {
        setState(() {
          _isCustomerFound = true;
          _nameController.text = customer['customerName'] ?? '';
          _addressController.text = customer['address'] ?? '';
        });
        Fluttertoast.showToast(msg: tr('existingCustomerFound'), backgroundColor: AppColors.successDark);
      }
    }
  }

  Future<void> _selectReminderDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
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
    if (picked != null) {
      setState(() => _reminderDate = picked);
    }
  }

  Future<void> _handleSubmit() async {
    if (_nameController.text.isEmpty || 
        _mobileController.text.isEmpty || 
        _priceController.text.isEmpty || 
        _qtyController.text.isEmpty) {
      Fluttertoast.showToast(msg: tr('fillAllFields'), backgroundColor: AppColors.warningDark);
      return;
    }

    if (_setReminder && _reminderDate == null) {
      Fluttertoast.showToast(msg: tr('selectReminderDate'), backgroundColor: AppColors.warningDark);
      return;
    }

    final entryData = {
      'customerName': _nameController.text,
      'mobileNumber': _mobileController.text,
      'address': _addressController.text,
      'operatorName': _operatorController.text,
      'price': double.tryParse(_priceController.text) ?? 0,
      'quantity': double.tryParse(_qtyController.text) ?? 0,
      'paidAmount': double.tryParse(_paidController.text) ?? 0,
      'pendingAmount': double.tryParse(_pendingController.text) ?? 0,
      'rentType': _rentType,
      'machineId': _machineId,
      'jobWork': _jobWorkController.text,
    };

    if (_setReminder) {
      entryData['reminderDate'] = DateFormat('yyyy-MM-dd').format(_reminderDate!);
      entryData['reminderStatus'] = 'PENDING';
      entryData['customerMobile'] = _smsMobileController.text.isNotEmpty ? _smsMobileController.text : _mobileController.text;
    }

    final success = await ref.read(startEntryProvider.notifier).saveEntry(entryData);

    if (success && mounted) {
      Fluttertoast.showToast(msg: tr('entrySaved'), backgroundColor: AppColors.successDark);
      context.pushReplacement('/invoice', extra: {
        'entryData': entryData,
        'machineName': _machineName,
      });
    } else if (mounted) {
      Fluttertoast.showToast(msg: tr('entryError'), backgroundColor: AppColors.danger);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSaving = ref.watch(startEntryProvider);
    final pendingAmount = double.tryParse(_pendingController.text) ?? 0.0;

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      appBar: AppBar(
        backgroundColor: AppColors.bgMain,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.textMain, size: 20),
          onPressed: () => context.pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(tr('addNewEntry'), style: AppTypography.cardHeader),
            Text('$_machineName • $_rentType', style: AppTypography.badgeText.copyWith(color: AppColors.primaryDark, fontSize: 10)),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AppColors.border, height: 1),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // CUSTOMER DETAILS
                  Text(tr('rentalDetails').toUpperCase(), style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 10, letterSpacing: 1.2)),
                  const SizedBox(height: 12),
                  _buildInput(
                    controller: _mobileController,
                    icon: Icons.phone,
                    hint: tr('enterMobileNumber'),
                    keyboardType: TextInputType.phone,
                    maxLength: 10,
                    onChanged: _handleMobileChange,
                    suffixIcon: _isCustomerFound ? Icons.check_circle : null,
                    suffixColor: AppColors.successDark,
                  ),
                  const SizedBox(height: 12),
                  _buildInput(
                    controller: _nameController,
                    icon: Icons.person,
                    hint: tr('enterCustomerName'),
                  ),
                  const SizedBox(height: 12),
                  _buildInput(
                    controller: _addressController,
                    icon: Icons.location_on,
                    hint: tr('clientAddress'),
                  ),
                  const SizedBox(height: 24),

                  // WORK DETAILS
                  Text(tr('jobWork').toUpperCase(), style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 10, letterSpacing: 1.2)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _buildInput(controller: _operatorController, icon: Icons.engineering, hint: tr('operatorName'))),
                      const SizedBox(width: 12),
                      Expanded(child: _buildInput(controller: _jobWorkController, icon: Icons.build, hint: tr('jobWork'))),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // CALCULATOR & PAYMENT
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.bgSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.calculate, size: 14, color: AppColors.primaryGold),
                            const SizedBox(width: 6),
                            Text(tr('rentalCalculator').toUpperCase(), style: AppTypography.badgeText.copyWith(color: AppColors.primaryGold, fontSize: 10, letterSpacing: 1.2)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        
                        // Rate & Qty
                        Row(
                          children: [
                            Expanded(
                              child: _buildCalcInput(
                                label: tr('rateLabel'),
                                controller: _priceController,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildCalcInput(
                                label: '${tr('qtyLabel')} ($_rentType)',
                                controller: _qtyController,
                              ),
                            ),
                          ],
                        ),
                        
                        // Total Bill
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.only(bottom: 20),
                          decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.border))),
                          child: Column(
                            children: [
                              Text(tr('totalBillAmount').toUpperCase(), style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 10, letterSpacing: 1.2)),
                              const SizedBox(height: 4),
                              Text('₹ ${_totalAmount.toStringAsFixed(2)}', style: AppTypography.cardHeader.copyWith(fontSize: 28)),
                            ],
                          ),
                        ),

                        if (_totalAmount > 0) ...[
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: _buildCalcInput(
                                  label: tr('paidAmount'),
                                  controller: _paidController,
                                  color: AppColors.successDark,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildCalcInput(
                                  label: tr('pendingDue'),
                                  controller: _pendingController,
                                  color: AppColors.danger,
                                ),
                              ),
                            ],
                          ),

                          if (pendingAmount > 0) ...[
                            const SizedBox(height: 20),
                            Container(
                              padding: const EdgeInsets.only(top: 20),
                              decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
                              child: Column(
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(tr('setPaymentReminder'), style: AppTypography.cardHeader.copyWith(fontSize: 12)),
                                          Text(tr('reminderNotifyText'), style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 10)),
                                        ],
                                      ),
                                      Switch(
                                        value: _setReminder,
                                        onChanged: (val) {
                                          setState(() {
                                            _setReminder = val;
                                            if (val && _smsMobileController.text.isEmpty) {
                                              _smsMobileController.text = _mobileController.text;
                                            }
                                          });
                                        },
                                        activeThumbColor: AppColors.primaryGold,
                                      ),
                                    ],
                                  ),
                                  if (_setReminder) ...[
                                    const SizedBox(height: 16),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: GestureDetector(
                                            onTap: _selectReminderDate,
                                            child: _buildInput(
                                              controller: TextEditingController(text: _reminderDate != null ? DateFormat('yyyy-MM-dd').format(_reminderDate!) : ''),
                                              icon: Icons.calendar_today,
                                              hint: tr('reminderModalDateLabel'),
                                              enabled: false,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: _buildInput(
                                            controller: _smsMobileController,
                                            icon: Icons.message,
                                            hint: tr('smsMobilePlaceholder'),
                                            keyboardType: TextInputType.phone,
                                            maxLength: 10,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ]
                                ],
                              ),
                            ),
                          ],
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
          
          // Submit Button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bgSurface.withValues(alpha: 0.95),
              border: const Border(top: BorderSide(color: AppColors.border)),
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4))],
            ),
            child: ElevatedButton(
              onPressed: isSaving ? null : _handleSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.textMain,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                elevation: 2,
              ),
              child: isSaving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryGold))
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.save, size: 18),
                        const SizedBox(width: 8),
                        Text(tr('submitEntry').toUpperCase(), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w800)),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInput({
    required TextEditingController controller,
    required IconData icon,
    required String hint,
    TextInputType? keyboardType,
    int? maxLength,
    ValueChanged<String>? onChanged,
    IconData? suffixIcon,
    Color? suffixColor,
    bool enabled = true,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLength: maxLength,
      onChanged: onChanged,
      enabled: enabled,
      style: AppTypography.bodyMain.copyWith(fontSize: 14),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: AppTypography.bodyMain.copyWith(color: AppColors.textMuted, fontSize: 14),
        prefixIcon: Icon(icon, size: 16, color: AppColors.textMuted),
        suffixIcon: suffixIcon != null ? Icon(suffixIcon, size: 18, color: suffixColor) : null,
        counterText: '',
        filled: true,
        fillColor: AppColors.bgSurface,
        contentPadding: const EdgeInsets.symmetric(vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary)),
        disabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
      ),
    );
  }

  Widget _buildCalcInput({
    required String label,
    required TextEditingController controller,
    Color? color,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: AppTypography.badgeText.copyWith(color: color ?? AppColors.textMuted, fontSize: 10, letterSpacing: 1)),
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          style: AppTypography.bodyMain.copyWith(fontSize: 18, fontWeight: FontWeight.bold, color: color ?? AppColors.textMain),
          decoration: InputDecoration(
            hintText: '0',
            hintStyle: AppTypography.bodyMain.copyWith(color: (color ?? AppColors.textMain).withValues(alpha: 0.3), fontSize: 18, fontWeight: FontWeight.bold),
            prefixText: color != null ? '₹ ' : '',
            prefixStyle: AppTypography.bodyMain.copyWith(fontSize: 18, fontWeight: FontWeight.bold, color: color),
            filled: true,
            fillColor: AppColors.bgMain,
            contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: color ?? AppColors.primary)),
          ),
        ),
      ],
    );
  }
}
