import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../core/network/api_client.dart';
import '../../home/providers/home_provider.dart';
import '../../statement/providers/statement_provider.dart';
import '../../summary/providers/billing_history_provider.dart';
import '../../reminders/providers/reminders_provider.dart';
import '../../payments/providers/payment_tracking_provider.dart';
import '../../eod_dashboard/providers/eod_dashboard_provider.dart';

class ProfileState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? userData;
  final bool isSuccess;

  ProfileState({
    this.isLoading = false,
    this.error,
    this.userData,
    this.isSuccess = false,
  });

  ProfileState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? userData,
    bool? isSuccess,
  }) {
    return ProfileState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      userData: userData ?? this.userData,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

class ProfileNotifier extends StateNotifier<ProfileState> {
  final ApiClient apiClient;
  final Ref ref;

  ProfileNotifier(this.apiClient, this.ref) : super(ProfileState());

  Future<void> fetchProfile() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) {
        state = state.copyWith(isLoading: false, error: 'User ID not found');
        return;
      }
      
      final response = await apiClient.dio.get('/users/$uid');
      if (response.statusCode == 200) {
        state = state.copyWith(isLoading: false, userData: response.data);
      } else {
        state = state.copyWith(isLoading: false, error: 'Failed to fetch profile');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Connection error');
    }
  }

  Future<void> updateProfile({
    required String username,
    required String mobileNo,
    required String companyName,
    File? qrImage,
    String? password,
  }) async {
    state = state.copyWith(isLoading: true, error: null, isSuccess: false);
    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) {
        state = state.copyWith(isLoading: false, error: 'User ID not found');
        return;
      }

      final Map<String, dynamic> formDataMap = {
        'username': username,
        'mobileNo': mobileNo,
        'companyName': companyName,
      };

      if (password != null && password.trim().isNotEmpty) {
        formDataMap['password'] = password.trim();
      }

      if (qrImage != null) {
        formDataMap['qrImage'] = await MultipartFile.fromFile(qrImage.path);
      }

      final formData = FormData.fromMap(formDataMap);

      final response = await apiClient.dio.put(
        '/users/$uid',
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );

      if (response.statusCode == 200) {
        state = state.copyWith(isLoading: false, isSuccess: true);
        await fetchProfile(); // Refresh data
      } else {
        state = state.copyWith(isLoading: false, error: 'Failed to update profile');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Connection error');
    }
  }

  Future<bool> deleteAccount() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid == null) return false;

      final response = await apiClient.dio.delete('/user/delete/$uid');
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        await logout();
        return true;
      }
      state = state.copyWith(isLoading: false, error: 'Failed to delete account');
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Connection error');
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await FirebaseAuth.instance.signOut();
    } catch (e) {
      debugPrint("Firebase signout error: $e");
    }
    await apiClient.secureStorage.delete(key: 'uid');
    await apiClient.secureStorage.delete(key: 'token');
    ref.invalidate(homeProvider);
    ref.invalidate(statementProvider);
    ref.invalidate(billingHistoryProvider);
    ref.invalidate(remindersProvider);
    ref.invalidate(paymentTrackingProvider);
    ref.invalidate(eodDashboardProvider);
    state = ProfileState();
  }
}

final profileProvider = StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProfileNotifier(apiClient, ref);
});
