import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
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
  final String? locationAddress;
  final double currentAccuracy;
  final double currentSpeed;
  final double areaSqMeters;
  final double areaAcres;
  final bool isLocating;
  final String? error;

  const AreaTrackerState({
    this.status = AreaTrackingStatus.idle,
    this.mode = TrackingMode.perimeterWalk,
    this.mapStyle = MapLayerStyle.satellite,
    this.points = const [],
    this.currentLocation,
    this.locationAddress,
    this.currentAccuracy = 0.0,
    this.currentSpeed = 0.0,
    this.areaSqMeters = 0.0,
    this.areaAcres = 0.0,
    this.isLocating = false,
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
    String? locationAddress,
    double? currentAccuracy,
    double? currentSpeed,
    double? areaSqMeters,
    double? areaAcres,
    bool? isLocating,
    String? error,
  }) {
    return AreaTrackerState(
      status: status ?? this.status,
      mode: mode ?? this.mode,
      mapStyle: mapStyle ?? this.mapStyle,
      points: points ?? this.points,
      currentLocation: currentLocation ?? this.currentLocation,
      locationAddress: locationAddress ?? this.locationAddress,
      currentAccuracy: currentAccuracy ?? this.currentAccuracy,
      currentSpeed: currentSpeed ?? this.currentSpeed,
      areaSqMeters: areaSqMeters ?? this.areaSqMeters,
      areaAcres: areaAcres ?? this.areaAcres,
      isLocating: isLocating ?? this.isLocating,
      error: error,
    );
  }
}

class AreaTrackerNotifier extends StateNotifier<AreaTrackerState> {
  StreamSubscription<Position>? _positionStream;
  Position? _lastValidPosition;
  final Geocoding _geocoding = Geocoding();

  AreaTrackerNotifier() : super(const AreaTrackerState()) {
    initLocation();
  }

  Future<void> initLocation() async {
    state = state.copyWith(isLocating: true);
    try {
      final hasPerm = await _checkPermissions();
      if (!hasPerm) {
        state = state.copyWith(isLocating: false);
        return;
      }

      // 1. Instantly get last known position to center map with zero delay
      final lastPos = await Geolocator.getLastKnownPosition();
      if (lastPos != null) {
        final initialCoord = LatLng(lastPos.latitude, lastPos.longitude);
        state = state.copyWith(
          currentLocation: initialCoord,
          currentAccuracy: lastPos.accuracy,
        );
        _fetchAddress(lastPos.latitude, lastPos.longitude);
      }

      // 2. Fetch fresh high-accuracy position with 8 second timeout
      final freshPos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      ).timeout(const Duration(seconds: 8), onTimeout: () {
        return lastPos ?? Position(
          longitude: 78.6569,
          latitude: 22.9734,
          timestamp: DateTime.now(),
          accuracy: 0.0,
          altitude: 0.0,
          altitudeAccuracy: 0.0,
          heading: 0.0,
          headingAccuracy: 0.0,
          speed: 0.0,
          speedAccuracy: 0.0,
        );
      });

      final freshCoord = LatLng(freshPos.latitude, freshPos.longitude);
      state = state.copyWith(
        currentLocation: freshCoord,
        currentAccuracy: freshPos.accuracy,
        isLocating: false,
      );

      _fetchAddress(freshPos.latitude, freshPos.longitude);
    } catch (e) {
      state = state.copyWith(isLocating: false, error: e.toString());
    }
  }

  Future<void> _fetchAddress(double lat, double lon) async {
    try {
      final placemarks = await _geocoding.placemarkFromCoordinates(lat, lon);
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        final parts = <String>[];
        if (p.subLocality != null && p.subLocality!.isNotEmpty) {
          parts.add(p.subLocality!);
        } else if (p.street != null && p.street!.isNotEmpty) {
          parts.add(p.street!);
        }
        if (p.locality != null && p.locality!.isNotEmpty) {
          parts.add(p.locality!);
        } else if (p.subAdministrativeArea != null && p.subAdministrativeArea!.isNotEmpty) {
          parts.add(p.subAdministrativeArea!);
        }
        if (p.administrativeArea != null && p.administrativeArea!.isNotEmpty) {
          parts.add(p.administrativeArea!);
        }

        final addressStr = parts.isNotEmpty ? parts.join(', ') : '${lat.toStringAsFixed(4)}, ${lon.toStringAsFixed(4)}';
        state = state.copyWith(locationAddress: addressStr);
      }
    } catch (_) {
      // Fallback: Coordinates string if geocoding fails or offline
      state = state.copyWith(
        locationAddress: '${lat.toStringAsFixed(4)}, ${lon.toStringAsFixed(4)}',
      );
    }
  }

  Future<bool> _checkPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      state = state.copyWith(error: 'Location services are disabled. Please turn on GPS.');
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
      state = state.copyWith(error: 'Location permissions are permanently denied.');
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

    // If starting tracking and we have a current location and no points yet,
    // immediately append Point 1 so user gets instant visual confirmation!
    if (state.points.isEmpty && state.currentLocation != null) {
      _appendPoint(state.currentLocation!);
    }

    _startLocationStream();
  }

  void _startLocationStream() {
    _positionStream?.cancel();

    const settings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 1, // trigger updates every 1 meter
    );

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

    // Update location address if not yet set
    if (state.locationAddress == null || state.locationAddress!.contains(',')) {
      _fetchAddress(position.latitude, position.longitude);
    }

    if (state.status != AreaTrackingStatus.recording) return;

    // In Walk/Drive perimeter mode, automatically record path points
    if (state.mode == TrackingMode.perimeterWalk) {
      // 1. Realistic Accuracy Filter (< 30.0 meters for outdoor machinery)
      if (position.accuracy > 30.0) return;

      if (_lastValidPosition != null) {
        final dist = Geolocator.distanceBetween(
          _lastValidPosition!.latitude,
          _lastValidPosition!.longitude,
          position.latitude,
          position.longitude,
        );

        // 2. Speed Glitch / Teleportation Drop (> 50 km/h or > 40m in 1 sec)
        final timeDiff = position.timestamp.difference(_lastValidPosition!.timestamp).inMilliseconds / 1000.0;
        if (timeDiff > 0) {
          final computedSpeed = (dist / timeDiff) * 3.6;
          if (computedSpeed > 50.0 || (dist > 40.0 && timeDiff < 1.5)) {
            return; // Drop glitch spike
          }
        }

        // 3. Distance threshold (at least 1.5m movement to avoid cluster jitter)
        if (dist < 1.5) {
          return;
        }
      }

      _lastValidPosition = position;
      _appendPoint(newCoord);
    }
  }

  /// Adds a point at current GPS position (Manual Corner Pin)
  Future<bool> addManualCornerPoint() async {
    if (state.currentLocation != null) {
      _appendPoint(state.currentLocation!);
      return true;
    }

    // If current location not yet available, try actively fetching it
    state = state.copyWith(isLocating: true);
    try {
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      ).timeout(const Duration(seconds: 5));

      final coord = LatLng(pos.latitude, pos.longitude);
      state = state.copyWith(
        currentLocation: coord,
        currentAccuracy: pos.accuracy,
        isLocating: false,
      );
      _fetchAddress(pos.latitude, pos.longitude);
      _appendPoint(coord);
      return true;
    } catch (_) {
      state = state.copyWith(isLocating: false);
      return false;
    }
  }

  /// Adds a corner point anywhere the user taps on the map!
  void addPointAtCoordinate(LatLng coord) {
    _appendPoint(coord);
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

  void clearAllPoints() {
    _lastValidPosition = null;
    state = state.copyWith(
      points: [],
      areaSqMeters: 0.0,
      areaAcres: 0.0,
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
