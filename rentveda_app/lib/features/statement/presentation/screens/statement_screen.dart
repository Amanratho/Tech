import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/statement_provider.dart';

class StatementScreen extends ConsumerStatefulWidget {
  const StatementScreen({super.key});

  @override
  ConsumerState<StatementScreen> createState() => _StatementScreenState();
}

class _StatementScreenState extends ConsumerState<StatementScreen> {
  DateTime? _startDate;
  DateTime? _endDate;
  String _filterType = "All"; // All, Paid, Pending
  String _selectedMachineId = "ALL";
  bool _isGenerating = false;

  String _getSelectedMachineName(List<dynamic> machines) {
    if (_selectedMachineId == "ALL") {
      return tr('allMachines');
    }
    for (final m in machines) {
      final id = (m['_id'] ?? m['Machine_id'] ?? '').toString();
      if (id == _selectedMachineId) {
        return (m['Machine_name'] ?? 'Machine').toString();
      }
    }
    return tr('allMachines');
  }

  void _showMachinePicker(BuildContext context, List<dynamic> machines) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.7,
          ),
          decoration: const BoxDecoration(
            color: AppColors.bgSurface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Drag handle
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGold.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.precision_manufacturing_rounded, size: 20, color: AppColors.primaryGold),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          tr('selectMachine'),
                          style: AppTypography.cardHeader.copyWith(fontSize: 16),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.textMuted),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.border),

              Flexible(
                child: ListView(
                  shrinkWrap: true,
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  children: [
                    // Option: All Machines
                    _MachinePickerTile(
                      title: tr('allMachines'),
                      subtitle: tr('allMachinesDesc'),
                      icon: Icons.apps_rounded,
                      isSelected: _selectedMachineId == "ALL",
                      badge: '${machines.length}',
                      onTap: () {
                        setState(() => _selectedMachineId = "ALL");
                        Navigator.pop(ctx);
                      },
                    ),
                    if (machines.isNotEmpty) ...[
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 6),
                        child: Divider(height: 1, color: AppColors.border),
                      ),
                      ...machines.map((m) {
                        final id = (m['_id'] ?? m['Machine_id'] ?? '').toString();
                        final name = (m['Machine_name'] ?? 'Machine').toString();
                        final rentType = (m['RentType'] ?? '').toString();
                        final isSelected = _selectedMachineId == id;
                        return _MachinePickerTile(
                          title: name,
                          subtitle: rentType.isNotEmpty ? 'Rent: $rentType' : null,
                          icon: Icons.agriculture_rounded,
                          badge: rentType.isNotEmpty ? rentType : null,
                          isSelected: isSelected,
                          onTap: () {
                            setState(() => _selectedMachineId = id);
                            Navigator.pop(ctx);
                          },
                        );
                      }),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _startDate = DateTime(now.year, now.month, 1);
    _endDate = now;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        ref.read(statementProvider.notifier).loadRentals();
      }
    });
  }

  void _setThisMonth() {
    final now = DateTime.now();
    setState(() {
      _startDate = DateTime(now.year, now.month, 1);
      _endDate = now;
    });
  }

  void _setLastMonth() {
    final now = DateTime.now();
    setState(() {
      _startDate = DateTime(now.year, now.month - 1, 1);
      _endDate = DateTime(now.year, now.month, 0); // Last day of previous month
    });
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final initialDate = (isStart ? _startDate : _endDate) ?? DateTime.now();
    final firstDate = isStart ? DateTime(2000) : (_startDate ?? DateTime(2000));
    final lastDate = DateTime.now(); // Cannot select future dates

    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: firstDate,
      lastDate: lastDate,
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

    if (picked != null && mounted) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          // If start date goes beyond end date, reset end date to start date
          if (_endDate != null && _startDate!.isAfter(_endDate!)) {
            _endDate = _startDate;
          }
        } else {
          _endDate = picked;
        }
      });
    }
  }

  // Generate mock PDF for now
  void _generatePDF() async {
    if (_startDate == null || _endDate == null) {
      Fluttertoast.showToast(msg: tr('errorSelectDates'), backgroundColor: AppColors.danger);
      return;
    }

    setState(() => _isGenerating = true);
    
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));
    
    if (!mounted) return;
    setState(() => _isGenerating = false);
    
    Fluttertoast.showToast(msg: tr('successStatementDownloaded'), backgroundColor: AppColors.successDark);
  }

  Map<String, double> _calculateLiveSummary(List<dynamic> allRentals) {
    if (_startDate == null || _endDate == null) {
      return {'count': 0, 'billed': 0, 'paid': 0, 'pending': 0};
    }

    // Include the entire end day
    final end = DateTime(_endDate!.year, _endDate!.month, _endDate!.day, 23, 59, 59, 999);
    final start = DateTime(_startDate!.year, _startDate!.month, _startDate!.day);

    final filteredData = allRentals.where((item) {
      final dateStr = item['createdAt']?.toString();
      if (dateStr == null || dateStr.isEmpty) return false;
      
      final itemDate = DateTime.tryParse(dateStr);
      if (itemDate == null) return false;

      final isWithinDate = itemDate.isAfter(start.subtract(const Duration(milliseconds: 1))) && 
                           itemDate.isBefore(end.add(const Duration(milliseconds: 1)));

      if (!isWithinDate) return false;

      // Machine Filter
      if (_selectedMachineId != "ALL") {
        final itemMachineId = (item['machineId'] ?? '').toString();
        if (itemMachineId != _selectedMachineId) {
          return false;
        }
      }

      final pendingAmt = (item['pendingAmount'] ?? 0).toDouble();
      
      if (_filterType == "Paid") return pendingAmt == 0;
      if (_filterType == "Pending") return pendingAmt > 0;
      return true; // "All"
    }).toList();

    double totalBilled = 0;
    double totalPaid = 0;
    double totalPending = 0;

    for (var item in filteredData) {
      totalBilled += (item['totalAmount'] ?? 0).toDouble();
      totalPaid += (item['paidAmount'] ?? 0).toDouble();
      totalPending += (item['pendingAmount'] ?? 0).toDouble();
    }

    return {
      'count': filteredData.length.toDouble(),
      'billed': totalBilled,
      'paid': totalPaid,
      'pending': totalPending,
    };
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(statementProvider);
    final summary = _calculateLiveSummary(state.allRentals);

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Hero Banner
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.white, const Color(0xFFFFFBEB), AppColors.primary.withValues(alpha: 0.2)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        border: Border.all(color: AppColors.primary),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 2)),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4, offset: const Offset(0, 2)),
                              ],
                            ),
                            child: const Icon(Icons.picture_as_pdf, color: AppColors.primaryGold, size: 24),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  tr('generateReport'),
                                  style: AppTypography.cardHeader.copyWith(fontSize: 14),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  tr('downloadPdfDesc'),
                                  style: AppTypography.caption.copyWith(color: AppColors.textDarkBrown, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Machine Selector
                    Text(
                      tr('selectMachine').toUpperCase(),
                      style: AppTypography.caption.copyWith(color: AppColors.textDarkBrown, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 8),
                    _MachineSelectorCard(
                      selectedName: _getSelectedMachineName(state.machines),
                      isAll: _selectedMachineId == "ALL",
                      totalMachines: state.machines.length,
                      onTap: () => _showMachinePicker(context, state.machines),
                    ),
                    const SizedBox(height: 24),

                    // Quick Select
                    Text(
                      tr('quickSelect').toUpperCase(),
                      style: AppTypography.caption.copyWith(color: AppColors.textDarkBrown, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: _QuickBtn(
                            icon: Icons.history,
                            label: tr('thisMonth'),
                            onTap: _setThisMonth,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _QuickBtn(
                            icon: Icons.update,
                            label: tr('lastMonth'),
                            onTap: _setLastMonth,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Custom Date Range
                    Text(
                      tr('customRange').toUpperCase(),
                      style: AppTypography.caption.copyWith(color: AppColors.textDarkBrown, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.bgSurface,
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: _DateInput(
                              label: tr('fromDate'),
                              date: _startDate,
                              onTap: () => _selectDate(context, true),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _DateInput(
                              label: tr('toDate'),
                              date: _endDate,
                              onTap: () => _selectDate(context, false),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Bill Filter Type
                    Text(
                      tr('recordType').toUpperCase(),
                      style: AppTypography.caption.copyWith(color: AppColors.textDarkBrown, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(child: _FilterBtn(label: tr('allBills'), value: "All", groupValue: _filterType, onTap: (v) => setState(() => _filterType = v))),
                        const SizedBox(width: 8),
                        Expanded(child: _FilterBtn(label: tr('fullyPaidOnly'), value: "Paid", groupValue: _filterType, onTap: (v) => setState(() => _filterType = v))),
                        const SizedBox(width: 8),
                        Expanded(child: _FilterBtn(label: tr('pendingDuesOnly'), value: "Pending", groupValue: _filterType, onTap: (v) => setState(() => _filterType = v))),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Live Summary Dashboard
                    Row(
                      children: [
                        const Icon(Icons.bar_chart, color: AppColors.primaryGold, size: 16),
                        const SizedBox(width: 6),
                        Text(
                          tr('statementLiveSummary').toUpperCase(),
                          style: AppTypography.caption.copyWith(color: AppColors.textDarkBrown, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                        ),
                        if (state.isLoading) ...[
                          const SizedBox(width: 8),
                          const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryGold)),
                        ]
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _StatCard(
                            title: tr('statementTotalBills'),
                            value: summary['count']!.toInt().toString(),
                            icon: Icons.receipt,
                            color: AppColors.primaryGold,
                            bgColor: AppColors.primaryGoldBg,
                            borderColor: AppColors.borderFocus.withValues(alpha: 0.4),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _StatCard(
                            title: tr('statementTotalBilled'),
                            value: '₹${summary['billed']!.toStringAsFixed(0)}',
                            icon: Icons.money,
                            color: AppColors.primaryGold,
                            bgColor: AppColors.primaryGoldBg,
                            borderColor: AppColors.borderFocus.withValues(alpha: 0.4),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            // Fixed Bottom Button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.bgSurface.withValues(alpha: 0.95),
                border: const Border(top: BorderSide(color: AppColors.border)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4)),
                ],
              ),
              child: ElevatedButton(
                onPressed: _isGenerating ? null : _generatePDF,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.textMain,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 2,
                  shadowColor: AppColors.primary.withValues(alpha: 0.3),
                ),
                child: _isGenerating
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryGold))
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.download, size: 18),
                          const SizedBox(width: 8),
                          Text(tr('downloadPdfBtn'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w700)),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickBtn({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.bgSurface,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 2, offset: const Offset(0, 1))],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: AppColors.primaryGold),
            const SizedBox(width: 6),
            Text(label, style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

class _DateInput extends StatelessWidget {
  final String label;
  final DateTime? date;
  final VoidCallback onTap;

  const _DateInput({required this.label, required this.date, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600, color: AppColors.textDarkBrown)),
        const SizedBox(height: 6),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.bgMain,
              border: Border.all(color: AppColors.border),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.calendar_today, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    date != null ? DateFormat('dd MMM yyyy').format(date!) : 'Select',
                    style: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w600, 
                      color: date != null ? AppColors.textMain : AppColors.textMuted,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _FilterBtn extends StatelessWidget {
  final String label;
  final String value;
  final String groupValue;
  final ValueChanged<String> onTap;

  const _FilterBtn({required this.label, required this.value, required this.groupValue, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return InkWell(
      onTap: () => onTap(value),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.bgSurface,
          border: Border.all(color: isSelected ? AppColors.primaryGold : AppColors.border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Text(
            label,
            style: AppTypography.caption.copyWith(
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              color: isSelected ? AppColors.textMain : AppColors.textDarkBrown,
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final Color borderColor;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    required this.bgColor,
    required this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  title.toUpperCase(),
                  style: AppTypography.caption.copyWith(fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
              ),
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: bgColor,
                  border: Border.all(color: borderColor),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 14, color: color),
              ),
            ],
          ),
          Text(
            value,
            style: AppTypography.bodyMain.copyWith(fontSize: 18, fontWeight: FontWeight.w800, color: color == AppColors.primaryGold ? AppColors.textMain : color),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _MachineSelectorCard extends StatelessWidget {
  final String selectedName;
  final bool isAll;
  final int totalMachines;
  final VoidCallback onTap;

  const _MachineSelectorCard({
    required this.selectedName,
    required this.isAll,
    required this.totalMachines,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.bgSurface,
          border: Border.all(
            color: !isAll ? AppColors.primaryGold : AppColors.border,
            width: !isAll ? 1.5 : 1,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isAll
                    ? AppColors.primaryGold.withValues(alpha: 0.1)
                    : AppColors.primary.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                isAll ? Icons.apps_rounded : Icons.agriculture_rounded,
                size: 20,
                color: AppColors.primaryGold,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tr('filterByMachine').toUpperCase(),
                    style: AppTypography.caption.copyWith(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMuted,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    selectedName,
                    style: AppTypography.bodyMain.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMain,
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.bgMain,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    isAll ? '$totalMachines' : '1',
                    style: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMain,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.keyboard_arrow_down_rounded, size: 18, color: AppColors.primaryGold),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MachinePickerTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final bool isSelected;
  final String? badge;
  final VoidCallback onTap;

  const _MachinePickerTile({
    required this.title,
    this.subtitle,
    required this.icon,
    required this.isSelected,
    this.badge,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.primaryGold.withValues(alpha: 0.08) : AppColors.bgMain,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isSelected ? AppColors.primaryGold : AppColors.border,
          width: isSelected ? 1.5 : 1,
        ),
      ),
      child: ListTile(
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.primaryGold.withValues(alpha: 0.15)
                : Colors.white,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            size: 20,
            color: isSelected ? AppColors.primaryGold : AppColors.textMuted,
          ),
        ),
        title: Text(
          title,
          style: AppTypography.bodyMain.copyWith(
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? AppColors.primaryGold : AppColors.textMain,
            fontSize: 14,
          ),
        ),
        subtitle: subtitle != null
            ? Text(
                subtitle!,
                style: AppTypography.caption.copyWith(fontSize: 11, color: AppColors.textMuted),
              )
            : null,
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (badge != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primaryGold : AppColors.bgSurface,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: isSelected ? AppColors.primaryGold : AppColors.border,
                  ),
                ),
                child: Text(
                  badge!,
                  style: AppTypography.caption.copyWith(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: isSelected ? Colors.white : AppColors.textDarkBrown,
                  ),
                ),
              ),
              const SizedBox(width: 8),
            ],
            Icon(
              isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
              size: 20,
              color: isSelected ? AppColors.primaryGold : AppColors.textSubtle,
            ),
          ],
        ),
      ),
    );
  }
}
