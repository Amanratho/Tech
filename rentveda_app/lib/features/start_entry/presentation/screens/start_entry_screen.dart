import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter_contacts/flutter_contacts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/top_app_bar.dart';
import '../../providers/start_entry_provider.dart';
import '../../../tracker/providers/tracker_provider.dart';

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
  final _reminderDateController = TextEditingController();

  bool _isUpdatingPayment = false;

  // Tracker History Sessions
  List<Map<String, dynamic>> _unbilledTrackerSessions = [];
  String? _selectedTrackerSessionId;

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

    _autoFillFromTracker();
    _loadLastRate();
  }

  Future<void> _loadLastRate() async {
    final prefs = await SharedPreferences.getInstance();
    final lastRate = prefs.getString('last_rate_$_machineId');
    if (lastRate != null && lastRate.isNotEmpty) {
      if (mounted) {
        setState(() {
          _priceController.text = lastRate;
        });
      }
    }
  }

  String? _getTrackerTypeForRentType() {
    final lower = _rentType.toLowerCase();
    if (lower == 'hour') return 'TIME';
    if (['count', 'trip', 'load'].contains(lower)) return 'COUNT';
    if (lower == 'km' || lower == 'distance') return 'DISTANCE';
    if (lower == 'acre' || lower == 'byacre' || lower == 'by_acre') return 'AREA';
    return null;
  }

  String _formatSessionToQtyText(Map<String, dynamic> session, String? trackerType) {
    final type = session['type']?.toString().toUpperCase() ?? trackerType ?? '';
    final rawValue = session['rawValue']?.toString() ?? '';
    final value = session['value']?.toString() ?? '';
    final rawQty = session['qty'];

    if (type == 'TIME') {
      int totalSeconds = 0;
      final parsedSecs = int.tryParse(rawValue);
      if (parsedSecs != null && parsedSecs > 0) {
        totalSeconds = parsedSecs;
      } else {
        final timeStr = value.contains(':') ? value : rawValue;
        if (timeStr.contains(':')) {
          final parts = timeStr.split(':');
          if (parts.length >= 2) {
            final h = int.tryParse(parts[0]) ?? 0;
            final m = int.tryParse(parts[1]) ?? 0;
            final s = parts.length > 2 ? (int.tryParse(parts[2]) ?? 0) : 0;
            totalSeconds = (h * 3600) + (m * 60) + s;
          }
        }
      }

      if (totalSeconds > 0) {
        final hrs = totalSeconds ~/ 3600;
        final mins = (totalSeconds % 3600) ~/ 60;
        return '$hrs.${mins.toString().padLeft(2, '0')}';
      }

      final q = double.tryParse(rawQty?.toString() ?? '');
      if (q != null && q > 0) {
        return q.toStringAsFixed(2);
      }
      return '0.00';
    } else if (type == 'COUNT') {
      final count = int.tryParse(rawValue.isNotEmpty ? rawValue : value) ??
          (double.tryParse(rawQty?.toString() ?? '')?.toInt());
      return (count ?? 0).toString();
    } else if (type == 'DISTANCE') {
      final cleaned = (rawValue.isNotEmpty ? rawValue : value).replaceAll(RegExp(r'[^0-9.]'), '');
      final dist = double.tryParse(cleaned) ?? double.tryParse(rawQty?.toString() ?? '') ?? 0.0;
      return dist.toStringAsFixed(2);
    } else if (type == 'AREA') {
      final cleaned = (rawValue.isNotEmpty ? rawValue : value).replaceAll(RegExp(r'[^0-9.]'), '');
      final acres = double.tryParse(cleaned) ?? double.tryParse(rawQty?.toString() ?? '') ?? 0.0;
      return acres.toStringAsFixed(2);
    }
    return '0';
  }

  Future<void> _autoFillFromTracker() async {
    if (!mounted) return;
    final trackerType = _getTrackerTypeForRentType();
    if (trackerType == null) return;

    final sessions = await TrackerNotifier.getUnbilledSessionsByType(trackerType, limit: 5);
    if (!mounted) return;

    setState(() {
      _unbilledTrackerSessions = sessions;
    });

    if (sessions.isNotEmpty) {
      final latest = sessions.first;
      final qtyText = _formatSessionToQtyText(latest, trackerType);
      if (qtyText != '0' && qtyText != '0.00' && (_qtyController.text.isEmpty || _qtyController.text == '0' || _qtyController.text == '0.00')) {
        setState(() {
          _selectedTrackerSessionId = latest['id']?.toString();
          _qtyController.text = qtyText;
        });
        _calculateTotal();
        Fluttertoast.showToast(msg: tr('autofilledFromTracker'), backgroundColor: AppColors.primaryGold);
      }
    } else {
      // Legacy fallback (without deleting on screen open)
      final prefs = await SharedPreferences.getInstance();
      if (trackerType == 'TIME') {
        final time = prefs.getInt('rentveda_pending_time_entry');
        if (time != null && (_qtyController.text.isEmpty || _qtyController.text == '0')) {
          final hrs = time ~/ 3600;
          final mins = (time % 3600) ~/ 60;
          _qtyController.text = '$hrs.${mins.toString().padLeft(2, '0')}';
          _calculateTotal();
          Fluttertoast.showToast(msg: tr('autofilledFromTracker'), backgroundColor: AppColors.primaryGold);
        }
      } else if (trackerType == 'COUNT') {
        final count = prefs.getInt('rentveda_pending_count_entry');
        if (count != null && (_qtyController.text.isEmpty || _qtyController.text == '0')) {
          _qtyController.text = count.toString();
          _calculateTotal();
          Fluttertoast.showToast(msg: tr('autofilledFromTracker'), backgroundColor: AppColors.primaryGold);
        }
      } else if (trackerType == 'DISTANCE') {
        final km = prefs.getDouble('rentveda_pending_km_entry');
        if (km != null && (_qtyController.text.isEmpty || _qtyController.text == '0')) {
          _qtyController.text = km.toStringAsFixed(2);
          _calculateTotal();
          Fluttertoast.showToast(msg: tr('autofilledFromTracker'), backgroundColor: AppColors.primaryGold);
        }
      } else if (trackerType == 'AREA') {
        final acres = prefs.getDouble('rentveda_pending_acre_entry');
        if (acres != null && (_qtyController.text.isEmpty || _qtyController.text == '0')) {
          _qtyController.text = acres.toStringAsFixed(2);
          _calculateTotal();
          Fluttertoast.showToast(msg: tr('autofilledFromTracker'), backgroundColor: AppColors.primaryGold);
        }
      }
    }
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
    _reminderDateController.dispose();
    super.dispose();
  }

  void _resetReminder() {
    _setReminder = false;
    _reminderDate = null;
    _reminderDateController.clear();
  }

  void _syncReminderWithPendingAmount() {
    final pending = double.tryParse(_pendingController.text) ?? 0.0;
    if (pending <= 0) {
      if (_setReminder || _reminderDate != null) {
        _resetReminder();
      }
    }
  }

  void _calculateTotal() {
    final price = double.tryParse(_priceController.text) ?? 0.0;
    final qty = double.tryParse(_qtyController.text) ?? 0.0;
    
    double total = 0.0;
    if (_rentType.toLowerCase().contains('hour')) {
      final qtyStr = _qtyController.text.trim();
      if (qtyStr.contains('.')) {
        final parts = qtyStr.split('.');
        final hours = double.tryParse(parts[0]) ?? 0.0;
        final minPart = parts[1].padRight(2, '0').substring(0, 2);
        final mins = double.tryParse(minPart) ?? 0.0;
        final totalHours = hours + (mins / 60.0);
        total = price * totalHours;
      } else {
        total = price * qty;
      }
    } else {
      total = price * qty;
    }
    
    setState(() {
      _totalAmount = double.parse(total.toStringAsFixed(2));
      
      _isUpdatingPayment = true;
      try {
        _pendingController.text = _totalAmount % 1 == 0 ? _totalAmount.toInt().toString() : _totalAmount.toString();
        _paidController.text = '0';
        if (_totalAmount <= 0) {
          _resetReminder();
        }
      } finally {
        _isUpdatingPayment = false;
      }
    });
  }

  void _handlePaidChange() {
    if (_isUpdatingPayment) return;
    _isUpdatingPayment = true;
    try {
      if (_paidController.text.isEmpty) {
        final pending = _totalAmount;
        final pendingStr = pending % 1 == 0 ? pending.toInt().toString() : pending.toStringAsFixed(2);
        if (_pendingController.text != pendingStr) {
          _pendingController.text = pendingStr;
        }
      } else {
        final paid = double.tryParse(_paidController.text) ?? 0.0;
        if (paid >= _totalAmount) {
          if (paid > _totalAmount) {
            final totalStr = _totalAmount % 1 == 0 ? _totalAmount.toInt().toString() : _totalAmount.toString();
            _paidController.text = totalStr;
          }
          _pendingController.text = '0';
        } else {
          final pending = _totalAmount - paid;
          final pendingStr = pending % 1 == 0 ? pending.toInt().toString() : pending.toStringAsFixed(2);
          if (_pendingController.text != pendingStr) {
            _pendingController.text = pendingStr;
          }
        }
      }
      _syncReminderWithPendingAmount();
      if (mounted) setState(() {});
    } finally {
      _isUpdatingPayment = false;
    }
  }

  void _handlePendingChange() {
    if (_isUpdatingPayment) return;
    _isUpdatingPayment = true;
    try {
      if (_pendingController.text.isEmpty) {
        final paid = _totalAmount;
        final paidStr = paid % 1 == 0 ? paid.toInt().toString() : paid.toStringAsFixed(2);
        if (_paidController.text != paidStr) {
          _paidController.text = paidStr;
        }
      } else {
        final pending = double.tryParse(_pendingController.text) ?? 0.0;
        if (pending >= _totalAmount) {
          if (pending > _totalAmount) {
            final totalStr = _totalAmount % 1 == 0 ? _totalAmount.toInt().toString() : _totalAmount.toString();
            _pendingController.text = totalStr;
          }
          _paidController.text = '0';
        } else {
          final paid = _totalAmount - pending;
          final paidStr = paid % 1 == 0 ? paid.toInt().toString() : paid.toStringAsFixed(2);
          if (_paidController.text != paidStr) {
            _paidController.text = paidStr;
          }
        }
      }
      _syncReminderWithPendingAmount();
      if (mounted) setState(() {});
    } finally {
      _isUpdatingPayment = false;
    }
  }

  Future<void> _pickContact() async {
    bool hasPermission = await FlutterContacts.permissions.has(PermissionType.read);
    if (!hasPermission) {
      final status = await FlutterContacts.permissions.request(PermissionType.read);
      hasPermission = status == PermissionStatus.granted || status == PermissionStatus.limited;
    }
    
    if (hasPermission) {
      final contact = await FlutterContacts.native.showPicker();
      if (contact != null && contact.id != null) {
        final fullContact = await FlutterContacts.get(contact.id!, properties: ContactProperties.allProperties);
        if (fullContact != null) {
          if (fullContact.phones.isNotEmpty) {
            String phone = fullContact.phones.first.number;
            phone = phone.replaceAll(RegExp(r'\D'), '');
            if (phone.length > 10) {
              phone = phone.substring(phone.length - 10);
            }
            _mobileController.text = phone;
            _handleMobileChange(phone);
          }
          if (fullContact.displayName != null && fullContact.displayName!.isNotEmpty) {
            _nameController.text = fullContact.displayName!;
          }
        }
      }
    } else {
      if (mounted) {
        Fluttertoast.showToast(
          msg: tr('contactPermissionRequired'),
          backgroundColor: AppColors.danger,
          textColor: Colors.white,
        );
      }
    }
  }

  Future<void> _handleMobileChange(String value) async {
    setState(() => _isCustomerFound = false);
    
    if (value.length == 10) {
      final customer = await ref.read(startEntryProvider.notifier).fetchCustomerByMobile(value);
      if (!mounted) return;
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
      setState(() {
        _reminderDate = picked;
        _reminderDateController.text = DateFormat('yyyy-MM-dd').format(picked);
      });
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

    final pendingAmount = double.tryParse(_pendingController.text) ?? 0.0;

    // If there is no pending amount, reminder is not needed
    if (pendingAmount <= 0) {
      _resetReminder();
    }

    // Reminder date is only validated if there is pending amount and reminder is active
    if (pendingAmount > 0 && _setReminder && _reminderDate == null) {
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
      'pendingAmount': pendingAmount,
      'rentType': _rentType,
      'machineId': _machineId,
      'jobWork': _jobWorkController.text,
    };

    if (pendingAmount > 0 && _setReminder && _reminderDate != null) {
      entryData['reminderDate'] = DateFormat('yyyy-MM-dd').format(_reminderDate!);
      entryData['reminderStatus'] = 'PENDING';
      entryData['customerMobile'] = _smsMobileController.text.isNotEmpty ? _smsMobileController.text : _mobileController.text;
    }

    final success = await ref.read(startEntryProvider.notifier).saveEntry(entryData);

    if (success && mounted) {
      if (_selectedTrackerSessionId != null) {
        await TrackerNotifier.markSessionBilled(_selectedTrackerSessionId!);
      }
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('last_rate_$_machineId', _priceController.text);
      await prefs.remove('rentveda_pending_time_entry');
      await prefs.remove('rentveda_pending_count_entry');
      await prefs.remove('rentveda_pending_km_entry');
      if (!mounted) return;

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
      appBar: const RentVedaAppBar(showBackButton: true),
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
                    suffixWidget: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (_isCustomerFound)
                          const Padding(
                            padding: EdgeInsets.only(right: 8.0),
                            child: Icon(Icons.check_circle, size: 18, color: AppColors.successDark),
                          ),
                        IconButton(
                          icon: const Icon(Icons.contacts, color: AppColors.primary),
                          onPressed: _pickContact,
                          constraints: const BoxConstraints(),
                          padding: const EdgeInsets.only(right: 12.0),
                        ),
                      ],
                    ),
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
                                suffixWidget: _buildTrackerDropdown(),
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
                                            if (!val) {
                                              _reminderDate = null;
                                              _reminderDateController.clear();
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
                                              controller: _reminderDateController,
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
    Widget? suffixWidget,
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
        suffixIcon: suffixWidget ?? (suffixIcon != null ? Icon(suffixIcon, size: 18, color: suffixColor) : null),
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

  Widget? _buildTrackerDropdown() {
    if (_unbilledTrackerSessions.isEmpty) return null;
    final trackerType = _getTrackerTypeForRentType();
    return Theme(
      data: Theme.of(context).copyWith(
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
      ),
      child: PopupMenuButton<Map<String, dynamic>>(
        tooltip: tr('recentTrackerSessions'),
        padding: EdgeInsets.zero,
        offset: const Offset(0, 44),
        icon: Container(
          margin: const EdgeInsets.only(right: 6),
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.primaryGold.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.4), width: 1),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                trackerType == 'TIME'
                    ? Icons.timer_outlined
                    : trackerType == 'COUNT'
                        ? Icons.tag_rounded
                        : trackerType == 'AREA'
                            ? Icons.landscape_outlined
                            : Icons.navigation_outlined,
                size: 14,
                color: AppColors.primaryGold,
              ),
              const SizedBox(width: 2),
              const Icon(Icons.arrow_drop_down_rounded, size: 16, color: AppColors.primaryGold),
            ],
          ),
        ),
        color: AppColors.bgSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.border),
        ),
        itemBuilder: (context) {
          return _unbilledTrackerSessions.map((session) {
            final isCurrentSelected = session['id']?.toString() == _selectedTrackerSessionId;
            final value = session['value'] ?? '${session['qty']}';
            String timeFormatted = '';
            if (session['timestamp'] != null) {
              final dt = DateTime.tryParse(session['timestamp']);
              if (dt != null) {
                timeFormatted = DateFormat('dd MMM, hh:mm a').format(dt);
              }
            }

            return PopupMenuItem<Map<String, dynamic>>(
              value: session,
              height: 48,
              child: Row(
                children: [
                  Icon(
                    trackerType == 'TIME'
                        ? Icons.timer_outlined
                        : trackerType == 'COUNT'
                            ? Icons.tag_rounded
                            : trackerType == 'AREA'
                                ? Icons.landscape_outlined
                                : Icons.navigation_outlined,
                    size: 18,
                    color: isCurrentSelected ? AppColors.primaryGold : AppColors.textMuted,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          value,
                          style: AppTypography.bodyMain.copyWith(
                            fontWeight: isCurrentSelected ? FontWeight.bold : FontWeight.w600,
                            color: isCurrentSelected ? AppColors.primaryGold : AppColors.textMain,
                            fontSize: 13,
                          ),
                        ),
                        if (timeFormatted.isNotEmpty)
                          Text(
                            timeFormatted,
                            style: AppTypography.caption.copyWith(fontSize: 10),
                          ),
                      ],
                    ),
                  ),
                  if (isCurrentSelected) ...[
                    const SizedBox(width: 6),
                    const Icon(Icons.check_circle_rounded, size: 16, color: AppColors.primaryGold),
                  ],
                  const SizedBox(width: 6),
                  GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () async {
                      Navigator.pop(context);
                      final id = session['id']?.toString() ?? '';
                      await TrackerNotifier.deleteSession(id);
                      if (!mounted) return;
                      setState(() {
                        _unbilledTrackerSessions.removeWhere((s) => s['id']?.toString() == id);
                        if (_selectedTrackerSessionId == id) {
                          _selectedTrackerSessionId = null;
                          _qtyController.text = '';
                          _calculateTotal();
                        }
                      });
                      Fluttertoast.showToast(msg: tr('sessionDeleted'), backgroundColor: AppColors.danger);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.dangerBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Icon(
                        Icons.delete_outline_rounded,
                        size: 16,
                        color: AppColors.danger,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }).toList();
        },
        onSelected: (session) {
          final qtyText = _formatSessionToQtyText(session, trackerType);
          setState(() {
            _selectedTrackerSessionId = session['id']?.toString();
            _qtyController.text = qtyText;
          });
          _calculateTotal();
          Fluttertoast.showToast(msg: tr('sessionSelectedToast'), backgroundColor: AppColors.primaryGold);
        },
      ),
    );
  }

  Widget _buildCalcInput({
    required String label,
    required TextEditingController controller,
    Color? color,
    Widget? suffixWidget,
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
            suffixIcon: suffixWidget,
            suffixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
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
