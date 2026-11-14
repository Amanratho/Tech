import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';

// Home data state
class HomeState {
  final bool isLoading;
  final String? error;
  final List<dynamic> machines;
  final List<dynamic> payments;
  final List<dynamic> reminders;
  final Map<String, dynamic>? userData;

  HomeState({
    this.isLoading = false,
    this.error,
    this.machines = const [],
    this.payments = const [],
    this.reminders = const [],
    this.userData,
  });

  HomeState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? machines,
    List<dynamic>? payments,
    List<dynamic>? reminders,
    Map<String, dynamic>? userData,
  }) {
    return HomeState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      machines: machines ?? this.machines,
      payments: payments ?? this.payments,
      reminders: reminders ?? this.reminders,
      userData: userData ?? this.userData,
    );
  }
}

class HomeNotifier extends StateNotifier<HomeState> {
  final ApiClient apiClient;

  HomeNotifier(this.apiClient) : super(HomeState());

  Future<void> loadDashboardData() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) {
        state = state.copyWith(isLoading: false, error: 'Not logged in');
        return;
      }

      // Fetch all data in parallel
      final results = await Future.wait([
        _fetchMachines(uid),
        _fetchPayments(uid),
        _fetchReminders(uid),
        _fetchUserData(uid),
      ]);

      state = state.copyWith(
        isLoading: false,
        machines: results[0] as List<dynamic>,
        payments: results[1] as List<dynamic>,
        reminders: results[2] as List<dynamic>,
        userData: results[3] as Map<String, dynamic>?,
      );
    } catch (e) {
      debugPrint('❌ [HOME] Error loading dashboard: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<List<dynamic>> _fetchMachines(String uid) async {
    try {
      final response = await apiClient.dio.post('/machines', data: {'uid': uid});
      return response.data is List ? response.data : [];
    } catch (e) {
      debugPrint('❌ [HOME] Machines fetch error: $e');
      return [];
    }
  }

  Future<List<dynamic>> _fetchPayments(String uid) async {
    try {
      final response = await apiClient.dio.post('/rentals', data: {'uid': uid});
      return response.data is List ? response.data : [];
    } catch (e) {
      debugPrint('❌ [HOME] Payments fetch error: $e');
      return [];
    }
  }

  Future<List<dynamic>> _fetchReminders(String uid) async {
    try {
      final response = await apiClient.dio.post('/reminders/pending', data: {'uid': uid});
      return response.data is List ? response.data : [];
    } catch (e) {
      debugPrint('❌ [HOME] Reminders fetch error: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> _fetchUserData(String uid) async {
    try {
      final response = await apiClient.dio.get('/users/$uid');
      return response.data is Map<String, dynamic> ? response.data : null;
    } catch (e) {
      debugPrint('❌ [HOME] User fetch error: $e');
      return null;
    }
  }
}

final homeProvider = StateNotifierProvider<HomeNotifier, HomeState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return HomeNotifier(apiClient);
});
