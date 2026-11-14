import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';

class StatementState {
  final bool isLoading;
  final String? error;
  final List<dynamic> allRentals;
  final List<dynamic> machines;

  StatementState({
    this.isLoading = false,
    this.error,
    this.allRentals = const [],
    this.machines = const [],
  });

  StatementState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? allRentals,
    List<dynamic>? machines,
  }) {
    return StatementState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      allRentals: allRentals ?? this.allRentals,
      machines: machines ?? this.machines,
    );
  }
}

class StatementNotifier extends StateNotifier<StatementState> {
  final ApiClient apiClient;

  StatementNotifier(this.apiClient) : super(StatementState());

  Future<void> loadRentals() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) {
        state = state.copyWith(isLoading: false, error: 'Not logged in');
        return;
      }

      final results = await Future.wait([
        apiClient.dio.post('/rentals', data: {'uid': uid}),
        apiClient.dio.post('/machines', data: {'uid': uid}),
      ]);
      
      final rentals = results[0].data is List ? results[0].data as List<dynamic> : [];
      final machines = results[1].data is List ? results[1].data as List<dynamic> : [];

      state = state.copyWith(
        isLoading: false,
        allRentals: rentals,
        machines: machines,
      );
    } catch (e) {
      debugPrint('❌ [STATEMENT] Fetch error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final statementProvider = StateNotifierProvider<StatementNotifier, StatementState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return StatementNotifier(apiClient);
});
