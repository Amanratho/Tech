import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../home/providers/home_provider.dart';

class RemindersState {
  final bool isLoading;
  final String? error;
  final List<dynamic> reminders;

  RemindersState({
    this.isLoading = false,
    this.error,
    this.reminders = const [],
  });

  RemindersState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? reminders,
  }) {
    return RemindersState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      reminders: reminders ?? this.reminders,
    );
  }
}

class RemindersNotifier extends StateNotifier<RemindersState> {
  final ApiClient apiClient;
  final Ref ref;

  RemindersNotifier(this.apiClient, this.ref) : super(RemindersState());

  Future<void> loadReminders() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) {
        state = state.copyWith(isLoading: false, error: 'Not logged in');
        return;
      }

      final response = await apiClient.dio.post('/reminders/pending', data: {'uid': uid});
      
      final reminders = response.data is List ? response.data as List<dynamic> : [];

      state = state.copyWith(
        isLoading: false,
        reminders: reminders,
      );
    } catch (e) {
      debugPrint('❌ [REMINDERS] Fetch error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> updateReminderDate(String id, String newDate) async {
    try {
      await apiClient.dio.put('/reminders/update', data: {
        '_id': id,
        'reminderDate': newDate,
      });
      await loadReminders(); // Refresh list after update
      // Immediately refresh Home dashboard metrics in background
      ref.read(homeProvider.notifier).loadDashboardData(isSilent: true);
      return true;
    } catch (e) {
      debugPrint('❌ [REMINDERS] Update error: $e');
      return false;
    }
  }

  Future<bool> performAction(String id, String action) async {
    try {
      // Actions: "COMPLETE", "DELETE"
      await apiClient.dio.put('/reminders/action', data: {
        'id': id,
        'action': action,
      });
      await loadReminders(); // Refresh list after deletion/completion
      // Immediately refresh Home dashboard metrics in background
      ref.read(homeProvider.notifier).loadDashboardData(isSilent: true);
      return true;
    } catch (e) {
      debugPrint('❌ [REMINDERS] Action error: $e');
      return false;
    }
  }
}

final remindersProvider = StateNotifierProvider<RemindersNotifier, RemindersState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return RemindersNotifier(apiClient, ref);
});
