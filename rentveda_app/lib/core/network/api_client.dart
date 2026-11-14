import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'https://tech-2-z4n5.onrender.com/api';
  static void Function()? onAuthExpired;
  final Dio dio;
  final FlutterSecureStorage secureStorage;

  ApiClient()
      : dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 60),
          receiveTimeout: const Duration(seconds: 60),
        )),
        secureStorage = const FlutterSecureStorage() {
    _initializeInterceptors();
  }

  void _initializeInterceptors() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Attach token to every request if available
          final token = await secureStorage.read(key: 'token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          // Global error handling, e.g. for 401 Unauthorized
          if (e.response?.statusCode == 401) {
            await secureStorage.delete(key: 'token');
            await secureStorage.delete(key: 'uid');
            onAuthExpired?.call();
          }
          return handler.next(e);
        },
      ),
    );
  }
}
