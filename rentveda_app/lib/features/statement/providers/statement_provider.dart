import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';

class StatementState {
  final bool isLoading;
  final String? error;
  final List<dynamic> allRentals;

  StatementState({
    this.isLoading = false,
    this.error,
    this.allRentals = const [],
  });

  StatementState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? allRentals,
  }) {
    return StatementState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      allRentals: allRentals ?? this.allRentals,
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

      final response = await apiClient.dio.post('/rentals', data: {'uid': uid});
      
      final rentals = response.data is List ? response.data as List<dynamic> : [];

      state = state.copyWith(
        isLoading: false,
        allRentals: rentals,
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
