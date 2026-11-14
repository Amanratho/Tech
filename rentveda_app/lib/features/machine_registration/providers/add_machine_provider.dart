import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';
import '../../../../core/network/api_client.dart';
import '../../home/providers/home_provider.dart';

final addMachineProvider = StateNotifierProvider<AddMachineNotifier, AddMachineState>((ref) {
  return AddMachineNotifier(ref);
});

class AddMachineState {
  final bool isLoading;
  final String? error;
  final bool isSuccess;

  AddMachineState({this.isLoading = false, this.error, this.isSuccess = false});

  AddMachineState copyWith({bool? isLoading, String? error, bool? isSuccess}) {
    return AddMachineState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

class AddMachineNotifier extends StateNotifier<AddMachineState> {
  final Ref _ref;
  final ApiClient _apiClient = ApiClient();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AddMachineNotifier(this._ref) : super(AddMachineState());

  Future<void> submitMachine({
    required String machineName,
    required String rentType,
    required File imageFile,
  }) async {
    state = state.copyWith(isLoading: true, error: null, isSuccess: false);

    try {
      final uid = await _storage.read(key: 'uid');
      if (uid == null) {
        state = state.copyWith(isLoading: false, error: "User not logged in");
        return;
      }

      final machineId = const Uuid().v4();
      
      final formData = FormData.fromMap({
        'Machine_id': machineId,
        'Machine_name': machineName,
        'RentType': rentType,
        'uid': uid,
        'image': await MultipartFile.fromFile(imageFile.path),
      });

      final response = await _apiClient.dio.post(
        '/machine/addMachine',
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        state = state.copyWith(isLoading: false, isSuccess: true);
        _ref.read(homeProvider.notifier).loadDashboardData();
      } else {
        state = state.copyWith(
          isLoading: false, 
          error: response.data['message'] ?? 'Failed to add machine',
        );
      }
    } catch (e) {
      String errorMessage = "An error occurred";
      if (e is DioException) {
        errorMessage = e.response?.data?['message'] ?? e.message ?? "Network error";
      } else {
        errorMessage = e.toString();
      }
      state = state.copyWith(isLoading: false, error: errorMessage);
    }
  }
}
