import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';

// Provider for ApiClient
final machineApiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

// Models
class MachineSummary {
  final String id;
  final String name;
  final String image;
  final String rentType;
  final bool isArchived;
  final double totalPaidAmount;
  final double totalPendingAmount;
  final double calculatedTotalAmount;
  final double calculatedTotalWork;
  final double totalExpense;
  final double totalIncome;

  MachineSummary({
    required this.id,
    required this.name,
    required this.image,
    required this.rentType,
    required this.isArchived,
    required this.totalPaidAmount,
    required this.totalPendingAmount,
    required this.calculatedTotalAmount,
    required this.calculatedTotalWork,
    required this.totalExpense,
    required this.totalIncome,
  });

  factory MachineSummary.fromJson(Map<String, dynamic> json) {
    return MachineSummary(
      id: json['Machine_id'] ?? json['_id']?.toString() ?? '',
      name: json['Machine_name'] ?? 'Unknown',
      image: json['image'] ?? '',
      rentType: json['RentType'] ?? 'Units',
      isArchived: json['isArchived'] == true || json['status'] == 'archived' || json['isActive'] == false,
      totalPaidAmount: (json['totalPaidAmount'] ?? 0).toDouble(),
      totalPendingAmount: (json['totalPendingAmount'] ?? 0).toDouble(),
      calculatedTotalAmount: (json['calculatedTotalAmount'] ?? 0).toDouble(),
      calculatedTotalWork: (json['calculatedTotalWork'] ?? 0).toDouble(),
      totalExpense: (json['totalExpense'] ?? 0).toDouble(),
      totalIncome: (json['totalIncome'] ?? 0).toDouble(),
    );
  }
}

class MaintenanceEntry {
  final String id;
  final String type;
  final double amount;
  final String description;
  final String date;

  MaintenanceEntry({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    required this.date,
  });

  factory MaintenanceEntry.fromJson(Map<String, dynamic> json) {
    return MaintenanceEntry(
      id: json['_id'] ?? '',
      type: json['type'] ?? 'expense',
      amount: (json['amount'] ?? 0).toDouble(),
      description: json['description'] ?? '',
      date: json['date'] ?? '',
    );
  }
}

// State
class MachineMaintenanceState {
  final bool isLoading;
  final List<MachineSummary> summaries;
  final String? error;

  MachineMaintenanceState({
    this.isLoading = false,
    this.summaries = const [],
    this.error,
  });

  MachineMaintenanceState copyWith({
    bool? isLoading,
    List<MachineSummary>? summaries,
    String? error,
  }) {
    return MachineMaintenanceState(
      isLoading: isLoading ?? this.isLoading,
      summaries: summaries ?? this.summaries,
      error: error,
    );
  }
}

// Notifier
class MachineMaintenanceNotifier extends StateNotifier<MachineMaintenanceState> {
  final ApiClient _apiClient;

  MachineMaintenanceNotifier(this._apiClient) : super(MachineMaintenanceState()) {
    fetchMachineSummary();
  }

  Future<void> fetchMachineSummary() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final uid = await _apiClient.secureStorage.read(key: 'uid');
      if (uid == null) throw Exception("User not logged in");

      final response = await _apiClient.dio.post(
        '/machines/summary',
        data: {'uid': uid},
        queryParameters: {'includeArchived': true},
      );

      if (response.data is List) {
        final List data = response.data;
        final summaries = data.map((e) => MachineSummary.fromJson(e as Map<String, dynamic>)).toList();
        state = state.copyWith(isLoading: false, summaries: summaries);
      } else if (response.data is Map && response.data['success'] == true) {
        final List data = response.data['data'] ?? [];
        final summaries = data.map((e) => MachineSummary.fromJson(e as Map<String, dynamic>)).toList();
        state = state.copyWith(isLoading: false, summaries: summaries);
      } else {
        throw Exception((response.data is Map) ? response.data['message'] : 'Failed to fetch summary');
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<Map<String, dynamic>> fetchMaintenance(String machineId) async {
    try {
      final response = await _apiClient.dio.get('/maintenance/$machineId');
      if (response.data['success'] == true) {
        final List data = response.data['data'] ?? [];
        final entries = data.map((e) => MaintenanceEntry.fromJson(e)).toList();
        return {
          'entries': entries,
          'totalIncome': (response.data['totalIncome'] ?? 0).toDouble(),
          'totalExpense': (response.data['totalExpense'] ?? 0).toDouble(),
        };
      }
      return {'entries': <MaintenanceEntry>[], 'totalIncome': 0.0, 'totalExpense': 0.0};
    } catch (e) {
      return {'entries': <MaintenanceEntry>[], 'totalIncome': 0.0, 'totalExpense': 0.0};
    }
  }

  Future<bool> addMaintenance({
    required String type,
    required double amount,
    required String description,
    required String date,
    required String machineId,
  }) async {
    try {
      final uid = await _apiClient.secureStorage.read(key: 'uid');
      final response = await _apiClient.dio.post(
        '/add-maintenance',
        data: {
          'type': type,
          'amount': amount,
          'description': description,
          'date': date,
          'machineId': machineId,
          'uid': uid,
        },
      );
      if (response.data['success'] == true) {
        // Refresh summary
        fetchMachineSummary();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteMaintenance(String id) async {
    try {
      final response = await _apiClient.dio.delete('/delete-maintenance/$id');
      if (response.data['success'] == true) {
        // Refresh summary
        fetchMachineSummary();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

final machineMaintenanceProvider = StateNotifierProvider<MachineMaintenanceNotifier, MachineMaintenanceState>((ref) {
  final apiClient = ref.watch(machineApiClientProvider);
  return MachineMaintenanceNotifier(apiClient);
});
