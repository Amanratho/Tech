import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../models/admin_models.dart';

class AdminState {
  final bool isLoadingOverview;
  final bool isLoadingUsers;
  final bool isSubmitting;
  final AdminOverviewStats? overview;
  final List<AdminUserItem> users;
  final String? error;
  final String selectedStatusFilter;
  final String searchQuery;

  AdminState({
    this.isLoadingOverview = false,
    this.isLoadingUsers = false,
    this.isSubmitting = false,
    this.overview,
    this.users = const [],
    this.error,
    this.selectedStatusFilter = 'all',
    this.searchQuery = '',
  });

  AdminState copyWith({
    bool? isLoadingOverview,
    bool? isLoadingUsers,
    bool? isSubmitting,
    AdminOverviewStats? overview,
    List<AdminUserItem>? users,
    String? error,
    String? selectedStatusFilter,
    String? searchQuery,
  }) {
    return AdminState(
      isLoadingOverview: isLoadingOverview ?? this.isLoadingOverview,
      isLoadingUsers: isLoadingUsers ?? this.isLoadingUsers,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      overview: overview ?? this.overview,
      users: users ?? this.users,
      error: error,
      selectedStatusFilter: selectedStatusFilter ?? this.selectedStatusFilter,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class AdminNotifier extends StateNotifier<AdminState> {
  final ApiClient _apiClient;

  AdminNotifier(this._apiClient) : super(AdminState());

  Future<void> fetchOverview() async {
    state = state.copyWith(isLoadingOverview: true, error: null);
    try {
      final response = await _apiClient.dio.get('/admin/overview');
      if (response.statusCode == 200 && response.data['success'] == true) {
        final stats = AdminOverviewStats.fromJson(response.data['stats']);
        state = state.copyWith(isLoadingOverview: false, overview: stats);
      } else {
        state = state.copyWith(
          isLoadingOverview: false,
          error: response.data['message'] ?? 'Failed to load stats',
        );
      }
    } catch (e) {
      state = state.copyWith(isLoadingOverview: false, error: e.toString());
    }
  }

  Future<void> fetchUsers({String? search, String? status}) async {
    final effectiveSearch = search ?? state.searchQuery;
    final effectiveStatus = status ?? state.selectedStatusFilter;

    state = state.copyWith(
      isLoadingUsers: true,
      error: null,
      searchQuery: effectiveSearch,
      selectedStatusFilter: effectiveStatus,
    );

    try {
      final queryParams = <String, dynamic>{
        'search': effectiveSearch,
        'status': effectiveStatus,
        'limit': 100,
      };

      final response = await _apiClient.dio.get(
        '/admin/users',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final rawList = response.data['users'] as List? ?? [];
        final parsedUsers = rawList.map((u) => AdminUserItem.fromJson(u)).toList();
        state = state.copyWith(isLoadingUsers: false, users: parsedUsers);
      } else {
        state = state.copyWith(
          isLoadingUsers: false,
          error: response.data['message'] ?? 'Failed to load users',
        );
      }
    } catch (e) {
      state = state.copyWith(isLoadingUsers: false, error: e.toString());
    }
  }

  Future<bool> extendValidity(String uid, int days) async {
    state = state.copyWith(isSubmitting: true);
    try {
      final response = await _apiClient.dio.put(
        '/admin/users/$uid/subscription',
        data: {'extendDays': days},
      );
      state = state.copyWith(isSubmitting: false);
      if (response.statusCode == 200 && response.data['success'] == true) {
        // Refresh data
        await fetchOverview();
        await fetchUsers();
        return true;
      }
      return false;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }

  Future<bool> changePlan(String uid, String plan, String status) async {
    state = state.copyWith(isSubmitting: true);
    try {
      final response = await _apiClient.dio.put(
        '/admin/users/$uid/subscription',
        data: {
          'subscriptionPlan': plan,
          'subscriptionStatus': status,
        },
      );
      state = state.copyWith(isSubmitting: false);
      if (response.statusCode == 200 && response.data['success'] == true) {
        await fetchOverview();
        await fetchUsers();
        return true;
      }
      return false;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }

  Future<bool> toggleBlockUser(String uid, bool isBlocked, String reason) async {
    state = state.copyWith(isSubmitting: true);
    try {
      final response = await _apiClient.dio.put(
        '/admin/users/$uid/subscription',
        data: {
          'isBlocked': isBlocked,
          'blockReason': reason,
        },
      );
      state = state.copyWith(isSubmitting: false);
      if (response.statusCode == 200 && response.data['success'] == true) {
        await fetchOverview();
        await fetchUsers();
        return true;
      }
      return false;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }

  Future<bool> sendBroadcast({
    required String title,
    required String message,
    bool showPopup = true,
    bool sendPush = true,
  }) async {
    state = state.copyWith(isSubmitting: true);
    try {
      final response = await _apiClient.dio.post(
        '/admin/broadcast',
        data: {
          'title': title,
          'message': message,
          'showPopup': showPopup,
          'sendPush': sendPush,
        },
      );
      state = state.copyWith(isSubmitting: false);
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }

  Future<bool> clearBroadcast() async {
    state = state.copyWith(isSubmitting: true);
    try {
      final response = await _apiClient.dio.post('/admin/clear-announcement');
      state = state.copyWith(isSubmitting: false);
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }
}

final adminProvider = StateNotifierProvider<AdminNotifier, AdminState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AdminNotifier(apiClient);
});
