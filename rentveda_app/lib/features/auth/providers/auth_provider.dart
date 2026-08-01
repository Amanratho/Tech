import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../../core/network/api_client.dart';

// State definition for Auth
class AuthState {
  final bool isLoading;
  final String? error;
  final bool otpSent;
  final bool otpVerified;

  AuthState({
    this.isLoading = false,
    this.error,
    this.otpSent = false,
    this.otpVerified = false,
  });

  AuthState copyWith({
    bool? isLoading,
    String? error,
    bool? otpSent,
    bool? otpVerified,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      otpSent: otpSent ?? this.otpSent,
      otpVerified: otpVerified ?? this.otpVerified,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient apiClient;

  AuthNotifier(this.apiClient) : super(AuthState());

  void resetOtp() {
    state = state.copyWith(otpSent: false, otpVerified: false);
  }

  // ─── LOGIN (matching React's handleLogin) ───
  // Step 1: Firebase signInWithEmailAndPassword → get idToken
  // Step 2: Send idToken to backend /api/auth/login
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Step 1: Authenticate with Firebase
      debugPrint('🔑 [LOGIN] Step 1: Firebase signIn for $email');
      final userCredential = await FirebaseAuth.instance
          .signInWithEmailAndPassword(email: email, password: password);
      debugPrint('🔑 [LOGIN] Firebase signIn SUCCESS. UID: ${userCredential.user?.uid}');

      final idToken = await userCredential.user?.getIdToken();
      debugPrint('🔑 [LOGIN] idToken received: ${idToken != null ? "YES (${idToken.length} chars)" : "NULL"}');

      if (idToken == null) {
        state = state.copyWith(isLoading: false, error: 'Failed to get auth token');
        return false;
      }

      // Step 2: Send idToken to backend
      debugPrint('🔑 [LOGIN] Step 2: Sending idToken to backend...');
      final response = await apiClient.dio.post('/auth/login', data: {
        'idToken': idToken,
      });
      debugPrint('🔑 [LOGIN] Backend response status: ${response.statusCode}');
      debugPrint('🔑 [LOGIN] Backend response data: ${response.data}');

      if (response.statusCode == 200 && response.data != null) {
        final token = response.data['token'];
        if (token != null) {
          await apiClient.secureStorage.write(key: 'token', value: token);
        }
        final userData = response.data['user'];
        if (userData != null && userData['uid'] != null) {
          await apiClient.secureStorage.write(key: 'uid', value: userData['uid']);
        }
        state = state.copyWith(isLoading: false);
        return true;
      }
      state = state.copyWith(isLoading: false, error: 'Login failed');
      return false;
    } on FirebaseAuthException catch (e) {
      debugPrint('❌ [LOGIN] FirebaseAuthException: code=${e.code}, message=${e.message}');
      String errorMsg;
      if (e.code == 'user-not-found') {
        errorMsg = 'No user found with this email';
      } else if (e.code == 'wrong-password' || e.code == 'invalid-credential') {
        errorMsg = 'Invalid email or password';
      } else {
        errorMsg = e.message ?? 'Authentication failed';
      }
      state = state.copyWith(isLoading: false, error: errorMsg);
      return false;
    } on DioException catch (e) {
      debugPrint('❌ [LOGIN] DioException: status=${e.response?.statusCode}, data=${e.response?.data}');
      final errorMsg = e.response?.data is Map
          ? (e.response?.data['error'] ?? e.response?.data['message'] ?? 'Server error')
          : 'Server error';
      state = state.copyWith(isLoading: false, error: errorMsg);
      return false;
    } catch (e) {
      debugPrint('❌ [LOGIN] Unknown error: ${e.runtimeType} → $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // ─── SEND OTP (matching React's handleOtpSend → /api/otp/send-otp) ───
  Future<bool> sendOtp(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await apiClient.dio.post('/otp/send-otp', data: {
        'email': email,
      });
      if (response.data['success'] == true) {
        state = state.copyWith(isLoading: false, otpSent: true);
        return true;
      }
      state = state.copyWith(isLoading: false, error: 'Failed to send OTP');
      return false;
    } on DioException catch (e) {
      final errorMsg = e.response?.data is Map
          ? (e.response?.data['error'] ?? 'Failed to send OTP')
          : 'Server error';
      state = state.copyWith(isLoading: false, error: errorMsg);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Connection error');
      return false;
    }
  }

  // ─── VERIFY OTP (matching React's handleOtpVerify → /api/otp/verify-otp) ───
  Future<bool> verifyOtp(String email, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await apiClient.dio.post('/otp/verify-otp', data: {
        'email': email,
        'otp': otp,
      });
      if (response.data['success'] == true) {
        state = state.copyWith(isLoading: false, otpVerified: true);
        return true;
      }
      state = state.copyWith(isLoading: false, error: 'Invalid OTP');
      return false;
    } on DioException catch (e) {
      final errorMsg = e.response?.data is Map
          ? (e.response?.data['error'] ?? 'Invalid OTP')
          : 'Server error';
      state = state.copyWith(isLoading: false, error: errorMsg);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Connection error');
      return false;
    }
  }

  // ─── CREATE ACCOUNT (matching React's handleCompleteAccountCreation → /api/auth/complete-signup) ───
  Future<bool> createAccount({
    required String email,
    required String password,
    required String username,
    required String mobileNo,
    String? companyName,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await apiClient.dio.post('/auth/complete-signup', data: {
        'email': email,
        'password': password,
        'username': username,
        'mobileNo': mobileNo,
        'companyName': companyName,
      });
      if (response.data?['success'] == true) {
        state = state.copyWith(isLoading: false, otpSent: false, otpVerified: false);
        return true;
      }
      state = state.copyWith(isLoading: false, error: 'Failed to create account');
      return false;
    } on DioException catch (e) {
      String errorMsg;
      if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
        errorMsg = 'Server is taking too long. Please try again.';
      } else if (e.response?.data is Map) {
        errorMsg = e.response?.data['error'] ?? e.response?.data['message'] ?? 'Server error';
      } else {
        errorMsg = 'Server error';
      }
      state = state.copyWith(isLoading: false, error: errorMsg, otpSent: false, otpVerified: false);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Connection error', otpSent: false, otpVerified: false);
      return false;
    }
  }

  // ─── FORGOT PASSWORD (matching React's handleForgotPassword → /api/auth/check-email) ───
  Future<bool> forgotPassword(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await apiClient.dio.post('/auth/check-email', data: {
        'email': email,
      });
      if (response.data['exists'] == true) {
        // In React, this calls Firebase's sendPasswordResetEmail.
        // For Flutter, we'll handle this via backend later.
        state = state.copyWith(isLoading: false);
        return true;
      }
      state = state.copyWith(isLoading: false, error: 'Email not registered');
      return false;
    } on DioException catch (e) {
      final errorMsg = e.response?.data is Map
          ? (e.response?.data['error'] ?? 'Server error')
          : 'Server error';
      state = state.copyWith(isLoading: false, error: errorMsg);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Connection error');
      return false;
    }
  }
}

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthNotifier(apiClient);
});
