import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../auth/providers/auth_provider.dart';

class UpdateMachineryState {
  final bool isLoading;
  final String? error;
  final List<dynamic> machines;
  final bool isSuccess;

  UpdateMachineryState({
    this.isLoading = false,
    this.error,
    this.machines = const [],
    this.isSuccess = false,
  });

  UpdateMachineryState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? machines,
    bool? isSuccess,
  }) {
    return UpdateMachineryState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      machines: machines ?? this.machines,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

class UpdateMachineryNotifier extends StateNotifier<UpdateMachineryState> {
  final ApiClient apiClient;

  UpdateMachineryNotifier(this.apiClient) : super(UpdateMachineryState());

  Future<void> fetchMachines() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) {
        state = state.copyWith(isLoading: false, error: 'User ID not found');
        return;
      }
      
      final response = await apiClient.dio.post('/machines', data: {'uid': uid});
      if (response.statusCode == 200 || response.statusCode == 201) {
        state = state.copyWith(isLoading: false, machines: response.data ?? []);
      } else {
        state = state.copyWith(isLoading: false, error: 'Failed to fetch machines');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Connection error');
    }
  }

  Future<bool> archiveMachine(String machineId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await apiClient.dio.delete('/machine/machines/$machineId');
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        final updatedMachines = state.machines.where((m) => m['Machine_id'].toString() != machineId).toList();
        state = state.copyWith(isLoading: false, machines: updatedMachines);
        return true;
      }
      state = state.copyWith(isLoading: false, error: 'Failed to archive machine');
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Connection error');
      return false;
    }
  }

  Future<bool> updateMachine({
    required String machineId,
    required String machineName,
    required String rentType,
    File? image,
  }) async {
    state = state.copyWith(isLoading: true, error: null, isSuccess: false);
    try {
      final Map<String, dynamic> formDataMap = {
        'Machine_name': machineName,
        'RentType': rentType,
      };

      if (image != null) {
        formDataMap['image'] = await MultipartFile.fromFile(image.path);
      }

      final formData = FormData.fromMap(formDataMap);

      final response = await apiClient.dio.put(
        '/machine/machines/$machineId',
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );

      if (response.statusCode == 200 || response.data?['success'] == true) {
        state = state.copyWith(isLoading: false, isSuccess: true);
        await fetchMachines(); // Refresh list
        return true;
      } else {
        state = state.copyWith(isLoading: false, error: 'Failed to update machine');
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Connection error');
      return false;
    }
  }
}

final updateMachineryProvider = StateNotifierProvider<UpdateMachineryNotifier, UpdateMachineryState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return UpdateMachineryNotifier(apiClient);
});
