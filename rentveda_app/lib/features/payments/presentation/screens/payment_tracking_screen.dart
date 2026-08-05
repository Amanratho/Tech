import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
  String _searchQuery = '';
  String _filterType = 'pending'; // 'all', 'pending', 'paid'

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(paymentTrackingProvider.notifier).loadPayments();
    });
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
            Fluttertoast.showToast(msg: "Payment amount cannot exceed pending amount.");
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
            Fluttertoast.showToast(msg: "Payment updated successfully!");
          } else {
            Fluttertoast.showToast(msg: "Failed to update payment.");
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

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: Column(
        children: [
          
          // Header section with sticky feel
          Container(
            color: AppColors.bgSurface.withValues(alpha: 0.95),
            child: Column(
              children: [
                // Title and Count
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          GestureDetector(
                            onTap: () => context.pop(),
                            child: const Icon(Icons.arrow_back, size: 22, color: AppColors.textMain),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            tr('paymentTrackingTitle').toUpperCase(),
                            style: AppTypography.badgeText.copyWith(
                              fontSize: 13,
                              color: AppColors.textSubtle,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.warning.withValues(alpha: 0.2),
                          border: Border.all(color: AppColors.warning),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Text(
                          '${filteredUsers.length} Clients',
                          style: AppTypography.caption.copyWith(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.warningDark,
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
                    onChanged: (val) => setState(() => _searchQuery = val),
                    style: AppTypography.bodyMain,
                    decoration: InputDecoration(
                      hintText: tr('searchPlaceholder'),
                      hintStyle: AppTypography.bodySecondary.copyWith(color: AppColors.textSubtle),
                      prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.textSubtle),
                      filled: true,
                      fillColor: AppColors.bgMain,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.border)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.border)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.borderFocus, width: 2)),
                    ),
                  ),
                ),

                // Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      _buildFilterChip(tr('filterAll'), 'all'),
                      const SizedBox(width: 8),
                      _buildFilterChip(tr('filterPending'), 'pending'),
                      const SizedBox(width: 8),
                      _buildFilterChip(tr('filterPaid'), 'paid'),
                    ],
                  ),
                ),
                const Divider(height: 1, color: AppColors.border),
              ],
            ),
          ),

          // Main List
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.warning))
                : RefreshIndicator(
                    color: AppColors.warning,
                    onRefresh: () => ref.read(paymentTrackingProvider.notifier).loadPayments(),
                    child: filteredUsers.isEmpty
                        ? SingleChildScrollView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            child: Container(
                              height: MediaQuery.of(context).size.height * 0.5,
                              alignment: Alignment.center,
                              child: Text('No clients found', style: AppTypography.bodySecondary),
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
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
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _filterType == value;
    return GestureDetector(
      onTap: () => setState(() => _filterType = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.warning : Colors.transparent,
          border: Border.all(color: isSelected ? AppColors.borderDarkGold : AppColors.border),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: AppTypography.caption.copyWith(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? AppColors.warningDark : AppColors.textSubtle,
          ),
        ),
      ),
    );
  }
}
