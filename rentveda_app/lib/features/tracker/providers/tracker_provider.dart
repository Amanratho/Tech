import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:math' show cos, sqrt, asin;

enum TrackerTab { time, count, distance }
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

  void doneTime() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('rentveda_pending_time_entry', state.time);
    await prefs.remove('rentveda_timer_status');
    await prefs.remove('rentveda_startTime');
    await prefs.remove('rentveda_pausedTime');

    _timer?.cancel();

    state = state.copyWith(
      timerStatus: TimerStatus.idle,
      time: 0,
      startTime: null,
    );
  }

  // --- COUNT LOGIC ---

  void incrementCount() async {
    final newCount = state.count + 1;
    state = state.copyWith(count: newCount);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('rentveda_count', newCount);
  }

  void decrementCount() async {
    final newCount = state.count > 0 ? state.count - 1 : 0;
    state = state.copyWith(count: newCount);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('rentveda_count', newCount);
  }

  void doneCount() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('rentveda_pending_count_entry', state.count);
    await prefs.remove('rentveda_count');

    state = state.copyWith(count: 0);
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
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble('rentveda_pending_km_entry', state.distance);
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
