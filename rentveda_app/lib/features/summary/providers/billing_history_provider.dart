import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../home/providers/home_provider.dart';

class BillingHistoryState {
  final bool isLoading;
  final String? error;
  final List<dynamic> allBills;

  BillingHistoryState({
    this.isLoading = false,
    this.error,
    this.allBills = const [],
  });

  BillingHistoryState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? allBills,
  }) {
    return BillingHistoryState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      allBills: allBills ?? this.allBills,
    );
  }
}

class BillingHistoryNotifier extends StateNotifier<BillingHistoryState> {
  final ApiClient apiClient;
  final Ref ref;

  BillingHistoryNotifier(this.apiClient, this.ref) : super(BillingHistoryState());

  Future<void> loadBills() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) {
        state = state.copyWith(isLoading: false, error: 'Not logged in');
        return;
      }

      final response = await apiClient.dio.post('/rentals', data: {'uid': uid});
      
      var bills = response.data is List ? response.data as List<dynamic> : [];
      
      // Sort bills by creation date (newest first)
      bills.sort((a, b) {
        final dateA = DateTime.tryParse(a['createdAt'] ?? '') ?? DateTime(0);
        final dateB = DateTime.tryParse(b['createdAt'] ?? '') ?? DateTime(0);
        return dateB.compareTo(dateA);
      });

      state = state.copyWith(
        isLoading: false,
        allBills: bills,
      );
    } catch (e) {
      debugPrint('❌ [BILLING_HISTORY] Fetch error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> editBill(Map<String, dynamic> formData) async {
    try {
      await apiClient.dio.put('/edit-rental', data: formData);
      await loadBills(); // Refresh list after update
      // Immediately refresh Home dashboard metrics in background
      ref.read(homeProvider.notifier).loadDashboardData(isSilent: true);
      return true;
    } catch (e) {
      debugPrint('❌ [BILLING_HISTORY] Edit error: $e');
      return false;
    }
  }

  Future<bool> deleteBill(String id) async {
    try {
      await apiClient.dio.post('/delete-multiple', data: {
        'ids': [id]
      });
      await loadBills(); // Refresh list after deletion
      // Immediately refresh Home dashboard metrics in background
      ref.read(homeProvider.notifier).loadDashboardData(isSilent: true);
      return true;
    } catch (e) {
      debugPrint('❌ [BILLING_HISTORY] Delete error: $e');
      return false;
    }
  }
}

final billingHistoryProvider = StateNotifierProvider<BillingHistoryNotifier, BillingHistoryState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return BillingHistoryNotifier(apiClient, ref);
});
