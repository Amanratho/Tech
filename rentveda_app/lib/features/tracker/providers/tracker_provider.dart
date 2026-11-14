import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:math' show cos, sqrt, asin;

enum TrackerTab { time, count, distance, area }
enum TimerStatus { idle, running, paused }

class TrackerState {
  final TrackerTab activeTab;
  final TimerStatus timerStatus;
  final int time;
  final int count;
  final double distance;
  final int? startTime;
  final String? error;

  TrackerState({
    this.activeTab = TrackerTab.time,
    this.timerStatus = TimerStatus.idle,
    this.time = 0,
    this.count = 0,
    this.distance = 0.0,
    this.startTime,
    this.error,
  });

  TrackerState copyWith({
    TrackerTab? activeTab,
    TimerStatus? timerStatus,
    int? time,
    int? count,
    double? distance,
    int? startTime,
    String? error,
  }) {
    return TrackerState(
      activeTab: activeTab ?? this.activeTab,
      timerStatus: timerStatus ?? this.timerStatus,
      time: time ?? this.time,
      count: count ?? this.count,
      distance: distance ?? this.distance,
      startTime: startTime ?? this.startTime,
      error: error,
    );
  }
}

class TrackerNotifier extends StateNotifier<TrackerState> {
  Timer? _timer;
  StreamSubscription<Position>? _positionStream;
  Position? _lastPosition;

  TrackerNotifier() : super(TrackerState()) {
    _init();
  }

  Future<void> _init() async {
    final prefs = await SharedPreferences.getInstance();
    final savedTab = prefs.getString('rentveda_activeTab');
    final savedCount = prefs.getInt('rentveda_count');
    final savedDistance = prefs.getDouble('rentveda_distance');
    final savedStatus = prefs.getString('rentveda_timer_status');
    final savedStartTime = prefs.getInt('rentveda_startTime');
    final savedPausedTime = prefs.getInt('rentveda_pausedTime');

    TrackerTab tab = TrackerTab.time;
    if (savedTab == 'COUNT') tab = TrackerTab.count;
    if (savedTab == 'DISTANCE') tab = TrackerTab.distance;
    if (savedTab == 'AREA') tab = TrackerTab.area;

    int currentCount = savedCount ?? 0;
    double currentDistance = savedDistance ?? 0.0;
    
    TimerStatus status = TimerStatus.idle;
    int currentTime = 0;
    int? currentStartTime;

    if (savedStatus == 'RUNNING' && savedStartTime != null) {
      status = TimerStatus.running;
      currentStartTime = savedStartTime;
      final elapsed = ((DateTime.now().millisecondsSinceEpoch - savedStartTime) / 1000).floor();
      currentTime = elapsed > 0 ? elapsed : 0;
    } else if (savedStatus == 'PAUSED' && savedPausedTime != null) {
      status = TimerStatus.paused;
      currentTime = savedPausedTime;
    }

    state = state.copyWith(
      activeTab: tab,
      count: currentCount,
      distance: currentDistance,
      timerStatus: status,
      time: currentTime,
      startTime: currentStartTime,
    );

    if (status == TimerStatus.running) {
      _startTimer();
      if (tab == TrackerTab.distance) {
        _startLocationTracking();
      }
    }
  }

  void setActiveTab(TrackerTab tab) async {
    if (state.timerStatus != TimerStatus.idle) return; // Prevent changing tabs while running
    
    state = state.copyWith(activeTab: tab);
    final prefs = await SharedPreferences.getInstance();
    
    String tabStr = 'TIME';
    if (tab == TrackerTab.count) tabStr = 'COUNT';
    if (tab == TrackerTab.distance) tabStr = 'DISTANCE';
    if (tab == TrackerTab.area) tabStr = 'AREA';
    
    await prefs.setString('rentveda_activeTab', tabStr);
  }

  // --- TIME LOGIC ---

  void startTimer() async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final startTime = state.timerStatus == TimerStatus.paused 
        ? now - (state.time * 1000) 
        : now;

    state = state.copyWith(
      timerStatus: TimerStatus.running,
      startTime: startTime,
    );

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('rentveda_timer_status', 'RUNNING');
    await prefs.setInt('rentveda_startTime', startTime);

    _startTimer();
    if (state.activeTab == TrackerTab.distance) {
      _startLocationTracking();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state.timerStatus != TimerStatus.running || state.startTime == null) {
        timer.cancel();
        return;
      }
      final elapsed = ((DateTime.now().millisecondsSinceEpoch - state.startTime!) / 1000).floor();
      state = state.copyWith(time: elapsed);
    });
  }

  void pauseTimer() async {
    _timer?.cancel();
    _stopLocationTracking();
    
    state = state.copyWith(timerStatus: TimerStatus.paused);
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('rentveda_timer_status', 'PAUSED');
    await prefs.setInt('rentveda_pausedTime', state.time);
  }

  Future<void> _recordHistory({
    required String type,
    required String value,
    required String rawValue,
    required double qty,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyList = prefs.getStringList('rentveda_tracker_history') ?? [];
      final newItem = jsonEncode({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'type': type,
        'value': value,
        'rawValue': rawValue,
        'qty': qty,
        'timestamp': DateTime.now().toIso8601String(),
        'isBilled': false,
      });
      final updatedList = [newItem, ...historyList];
      if (updatedList.length > 30) {
        updatedList.removeRange(30, updatedList.length);
      }
      await prefs.setStringList('rentveda_tracker_history', updatedList);
    } catch (_) {}
  }

  static Future<List<Map<String, dynamic>>> getUnbilledSessionsByType(String type, {int limit = 5}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyList = prefs.getStringList('rentveda_tracker_history') ?? [];
      final List<Map<String, dynamic>> result = [];
      for (final item in historyList) {
        final map = jsonDecode(item) as Map<String, dynamic>;
        if (map['type'] == type && map['isBilled'] != true) {
          result.add(map);
          if (result.length >= limit) break;
        }
      }
      return result;
    } catch (_) {
      return [];
    }
  }

  static Future<void> markSessionBilled(String sessionId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyList = prefs.getStringList('rentveda_tracker_history') ?? [];
      final List<String> updated = [];
      for (final item in historyList) {
        final map = jsonDecode(item) as Map<String, dynamic>;
        if (map['id'] == sessionId) {
          map['isBilled'] = true;
          updated.add(jsonEncode(map));
        } else {
          updated.add(item);
        }
      }
      await prefs.setStringList('rentveda_tracker_history', updated);
    } catch (_) {}
  }

  Future<List<Map<String, dynamic>>> getHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyList = prefs.getStringList('rentveda_tracker_history') ?? [];
      return historyList.map((item) => jsonDecode(item) as Map<String, dynamic>).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> deleteSession(String sessionId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final historyList = prefs.getStringList('rentveda_tracker_history') ?? [];
      final List<String> updated = [];
      for (final item in historyList) {
        final map = jsonDecode(item) as Map<String, dynamic>;
        if (map['id']?.toString() != sessionId) {
          updated.add(item);
        }
      }
      await prefs.setStringList('rentveda_tracker_history', updated);
    } catch (_) {}
  }

  Future<void> deleteHistoryItem(String sessionId) async {
    await deleteSession(sessionId);
  }

  Future<void> clearHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('rentveda_tracker_history');
  }

  void resetCurrent() async {
    final prefs = await SharedPreferences.getInstance();
    if (state.activeTab == TrackerTab.time) {
      _timer?.cancel();
      await prefs.remove('rentveda_timer_status');
      await prefs.remove('rentveda_startTime');
      await prefs.remove('rentveda_pausedTime');
      state = state.copyWith(
        timerStatus: TimerStatus.idle,
        time: 0,
        startTime: null,
      );
    } else if (state.activeTab == TrackerTab.count) {
      await prefs.remove('rentveda_count');
      state = state.copyWith(count: 0);
    } else if (state.activeTab == TrackerTab.distance) {
      _timer?.cancel();
      _stopLocationTracking();
      await prefs.remove('rentveda_distance');
      await prefs.remove('rentveda_timer_status');
      await prefs.remove('rentveda_startTime');
      await prefs.remove('rentveda_pausedTime');
      state = state.copyWith(
        timerStatus: TimerStatus.idle,
        distance: 0.0,
        time: 0,
        startTime: null,
      );
    }
  }

  void doneTime() async {
    final timeVal = state.time;
    final hrs = (timeVal ~/ 3600);
    final mins = ((timeVal % 3600) ~/ 60);
    final secs = (timeVal % 60);
    final formattedTime = '${hrs.toString().padLeft(2, '0')}:${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';

    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('rentveda_pending_time_entry', timeVal);
    await prefs.remove('rentveda_timer_status');
    await prefs.remove('rentveda_startTime');
    await prefs.remove('rentveda_pausedTime');

    _timer?.cancel();

    state = state.copyWith(
      timerStatus: TimerStatus.idle,
      time: 0,
      startTime: null,
    );

    if (timeVal > 0) {
      final double hours = timeVal / 3600;
      final double qty = double.parse(hours.toStringAsFixed(2));
      await _recordHistory(
        type: 'TIME',
        value: formattedTime,
        rawValue: timeVal.toString(),
        qty: qty,
      );
    }
  }

  // --- COUNT LOGIC ---

  void incrementCount([int step = 1]) async {
    final newCount = state.count + step;
    state = state.copyWith(count: newCount);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('rentveda_count', newCount);
  }

  void decrementCount([int step = 1]) async {
    final newCount = (state.count - step) >= 0 ? (state.count - step) : 0;
    state = state.copyWith(count: newCount);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('rentveda_count', newCount);
  }

  void doneCount() async {
    final countVal = state.count;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('rentveda_pending_count_entry', countVal);
    await prefs.remove('rentveda_count');

    state = state.copyWith(count: 0);

    if (countVal > 0) {
      await _recordHistory(
        type: 'COUNT',
        value: '$countVal units',
        rawValue: countVal.toString(),
        qty: countVal.toDouble(),
      );
    }
  }

  // --- DISTANCE LOGIC ---

  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double p = 0.017453292519943295; // Math.PI / 180
    final double a = 0.5 - cos((lat2 - lat1) * p)/2 + 
               cos(lat1 * p) * cos(lat2 * p) * 
               (1 - cos((lon2 - lon1) * p))/2;
    return 12742 * asin(sqrt(a)); // 2 * R; R = 6371 km
  }

  Future<void> _startLocationTracking() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      state = state.copyWith(error: 'Location services are disabled.');
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        state = state.copyWith(error: 'Location permissions are denied');
        return;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      state = state.copyWith(error: 'Location permissions are permanently denied, we cannot request permissions.');
      return;
    } 

    _lastPosition = null;
    
    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 1, // trigger updates when user moves 1 meter
    );

    _positionStream = Geolocator.getPositionStream(locationSettings: locationSettings).listen((Position position) {
      if (position.accuracy > 50) return; // Ignore inaccurate readings

      if (_lastPosition != null) {
        final dist = _calculateDistance(
          _lastPosition!.latitude, 
          _lastPosition!.longitude, 
          position.latitude, 
          position.longitude
        );
        
        // Avoid fake jumps 
        if (dist > 0.001 && dist < 2) {
          final newDist = state.distance + dist;
          state = state.copyWith(distance: newDist);
          _saveDistance(newDist);
        }
      }
      _lastPosition = position;
    });
  }
  
  void _saveDistance(double dist) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('rentveda_distance', dist);
  }

  void _stopLocationTracking() {
    _positionStream?.cancel();
    _lastPosition = null;
  }

  void doneDistance() async {
    final distVal = state.distance;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('rentveda_pending_km_entry', distVal);
    await prefs.remove('rentveda_distance');
    
    _timer?.cancel();
    _stopLocationTracking();

    await prefs.remove('rentveda_timer_status');
    await prefs.remove('rentveda_startTime');
    await prefs.remove('rentveda_pausedTime');

    state = state.copyWith(
      timerStatus: TimerStatus.idle,
      distance: 0.0,
      time: 0,
      startTime: null,
    );

    if (distVal > 0) {
      final double qty = double.parse(distVal.toStringAsFixed(2));
      await _recordHistory(
        type: 'DISTANCE',
        value: '${distVal.toStringAsFixed(2)} KM',
        rawValue: distVal.toStringAsFixed(2),
        qty: qty,
      );
    }
  }

  void doneArea(double acres) async {
    if (acres <= 0) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('rentveda_pending_acre_entry', acres);

    final double qty = double.parse(acres.toStringAsFixed(2));
    await _recordHistory(
      type: 'AREA',
      value: '${acres.toStringAsFixed(2)} Acre',
      rawValue: acres.toStringAsFixed(2),
      qty: qty,
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _positionStream?.cancel();
    super.dispose();
  }
}

final trackerProvider = StateNotifierProvider<TrackerNotifier, TrackerState>((ref) {
  return TrackerNotifier();
});
