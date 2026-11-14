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

  // ─── LOGIN (Email/Password Fallback) ───
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final userCredential = await FirebaseAuth.instance
          .signInWithEmailAndPassword(email: email, password: password);
      final idToken = await userCredential.user?.getIdToken();

      if (idToken == null) {
        state = state.copyWith(isLoading: false, error: 'Failed to get auth token');
        return false;
      }

      final response = await apiClient.dio.post('/auth/login', data: {
        'idToken': idToken,
      });

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
      final errorMsg = e.response?.data is Map
          ? (e.response?.data['error'] ?? e.response?.data['message'] ?? 'Server error')
          : 'Server error';
      state = state.copyWith(isLoading: false, error: errorMsg);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // ─── PHONE LOGIN (Mobile + OTP or Mobile + Password) ───
  Future<bool> loginWithPhone({
    required String mobileNo,
    String? otp,
    String? password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await apiClient.dio.post('/auth/phone-login', data: {
        'mobileNo': mobileNo.trim(),
        if (otp != null && otp.isNotEmpty) 'otp': otp.trim(),
        if (password != null && password.isNotEmpty) 'password': password,
      });

      if (response.statusCode == 200 && response.data?['success'] == true) {
        final token = response.data['token'];
        if (token != null) {
          await apiClient.secureStorage.write(key: 'token', value: token);
        }
        final userData = response.data['user'];
        if (userData != null && userData['uid'] != null) {
          await apiClient.secureStorage.write(key: 'uid', value: userData['uid']);
        }

        // Authenticate Firebase with custom token if available
        final customToken = response.data['customToken'];
        if (customToken != null) {
          try {
            await FirebaseAuth.instance.signInWithCustomToken(customToken);
          } catch (fbErr) {
            debugPrint('Firebase custom token signin note: $fbErr');
          }
        }

        state = state.copyWith(isLoading: false);
        return true;
      }

      state = state.copyWith(
        isLoading: false,
        error: response.data?['error'] ?? 'Login failed',
      );
      return false;
    } on DioException catch (e) {
      final errorMsg = e.response?.data is Map
          ? (e.response?.data['error'] ?? 'Login failed')
          : 'Server error';
      state = state.copyWith(isLoading: false, error: errorMsg);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // ─── PHONE SIGNUP (Name + Mobile + OTP + Company) ───
  Future<bool> signupWithPhone({
    required String mobileNo,
    required String username,
    String? companyName,
    String? password,
    String? otp,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await apiClient.dio.post('/auth/phone-signup', data: {
        'mobileNo': mobileNo.trim(),
        'username': username.trim(),
        'companyName': companyName?.trim() ?? '',
        if (password != null && password.isNotEmpty) 'password': password,
        if (otp != null && otp.isNotEmpty) 'otp': otp.trim(),
      });

      if (response.statusCode == 201 && response.data?['success'] == true) {
        final token = response.data['token'];
        if (token != null) {
          await apiClient.secureStorage.write(key: 'token', value: token);
        }
        final userData = response.data['user'] ?? response.data['registeredUser'];
        if (userData != null && userData['uid'] != null) {
          await apiClient.secureStorage.write(key: 'uid', value: userData['uid']);
        }

        final customToken = response.data['customToken'];
        if (customToken != null) {
          try {
            await FirebaseAuth.instance.signInWithCustomToken(customToken);
          } catch (fbErr) {
            debugPrint('Firebase custom token signin note: $fbErr');
          }
        }

        state = state.copyWith(isLoading: false, otpSent: false, otpVerified: false);
        return true;
      }

      state = state.copyWith(
        isLoading: false,
        error: response.data?['error'] ?? 'Failed to create account',
      );
      return false;
    } on DioException catch (e) {
      final errorMsg = e.response?.data is Map
          ? (e.response?.data['error'] ?? 'Failed to create account')
          : 'Server error';
      state = state.copyWith(isLoading: false, error: errorMsg);
      return false;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // ─── SEND OTP (Mobile or Email) ───
  Future<bool> sendOtp(String target) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final isEmail = target.contains('@');
      final response = await apiClient.dio.post('/otp/send-otp', data: {
        if (isEmail) 'email': target.trim() else 'mobileNo': target.trim(),
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

  // ─── VERIFY OTP (Mobile or Email) ───
  Future<bool> verifyOtp(String target, String otp) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final isEmail = target.contains('@');
      final response = await apiClient.dio.post('/otp/verify-otp', data: {
        if (isEmail) 'email': target.trim() else 'mobileNo': target.trim(),
        'otp': otp.trim(),
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

  // ─── CREATE ACCOUNT (Legacy Email/Password) ───
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

  // ─── FORGOT PASSWORD ───
  Future<bool> forgotPassword(String target) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      if (target.contains('@')) {
        await FirebaseAuth.instance.sendPasswordResetEmail(email: target);
      } else {
        await sendOtp(target);
      }
      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthNotifier(apiClient);
});
