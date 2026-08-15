import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../providers/payment_tracking_provider.dart';
import '../widgets/client_list_item.dart';
import '../widgets/transaction_history_sheet.dart';
import '../widgets/collect_payment_dialog.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class PaymentTrackingScreen extends ConsumerStatefulWidget {
  const PaymentTrackingScreen({super.key});

  @override
  ConsumerState<PaymentTrackingScreen> createState() => _PaymentTrackingScreenState();
}

class _PaymentTrackingScreenState extends ConsumerState<PaymentTrackingScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _filterType = 'pending'; // 'all', 'pending', 'paid'
  bool _sortAscending = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(paymentTrackingProvider.notifier).loadPayments();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showTransactionHistory(BuildContext context, Map<String, dynamic> user, List<dynamic> allPayments) {
    final mobileNumber = user['mobileNumber']?.toString() ?? '';
    final userEntries = allPayments.where((p) => p['mobileNumber']?.toString() == mobileNumber).toList();
    userEntries.sort((a, b) {
      final dateA = DateTime.tryParse(a['createdAt'] ?? '') ?? DateTime.now();
      final dateB = DateTime.tryParse(b['createdAt'] ?? '') ?? DateTime.now();
      return dateB.compareTo(dateA); // Descending
    });

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FractionallySizedBox(
        heightFactor: 0.85,
        child: TransactionHistorySheet(
          entries: userEntries,
          clientName: user['customerName'] ?? 'Client',
          onCollectPayment: (entry) {
            Navigator.pop(context);
            _showCollectPaymentDialog(context, entry);
          },
        ),
      ),
    );
  }

  void _showCollectPaymentDialog(BuildContext context, Map<String, dynamic> entry) {
    showDialog(
      context: context,
      builder: (context) => CollectPaymentDialog(
        entry: entry,
        onSubmit: (amount, name, mobile) async {
          Navigator.pop(context);
          
          final pendingAmount = (entry['pendingAmount'] ?? 0).toDouble();
          final paidAmount = (entry['paidAmount'] ?? 0).toDouble();

          if (amount > pendingAmount) {
            Fluttertoast.showToast(msg: tr('exceedPendingAmount'));
            return;
          }

          final newPending = pendingAmount - amount;
          final newPaid = paidAmount + amount;

          final success = await ref.read(paymentTrackingProvider.notifier).updatePayment(
                id: entry['_id'],
                pendingAmount: newPending,
                paidAmount: newPaid,
                customerName: name,
                mobileNumber: mobile,
              );

          if (success) {
            Fluttertoast.showToast(msg: tr('paymentUpdatedSuccess'));
          } else {
            Fluttertoast.showToast(msg: tr('paymentUpdateFailed'));
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(paymentTrackingProvider);

    // Apply Filters
    final filteredUsers = state.aggregatedUsers.where((user) {
      final name = (user['customerName'] ?? '').toString().toLowerCase();
      final mobile = (user['mobileNumber'] ?? '').toString();
      final searchMatches = name.contains(_searchQuery.toLowerCase()) || mobile.contains(_searchQuery);
      
      final pendingAmount = (user['pendingAmount'] ?? 0).toDouble();
      bool filterMatches = true;
      if (_filterType == 'pending') filterMatches = pendingAmount > 0;
      if (_filterType == 'paid') filterMatches = pendingAmount <= 0;

      return searchMatches && filterMatches;
    }).toList();

    // Sort by pending amount
    filteredUsers.sort((a, b) {
      final amtA = ((a['pendingAmount'] ?? 0)).toDouble();
      final amtB = ((b['pendingAmount'] ?? 0)).toDouble();
      return _sortAscending ? amtA.compareTo(amtB) : amtB.compareTo(amtA);
    });

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: Column(
          children: [
            // Sticky Header & Controls (same pattern as Summary screen)
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
                          tr('paymentTrackingTitle').toUpperCase(),
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
                            '${tr('totalAmount')}: ${filteredUsers.length}',
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

                  // Search Bar (curved like Summary screen)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (val) => setState(() => _searchQuery = val),
                      style: AppTypography.bodyMain.copyWith(fontSize: 12),
                      decoration: InputDecoration(
                        hintText: tr('searchPlaceholder'),
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

                  // Filter Chips & Sort (same pattern as Summary screen)
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
                                  label: tr('filterAll'),
                                  isSelected: _filterType == 'all',
                                  onTap: () => setState(() => _filterType = 'all'),
                                ),
                                const SizedBox(width: 8),
                                _FilterChip(
                                  label: tr('filterPending'),
                                  isSelected: _filterType == 'pending',
                                  onTap: () => setState(() => _filterType = 'pending'),
                                ),
                                const SizedBox(width: 8),
                                _FilterChip(
                                  label: tr('filterPaid'),
                                  isSelected: _filterType == 'paid',
                                  onTap: () => setState(() => _filterType = 'paid'),
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

            // Main List
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
                      : RefreshIndicator(
                          color: AppColors.primary,
                          onRefresh: () => ref.read(paymentTrackingProvider.notifier).loadPayments(),
                          child: filteredUsers.isEmpty
                              ? SingleChildScrollView(
                                  physics: const AlwaysScrollableScrollPhysics(),
                                  child: Container(
                                    height: MediaQuery.of(context).size.height * 0.5,
                                    alignment: Alignment.center,
                                    child: Text(tr('noClientsFound'), style: AppTypography.bodySecondary),
                                  ),
                                )
                              : ListView.builder(
                                  padding: const EdgeInsets.all(12),
                                  physics: const AlwaysScrollableScrollPhysics(),
                                  itemCount: filteredUsers.length,
                                  itemBuilder: (context, index) {
                                    return ClientListItem(
                                      user: filteredUsers[index],
                                      onTap: () => _showTransactionHistory(context, filteredUsers[index], state.allPayments),
                                    );
                                  },
                                ),
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
