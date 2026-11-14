import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';

class EodDashboardState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? summary;

  EodDashboardState({
    this.isLoading = false,
    this.error,
    this.summary,
  });

  EodDashboardState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? summary,
    bool clearError = false,
  }) {
    return EodDashboardState(
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
      summary: summary ?? this.summary,
    );
  }
}

class EodDashboardNotifier extends StateNotifier<EodDashboardState> {
  final ApiClient _apiClient;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  EodDashboardNotifier(this._apiClient) : super(EodDashboardState());

  Future<void> fetchSummary(String startDate, String endDate) async {
    state = state.copyWith(isLoading: true, clearError: true);
    
    try {
      final uid = await _storage.read(key: 'uid');
      if (uid == null) {
        state = state.copyWith(isLoading: false, error: 'Not logged in');
        return;
      }

      final response = await _apiClient.dio.get(
        '/rentals/eod-summary',
        queryParameters: {
          'uid': uid,
          'startDate': startDate,
          'endDate': endDate,
        },
      );

      state = state.copyWith(
        isLoading: false,
        summary: response.data,
      );
    } on DioException catch (e) {
      String errorMessage = 'Failed to load summary';
      if (e.response != null && e.response!.data != null) {
        errorMessage = e.response!.data['message'] ?? errorMessage;
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final eodDashboardProvider = StateNotifierProvider<EodDashboardNotifier, EodDashboardState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return EodDashboardNotifier(apiClient);
});
