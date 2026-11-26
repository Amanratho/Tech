import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/machine_maintenance_provider.dart';
import 'add_transaction_sheet.dart';

class FinancialTracker extends ConsumerStatefulWidget {
  final String machineId;
  final bool isArchived;

  const FinancialTracker({
    super.key,
    required this.machineId,
    this.isArchived = false,
  });

  @override
  ConsumerState<FinancialTracker> createState() => _FinancialTrackerState();
}

class _FinancialTrackerState extends ConsumerState<FinancialTracker> {
  String _formatDate(String dateStr) {
    try {
      final DateTime dt = DateTime.parse(dateStr);
      return DateFormat('dd MMM yyyy, hh:mm a').format(dt);
    } catch (e) {
      return dateStr;
    }
  }

  late Future<Map<String, dynamic>> _maintenanceFuture;
  String _filter = 'all'; // 'all', 'expense', 'income'

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    _maintenanceFuture = ref.read(machineMaintenanceProvider.notifier).fetchMaintenance(widget.machineId);
  }

  void _openAddTransactionSheet(String type) async {
    if (widget.isArchived) return; // Prevent adding to archived machines

    final result = await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AddTransactionSheet(
        machineId: widget.machineId,
        type: type,
      ),
    );
    if (!mounted) return;
    if (result == true) {
      setState(() {
        _loadData();
      });
    }
  }

  void _deleteEntry(String id) async {
    if (widget.isArchived) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(tr('deleteEntryConfirm')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(tr('cancelButton')),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(tr('deleteButton'), style: const TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final success = await ref.read(machineMaintenanceProvider.notifier).deleteMaintenance(id);
      if (!mounted) return;
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(tr('entryDeletedSuccess'))));
        setState(() {
          _loadData();
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(tr('entryDeleteFailed')), backgroundColor: AppColors.danger));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _maintenanceFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(20.0),
              child: CircularProgressIndicator(),
            ),
          );
        }

        final data = snapshot.data;
        final totalExpense = data?['totalExpense'] ?? 0.0;
        final totalIncome = data?['totalIncome'] ?? 0.0;
        final List<MaintenanceEntry> entries = data?['entries'] ?? [];

        final filteredEntries = _filter == 'all'
            ? entries
            : entries.where((e) => e.type == _filter).toList();

        return Container(
          color: const Color(0xFFF9F9F9),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Summary Boxes
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.receipt, color: AppColors.danger, size: 14),
                              const SizedBox(width: 4),
                              Text(tr('totalExpenseLabel'), style: AppTypography.caption.copyWith(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text('₹${totalExpense.toStringAsFixed(0)}', style: AppTypography.cardHeader.copyWith(color: AppColors.danger, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.account_balance_wallet, color: AppColors.successDark, size: 14),
                              const SizedBox(width: 4),
                              Text(tr('extraIncomeLabel'), style: AppTypography.caption.copyWith(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text('₹${totalIncome.toStringAsFixed(0)}', style: AppTypography.cardHeader.copyWith(color: AppColors.successDark, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Action Buttons OR Archived Read-Only Notice
              if (widget.isArchived)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    border: Border.all(color: const Color(0xFFFED7AA)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.archive_outlined, size: 18, color: Color(0xFFC2410C)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          tr('archivedMachineReadOnlyBanner'),
                          style: AppTypography.caption.copyWith(
                            color: const Color(0xFFC2410C),
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                )
              else
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          backgroundColor: const Color(0xFFFEE2E2),
                          side: const BorderSide(color: Color(0xFFFECACA)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.add, size: 16, color: AppColors.danger),
                        label: Text(tr('addExpenseButton'), style: AppTypography.caption.copyWith(color: AppColors.danger, fontWeight: FontWeight.bold)),
                        onPressed: () => _openAddTransactionSheet('expense'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          backgroundColor: const Color(0xFFDCFCE7),
                          side: const BorderSide(color: Color(0xFFBBF7D0)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.add, size: 16, color: AppColors.successDark),
                        label: Text(tr('addIncomeButton'), style: AppTypography.caption.copyWith(color: AppColors.successDark, fontWeight: FontWeight.bold)),
                        onPressed: () => _openAddTransactionSheet('income'),
                      ),
                    ),
                  ],
                ),

              const SizedBox(height: 16),

              // Transaction Ledger is directly visible! (No redundant inner button!)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tr('transactionLedger'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildFilterTab('all', tr('filterAllLabel')),
                        const SizedBox(width: 8),
                        _buildFilterTab('expense', tr('expenseType')),
                        const SizedBox(width: 8),
                        _buildFilterTab('income', tr('incomeType')),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (filteredEntries.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Text(tr('noTransactions'), style: AppTypography.caption.copyWith(color: AppColors.textSubtle)),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filteredEntries.length,
                        separatorBuilder: (context, index) => const Divider(color: AppColors.border),
                        itemBuilder: (context, index) {
                          final entry = filteredEntries[index];
                          final isExp = entry.type == 'expense';
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: isExp ? const Color(0xFFFEE2E2) : const Color(0xFFDCFCE7),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                isExp ? Icons.arrow_upward : Icons.arrow_downward,
                                color: isExp ? AppColors.danger : AppColors.successDark,
                                size: 16,
                              ),
                            ),
                            title: Text(entry.description, style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold)),
                            subtitle: Text(_formatDate(entry.date), style: AppTypography.caption.copyWith(fontSize: 10)),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  '${isExp ? "-" : "+"}₹${entry.amount.toStringAsFixed(0)}',
                                  style: AppTypography.bodyMain.copyWith(
                                    color: isExp ? AppColors.danger : AppColors.successDark,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (!widget.isArchived)
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline, color: AppColors.danger, size: 20),
                                    onPressed: () => _deleteEntry(entry.id),
                                  ),
                              ],
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildFilterTab(String filterType, String label) {
    final isSelected = _filter == filterType;
    return GestureDetector(
      onTap: () {
        setState(() {
          _filter = filterType;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: AppTypography.caption.copyWith(
            color: isSelected ? Colors.white : AppColors.textMain,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
