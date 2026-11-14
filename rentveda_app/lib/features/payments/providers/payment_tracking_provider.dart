import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';

class PaymentTrackingState {
  final bool isLoading;
  final String? error;
  final List<dynamic> allPayments;
  final List<Map<String, dynamic>> aggregatedUsers;

  PaymentTrackingState({
    this.isLoading = false,
    this.error,
    this.allPayments = const [],
    this.aggregatedUsers = const [],
  });

  PaymentTrackingState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? allPayments,
    List<Map<String, dynamic>>? aggregatedUsers,
  }) {
    return PaymentTrackingState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      allPayments: allPayments ?? this.allPayments,
      aggregatedUsers: aggregatedUsers ?? this.aggregatedUsers,
    );
  }
}

class PaymentTrackingNotifier extends StateNotifier<PaymentTrackingState> {
  final ApiClient apiClient;

  PaymentTrackingNotifier(this.apiClient) : super(PaymentTrackingState());

  Future<void> loadPayments() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) {
        state = state.copyWith(isLoading: false, error: 'Not logged in');
        return;
      }

      final response = await apiClient.dio.post('/rentals', data: {'uid': uid});
      final payments = response.data is List ? response.data as List<dynamic> : [];

      state = state.copyWith(
        isLoading: false,
        allPayments: payments,
        aggregatedUsers: _aggregateUsers(payments),
      );
    } catch (e) {
      debugPrint('❌ [PAYMENT_TRACKING] Fetch error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  List<Map<String, dynamic>> _aggregateUsers(List<dynamic> payments) {
    final Map<String, Map<String, dynamic>> usersMap = {};

    for (var data in payments) {
      final mobileNumber = data['mobileNumber']?.toString() ?? '';
      if (mobileNumber.isEmpty) continue;

      final paidAmt = double.tryParse(data['paidAmount']?.toString() ?? '') ?? 0.0;
      final pendingAmt = double.tryParse(data['pendingAmount']?.toString() ?? '') ?? 0.0;
      final totalAmt = double.tryParse(data['totalAmount']?.toString() ?? '') ?? 0.0;

      if (usersMap.containsKey(mobileNumber)) {
        usersMap[mobileNumber]!['paidAmount'] += paidAmt;
        usersMap[mobileNumber]!['pendingAmount'] += pendingAmt;
        usersMap[mobileNumber]!['totalAmount'] += totalAmt;
      } else {
        usersMap[mobileNumber] = {
          ...data,
          'paidAmount': paidAmt,
          'pendingAmount': pendingAmt,
          'totalAmount': totalAmt,
        };
      }
    }
    return usersMap.values.toList();
  }

  Future<bool> updatePayment({
    required String id,
    required double pendingAmount,
    required double paidAmount,
    String? customerName,
    String? mobileNumber,
    String? machineId,
    String? reminderId,
  }) async {
    try {
      final Map<String, dynamic> data = {
        '_id': id,
        'pendingAmount': pendingAmount,
        'paidAmount': paidAmount,
      };
      if (customerName != null) data['customerName'] = customerName;
      if (mobileNumber != null) data['mobileNumber'] = mobileNumber;
      if (machineId != null) data['machineId'] = machineId;
      if (reminderId != null) data['reminderId'] = reminderId;

      await apiClient.dio.put('/update-payment', data: data);
      await loadPayments(); // Refresh list after update
      return true;
    } catch (e) {
      debugPrint('❌ [PAYMENT_TRACKING] Update error: $e');
      return false;
    }
  }
}

final paymentTrackingProvider = StateNotifierProvider<PaymentTrackingNotifier, PaymentTrackingState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return PaymentTrackingNotifier(apiClient);
});
