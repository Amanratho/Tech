import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import '../utils/area_calculator.dart';

enum AreaTrackingStatus { idle, recording, paused, completed }
enum TrackingMode { perimeterWalk, cornerPin }
enum MapLayerStyle { satellite, street }

class AreaTrackerState {
  final AreaTrackingStatus status;
  final TrackingMode mode;
  final MapLayerStyle mapStyle;
  final List<LatLng> points;
  final LatLng? currentLocation;
  final double currentAccuracy;
  final double currentSpeed;
  final double areaSqMeters;
  final double areaAcres;
  final String? error;

  const AreaTrackerState({
    this.status = AreaTrackingStatus.idle,
    this.mode = TrackingMode.perimeterWalk,
    this.mapStyle = MapLayerStyle.satellite,
    this.points = const [],
    this.currentLocation,
    this.currentAccuracy = 0.0,
    this.currentSpeed = 0.0,
    this.areaSqMeters = 0.0,
    this.areaAcres = 0.0,
    this.error,
  });

  bool get isRecording => status == AreaTrackingStatus.recording;
  bool get isPaused => status == AreaTrackingStatus.paused;
  bool get isIdle => status == AreaTrackingStatus.idle;
  bool get isSatellite => mapStyle == MapLayerStyle.satellite;

  AreaTrackerState copyWith({
    AreaTrackingStatus? status,
    TrackingMode? mode,
    MapLayerStyle? mapStyle,
    List<LatLng>? points,
    LatLng? currentLocation,
    double? currentAccuracy,
    double? currentSpeed,
    double? areaSqMeters,
    double? areaAcres,
    String? error,
  }) {
    return AreaTrackerState(
      status: status ?? this.status,
      mode: mode ?? this.mode,
      mapStyle: mapStyle ?? this.mapStyle,
      points: points ?? this.points,
      currentLocation: currentLocation ?? this.currentLocation,
      currentAccuracy: currentAccuracy ?? this.currentAccuracy,
      currentSpeed: currentSpeed ?? this.currentSpeed,
      areaSqMeters: areaSqMeters ?? this.areaSqMeters,
      areaAcres: areaAcres ?? this.areaAcres,
      error: error,
    );
  }
}

class AreaTrackerNotifier extends StateNotifier<AreaTrackerState> {
  StreamSubscription<Position>? _positionStream;
  Position? _lastValidPosition;

  AreaTrackerNotifier() : super(const AreaTrackerState()) {
    _initCurrentLocation();
  }

  Future<void> _initCurrentLocation() async {
    try {
      final hasPerm = await _checkPermissions();
      if (!hasPerm) return;

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      state = state.copyWith(
        currentLocation: LatLng(pos.latitude, pos.longitude),
        currentAccuracy: pos.accuracy,
      );
    } catch (_) {}
  }

  Future<bool> _checkPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      state = state.copyWith(error: 'Location services are disabled');
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        state = state.copyWith(error: 'Location permissions denied');
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      state = state.copyWith(error: 'Location permissions are permanently denied');
      return false;
    }

    return true;
  }

  void toggleMapStyle() {
    state = state.copyWith(
      mapStyle: state.mapStyle == MapLayerStyle.satellite
          ? MapLayerStyle.street
          : MapLayerStyle.satellite,
    );
  }

  void setTrackingMode(TrackingMode mode) {
    state = state.copyWith(mode: mode);
  }

  Future<void> startTracking() async {
    final hasPerm = await _checkPermissions();
    if (!hasPerm) return;

    state = state.copyWith(
      status: AreaTrackingStatus.recording,
      error: null,
    );

    _startLocationStream();
  }

  void _startLocationStream() {
    _positionStream?.cancel();

    late LocationSettings settings;
    if (defaultTargetPlatform == TargetPlatform.android) {
      settings = AndroidSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: 2,
        intervalDuration: const Duration(seconds: 1),
        foregroundNotificationConfig: const ForegroundNotificationConfig(
          notificationTitle: "RentVeda Zameen Tracker",
          notificationText: "Recording field boundary in background...",
          enableWakeLock: true,
        ),
      );
    } else {
      settings = const LocationSettings(
        accuracy: LocationAccuracy.bestForNavigation,
        distanceFilter: 2,
      );
    }

    _positionStream = Geolocator.getPositionStream(locationSettings: settings).listen(
      (Position position) {
        _handleNewPosition(position);
      },
      onError: (err) {
        state = state.copyWith(error: err.toString());
      },
    );
  }

  void _handleNewPosition(Position position) {
    final newCoord = LatLng(position.latitude, position.longitude);
    final speedKmH = (position.speed * 3.6).clamp(0.0, 100.0);

    state = state.copyWith(
      currentLocation: newCoord,
      currentAccuracy: position.accuracy,
      currentSpeed: speedKmH,
    );

    if (state.status != AreaTrackingStatus.recording) return;

    // --- 3-LAYER NOISE FILTER FOR PERIMETER TRACKING ---
    if (state.mode == TrackingMode.perimeterWalk) {
      // 1. Horizontal Accuracy Filter (< 5.0 meters)
      if (position.accuracy > 5.0) return;

      if (_lastValidPosition != null) {
        final dist = Geolocator.distanceBetween(
          _lastValidPosition!.latitude,
          _lastValidPosition!.longitude,
          position.latitude,
          position.longitude,
        );

        // 2. Speed Glitch / Teleportation Drop
        final timeDiff = position.timestamp.difference(_lastValidPosition!.timestamp).inMilliseconds / 1000.0;
        if (timeDiff > 0) {
          final computedSpeed = (dist / timeDiff) * 3.6;
          if (computedSpeed > 25.0 || (dist > 18.0 && timeDiff < 2.0)) {
            return; // Drop glitch spike
          }
        }

        // 3. Stationary Deadband Lock (machine moved at least 2.5 meters)
        if (dist < 2.5) {
          return;
        }
      }

      _lastValidPosition = position;
      _appendPoint(newCoord);
    }
  }

  void addManualCornerPoint() {
    if (state.currentLocation == null) return;
    _appendPoint(state.currentLocation!);
  }

  void _appendPoint(LatLng coord) {
    final updatedPoints = [...state.points, coord];
    final sqMeters = AreaCalculator.computeAreaSqMeters(updatedPoints);
    final acres = AreaCalculator.sqMetersToAcres(sqMeters);

    state = state.copyWith(
      points: updatedPoints,
      areaSqMeters: sqMeters,
      areaAcres: acres,
    );
  }

  void undoLastPoint() {
    if (state.points.isEmpty) return;
    final updatedPoints = List<LatLng>.from(state.points)..removeLast();
    final sqMeters = AreaCalculator.computeAreaSqMeters(updatedPoints);
    final acres = AreaCalculator.sqMetersToAcres(sqMeters);

    state = state.copyWith(
      points: updatedPoints,
      areaSqMeters: sqMeters,
      areaAcres: acres,
    );
  }

  void pauseTracking() {
    _positionStream?.pause();
    state = state.copyWith(status: AreaTrackingStatus.paused);
  }

  void resumeTracking() {
    _positionStream?.resume();
    state = state.copyWith(status: AreaTrackingStatus.recording);
  }

  void finishTracking() {
    _positionStream?.cancel();
    state = state.copyWith(status: AreaTrackingStatus.completed);
  }

  void reset() {
    _positionStream?.cancel();
    _lastValidPosition = null;
    state = state.copyWith(
      status: AreaTrackingStatus.idle,
      points: [],
      areaSqMeters: 0.0,
      areaAcres: 0.0,
      error: null,
    );
  }

  @override
  void dispose() {
    _positionStream?.cancel();
    super.dispose();
  }
}

final areaTrackerProvider = StateNotifierProvider<AreaTrackerNotifier, AreaTrackerState>((ref) {
  return AreaTrackerNotifier();
});
