import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../home/providers/home_provider.dart';
import '../../reminders/providers/reminders_provider.dart';

class StartEntryNotifier extends StateNotifier<bool> {
  final ApiClient apiClient;
  final Ref ref;

  StartEntryNotifier(this.apiClient, this.ref) : super(false);

  Future<Map<String, dynamic>?> fetchCustomerByMobile(String mobile) async {
    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) return null;

      final response = await apiClient.dio.get(
        '/rentals/customer/$mobile',
        queryParameters: {'uid': uid},
      );
      
      if (response.data != null) {
        return response.data as Map<String, dynamic>;
      }
    } catch (e) {
      debugPrint('Customer not found or error: $e');
    }
    return null;
  }

  Future<bool> saveEntry(Map<String, dynamic> entryData) async {
    state = true;
    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) {
        state = false;
        return false;
      }
      
      entryData['uid'] = uid;
      
      final response = await apiClient.dio.post(
        '/rentals/add-entry',
        data: entryData,
      );
      
      state = false;
      if (response.statusCode == 200 || response.statusCode == 201) {
        // Immediately reload Home dashboard and Reminders in background
        ref.read(homeProvider.notifier).loadDashboardData(isSilent: true);
        ref.read(remindersProvider.notifier).loadReminders();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error saving entry: $e');
      state = false;
      return false;
    }
  }
}

final startEntryProvider = StateNotifierProvider<StartEntryNotifier, bool>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return StartEntryNotifier(apiClient, ref);
});
