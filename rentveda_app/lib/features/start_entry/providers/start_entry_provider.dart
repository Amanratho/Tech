import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';

class StartEntryNotifier extends StateNotifier<bool> {
  final ApiClient apiClient;

  StartEntryNotifier(this.apiClient) : super(false);

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
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      debugPrint('Error saving entry: $e');
      state = false;
      return false;
    }
  }
}

final startEntryProvider = StateNotifierProvider<StartEntryNotifier, bool>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return StartEntryNotifier(apiClient);
});
