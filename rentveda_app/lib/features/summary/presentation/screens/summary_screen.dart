import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../widgets/bill_card.dart';
import '../widgets/edit_bill_sheet.dart';
import '../widgets/delete_bill_dialog.dart';
import '../screens/invoice_preview_screen.dart';
import '../../providers/billing_history_provider.dart';

class SummaryScreen extends ConsumerStatefulWidget {
  const SummaryScreen({super.key});

  @override
  ConsumerState<SummaryScreen> createState() => _SummaryScreenState();
}

class _SummaryScreenState extends ConsumerState<SummaryScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _searchField = 'customerName';
  bool _sortAscending = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        ref.read(billingHistoryProvider.notifier).loadBills();
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<dynamic> _getFilteredAndSortedBills(List<dynamic> allBills) {
    // 1. Filter
    var filtered = allBills.where((bill) {
      if (_searchQuery.isEmpty) return true;
      final val = bill[_searchField]?.toString().toLowerCase() ?? '';
      return val.contains(_searchQuery.toLowerCase());
    }).toList();

    // 2. Sort by Date (newest first by default)
    filtered.sort((a, b) {
      final dateA = DateTime.tryParse(a['createdAt']?.toString() ?? '') ?? DateTime(2000);
      final dateB = DateTime.tryParse(b['createdAt']?.toString() ?? '') ?? DateTime(2000);
      return _sortAscending ? dateA.compareTo(dateB) : dateB.compareTo(dateA);
    });

    return filtered;
  }

  void _openInvoicePreview(BuildContext context, Map<String, dynamic> bill) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => InvoicePreviewScreen(bill: bill),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(billingHistoryProvider);
    final displayedBills = _getFilteredAndSortedBills(state.allBills);

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: Column(
          children: [
            // Sticky Header & Controls
            Container(
              color: AppColors.bgSurface.withValues(alpha: 0.95),
              child: Column(
                children: [
                  // Title Bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          tr('billingHistoryTitle').toUpperCase(),
                          style: AppTypography.caption.copyWith(
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                            color: AppColors.textMuted,
                            fontSize: 10,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.bgSurface,
                            border: Border.all(color: AppColors.border),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Total: ${displayedBills.length}',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.primaryGold,
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Search Bar
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (val) => setState(() => _searchQuery = val),
                      style: AppTypography.bodyMain.copyWith(fontSize: 12),
                      decoration: InputDecoration(
                        hintText: tr('searchPlaceholder1'),
                        hintStyle: AppTypography.caption.copyWith(color: AppColors.textMuted),
                        prefixIcon: const Icon(Icons.search, size: 16, color: AppColors.textMuted),
                        filled: true,
                        fillColor: AppColors.bgSurface,
                        contentPadding: const EdgeInsets.symmetric(vertical: 0),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: const BorderSide(color: AppColors.primary),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Filter Chips & Sort
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                _FilterChip(
                                  label: tr('customerNamept'),
                                  isSelected: _searchField == 'customerName',
                                  onTap: () => setState(() => _searchField = 'customerName'),
                                ),
                                const SizedBox(width: 8),
                                _FilterChip(
                                  label: tr('operatorName'),
                                  isSelected: _searchField == 'operatorName',
                                  onTap: () => setState(() => _searchField = 'operatorName'),
                                ),
                                const SizedBox(width: 8),
                                _FilterChip(
                                  label: tr('searchByCustomerAddress'),
                                  isSelected: _searchField == 'customerAddress',
                                  onTap: () => setState(() => _searchField = 'customerAddress'),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        InkWell(
                          onTap: () => setState(() => _sortAscending = !_sortAscending),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: AppColors.bgSurface,
                              border: Border.all(color: AppColors.border),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              _sortAscending ? Icons.arrow_upward : Icons.arrow_downward,
                              size: 12,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Divider(height: 1, color: AppColors.border),
                ],
              ),
            ),

            // Main List Content
            Expanded(
              child: state.isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : state.error != null
                      ? Center(
                          child: Text(
                            'Error: ${state.error}',
                            style: AppTypography.bodyMain.copyWith(color: AppColors.danger),
                          ),
                        )
                      : displayedBills.isEmpty
                          ? Center(
                              child: Text(
                                'No bills found',
                                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(12),
                              itemCount: displayedBills.length,
                              itemBuilder: (context, index) {
                                final bill = displayedBills[index];
                                return BillCard(
                                  bill: bill,
                                  onEdit: () {
                                    showModalBottomSheet(
                                      context: context,
                                      isScrollControlled: true,
                                      backgroundColor: Colors.transparent,
                                      builder: (context) => Padding(
                                        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
                                        child: SizedBox(
                                          height: MediaQuery.of(context).size.height * 0.85,
                                          child: EditBillSheet(bill: bill),
                                        ),
                                      ),
                                    );
                                  },
                                  onDelete: () {
                                    showDialog(
                                      context: context,
                                      builder: (context) => DeleteBillDialog(bill: bill),
                                    );
                                  },
                                  onView: () => _openInvoicePreview(context, bill),
                                );
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: AppTypography.caption.copyWith(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: isSelected ? AppColors.textMain : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}
