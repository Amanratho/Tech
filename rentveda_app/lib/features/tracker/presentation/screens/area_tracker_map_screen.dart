import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../providers/area_tracker_provider.dart';
import '../../providers/tracker_provider.dart';
import '../../utils/area_calculator.dart';
import '../widgets/area_result_modal.dart';

class AreaTrackerMapScreen extends ConsumerStatefulWidget {
  const AreaTrackerMapScreen({super.key});

  @override
  ConsumerState<AreaTrackerMapScreen> createState() => _AreaTrackerMapScreenState();
}

class _AreaTrackerMapScreenState extends ConsumerState<AreaTrackerMapScreen> {
  final MapController _mapController = MapController();
  bool _hasInitialCentered = false;

  @override
  void initState() {
    super.initState();
    // Actively refresh location when screen opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(areaTrackerProvider.notifier).initLocation();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(areaTrackerProvider);
    final notifier = ref.read(areaTrackerProvider.notifier);

    // Auto-center map once location is received
    if (!_hasInitialCentered && state.currentLocation != null) {
      _hasInitialCentered = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _mapController.move(state.currentLocation!, 17.5);
      });
    }

    // Show error toast if any
    ref.listen<AreaTrackerState>(areaTrackerProvider, (previous, next) {
      if (next.error != null && next.error != previous?.error) {
        Fluttertoast.showToast(msg: next.error!);
      }
    });

    final hasEnoughPoints = state.points.length >= 3;
    final perimeter = AreaCalculator.computePerimeterMeters(state.points);

    return PopScope(
      canPop: state.isIdle && state.points.isEmpty,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final nav = Navigator.of(context);
        final shouldLeave = await _showDiscardConfirmDialog(context);
        if (shouldLeave == true && mounted) {
          notifier.reset();
          nav.pop();
        }
      },
      child: Scaffold(
        body: Stack(
          children: [
            // 1. FlutterMap full screen with on-tap point addition
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: state.currentLocation ?? const LatLng(22.9734, 78.6569), // Center of India
                initialZoom: 17.5,
                maxZoom: 20.0,
                minZoom: 4.0,
                onTap: (tapPosition, point) {
                  notifier.addPointAtCoordinate(point);
                  Fluttertoast.showToast(
                    msg: tr('pointAddedMsg', namedArgs: {'num': (state.points.length + 1).toString()}),
                  );
                },
              ),
              children: [
                // Satellite or Street Tile Layer
                TileLayer(
                  urlTemplate: state.isSatellite
                      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.rentveda.app',
                  maxNativeZoom: 19,
                ),

                // Polygon Layer (filled boundary when >= 3 points)
                if (hasEnoughPoints)
                  PolygonLayer(
                    polygons: [
                      Polygon(
                        points: state.points,
                        color: const Color(0x4422C55E), // Semi-transparent emerald
                        borderColor: const Color(0xFF16A34A),
                        borderStrokeWidth: 3.5,
                      ),
                    ],
                  ),

                // Polyline Layer (open boundary line while tracking)
                if (state.points.length >= 2)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: [
                          ...state.points,
                          if (hasEnoughPoints) state.points.first, // Close loop visually
                        ],
                        color: const Color(0xFF15803D),
                        strokeWidth: 3.5,
                      ),
                    ],
                  ),

                // Corner Pins & Location Markers
                MarkerLayer(
                  markers: [
                    // Corner points markers
                    for (int i = 0; i < state.points.length; i++)
                      Marker(
                        point: state.points[i],
                        width: 30,
                        height: 30,
                        child: Container(
                          decoration: BoxDecoration(
                            color: i == 0 ? Colors.amber : Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: i == 0 ? Colors.black87 : const Color(0xFF16A34A),
                              width: 2.5,
                            ),
                            boxShadow: const [
                              BoxShadow(color: Colors.black38, blurRadius: 4),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              '${i + 1}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: i == 0 ? Colors.black87 : const Color(0xFF16A34A),
                              ),
                            ),
                          ),
                        ),
                      ),

                    // User Current Location Pulse Marker
                    if (state.currentLocation != null)
                      Marker(
                        point: state.currentLocation!,
                        width: 44,
                        height: 44,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.blueAccent.withValues(alpha: 0.2),
                              ),
                            ),
                            Container(
                              width: 18,
                              height: 18,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.blueAccent,
                                border: Border.all(color: Colors.white, width: 2.5),
                                boxShadow: const [
                                  BoxShadow(color: Colors.black38, blurRadius: 4),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            ),

            // 2. Top Header Overlay (Back, Accuracy, Map Toggle, Location Address, Mode)
            Positioned(
              top: MediaQuery.of(context).padding.top + 8,
              left: 14,
              right: 14,
              child: Column(
                children: [
                  // Row 1: Back Button, Accuracy Pill, Map Toggle
                  Row(
                    children: [
                      // Back Button
                      _buildFloatingCircleBtn(
                        icon: Icons.arrow_back,
                        onPressed: () async {
                          if (state.points.isNotEmpty) {
                            final nav = Navigator.of(context);
                            final shouldLeave = await _showDiscardConfirmDialog(context);
                            if (shouldLeave == true && mounted) {
                              notifier.reset();
                              nav.pop();
                            }
                          } else {
                            Navigator.of(context).pop();
                          }
                        },
                      ),
                      const SizedBox(width: 8),

                      // GPS Accuracy Indicator
                      Expanded(child: _buildGpsAccuracyPill(state.currentAccuracy)),
                      const SizedBox(width: 8),

                      // Map Layer Toggle (Satellite vs Street)
                      _buildFloatingCircleBtn(
                        icon: state.isSatellite ? Icons.map_outlined : Icons.satellite_alt_outlined,
                        tooltip: state.isSatellite ? 'Street Map' : 'Satellite',
                        onPressed: notifier.toggleMapStyle,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Row 2: Location Address Card (Village/Tehsil/City)
                  _buildLocationAddressCard(state, notifier),
                  const SizedBox(height: 8),

                  // Row 3: Mode Selector Segmented Pill (Walk vs Pin)
                  _buildModeSelector(state, notifier),
                ],
              ),
            ),

            // 3. Side Map Controls (Recenter, Zoom In, Zoom Out)
            Positioned(
              right: 14,
              bottom: 270,
              child: Column(
                children: [
                  _buildFloatingCircleBtn(
                    icon: Icons.my_location,
                    tooltip: 'Recenter',
                    onPressed: () {
                      if (state.currentLocation != null) {
                        _mapController.move(state.currentLocation!, 17.5);
                        Fluttertoast.showToast(msg: tr('gpsAccurate'));
                      } else {
                        notifier.initLocation();
                        Fluttertoast.showToast(msg: tr('waitingForGps'));
                      }
                    },
                  ),
                  const SizedBox(height: 8),
                  _buildFloatingCircleBtn(
                    icon: Icons.add,
                    tooltip: 'Zoom In',
                    onPressed: () {
                      final currentZoom = _mapController.camera.zoom;
                      _mapController.move(_mapController.camera.center, currentZoom + 1);
                    },
                  ),
                  const SizedBox(height: 8),
                  _buildFloatingCircleBtn(
                    icon: Icons.remove,
                    tooltip: 'Zoom Out',
                    onPressed: () {
                      final currentZoom = _mapController.camera.zoom;
                      _mapController.move(_mapController.camera.center, currentZoom - 1);
                    },
                  ),
                ],
              ),
            ),

            // 4. Bottom Control Card HUD
            Positioned(
              left: 14,
              right: 14,
              bottom: MediaQuery.of(context).padding.bottom + 12,
              child: _buildBottomHudCard(context, ref, state, notifier, perimeter, hasEnoughPoints),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFloatingCircleBtn({
    required IconData icon,
    required VoidCallback onPressed,
    String? tooltip,
  }) {
    return Material(
      color: Colors.white,
      shape: const CircleBorder(),
      elevation: 4,
      shadowColor: Colors.black26,
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onPressed,
        child: SizedBox(
          width: 44,
          height: 44,
          child: Icon(icon, color: AppColors.textMain, size: 22),
        ),
      ),
    );
  }

  Widget _buildGpsAccuracyPill(double accuracy) {
    Color bg;
    Color dot;
    String label;

    if (accuracy > 0 && accuracy <= 8.0) {
      bg = AppColors.successBg;
      dot = AppColors.successDark;
      label = '${tr('gpsAccurate')} (±${accuracy.toStringAsFixed(1)}m)';
    } else if (accuracy > 8.0 && accuracy <= 25.0) {
      bg = const Color(0xFFFEF3C7); // Amber light
      dot = const Color(0xFFD97706);
      label = '${tr('gpsModerate')} (±${accuracy.toStringAsFixed(1)}m)';
    } else {
      bg = const Color(0xFFFEE2E2); // Red light
      dot = AppColors.danger;
      label = accuracy == 0.0 ? tr('gpsSearching') : '${tr('gpsWeak')} (±${accuracy.toStringAsFixed(1)}m)';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: dot.withValues(alpha: 0.3)),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 9,
            height: 9,
            decoration: BoxDecoration(shape: BoxShape.circle, color: dot),
          ),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: dot,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationAddressCard(AreaTrackerState state, AreaTrackerNotifier notifier) {
    final addressText = state.locationAddress ?? (state.isLocating ? tr('fetchingLocationAddress') : tr('waitingForGps'));

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withValues(alpha: 0.06)),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppColors.successBg,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.location_on, size: 16, color: AppColors.successDark),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  tr('currentLocationLabel'),
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textMuted,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  addressText,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textMain,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (state.isLocating)
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryDark),
            )
          else
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 18, color: AppColors.textMuted),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              tooltip: 'Refresh Location',
              onPressed: () {
                notifier.initLocation();
                Fluttertoast.showToast(msg: tr('waitingForGps'));
              },
            ),
        ],
      ),
    );
  }

  Widget _buildModeSelector(AreaTrackerState state, AreaTrackerNotifier notifier) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2)),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildModeTab(
            title: tr('modePerimeterWalk'),
            icon: Icons.directions_walk_rounded,
            isSelected: state.mode == TrackingMode.perimeterWalk,
            onTap: () => notifier.setTrackingMode(TrackingMode.perimeterWalk),
          ),
          _buildModeTab(
            title: tr('modeCornerPin'),
            icon: Icons.pin_drop_rounded,
            isSelected: state.mode == TrackingMode.cornerPin,
            onTap: () => notifier.setTrackingMode(TrackingMode.cornerPin),
          ),
        ],
      ),
    );
  }

  Widget _buildModeTab({
    required String title,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.textMain : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected ? Colors.white : AppColors.textMuted,
            ),
            const SizedBox(width: 6),
            Text(
              title,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomHudCard(
    BuildContext context,
    WidgetRef ref,
    AreaTrackerState state,
    AreaTrackerNotifier notifier,
    double perimeter,
    bool hasEnoughPoints,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 16, offset: Offset(0, 4)),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Area & Stats Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tr('calculatedAreaLabel'),
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 2),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        state.areaAcres.toStringAsFixed(2),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF15803D),
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        tr('unitAcre'),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                height: 40,
                width: 1,
                color: Colors.grey.shade200,
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.pin_drop, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Text(
                        '${state.points.length} ${tr('pointsCount')}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textMain,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(Icons.timeline, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Text(
                        '${perimeter.toStringAsFixed(0)} m ${tr('perimeterLabel')}',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Helper hint text
          Text(
            state.mode == TrackingMode.cornerPin
                ? tr('tapMapToAddHint')
                : (state.isRecording ? tr('walkTrackingActiveHint') : tr('startWalkTrackingHint')),
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontStyle: FontStyle.italic),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),

          // Main Action Controls based on Mode
          if (state.mode == TrackingMode.cornerPin)
            _buildCornerPinControls(context, ref, state, notifier, perimeter, hasEnoughPoints)
          else
            _buildWalkModeControls(context, ref, state, notifier, perimeter, hasEnoughPoints),
        ],
      ),
    );
  }

  // Action controls for Corner Pin Mode
  Widget _buildCornerPinControls(
    BuildContext context,
    WidgetRef ref,
    AreaTrackerState state,
    AreaTrackerNotifier notifier,
    double perimeter,
    bool hasEnoughPoints,
  ) {
    return Column(
      children: [
        Row(
          children: [
            // Big button: Add GPS point at my location
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () async {
                  final added = await notifier.addManualCornerPoint();
                  if (added) {
                    Fluttertoast.showToast(
                      msg: tr('pointAddedMsg', namedArgs: {'num': state.points.length.toString()}),
                    );
                  } else {
                    Fluttertoast.showToast(msg: tr('waitingForGps'));
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F766E),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(0, 48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                icon: const Icon(Icons.my_location_rounded, size: 20),
                label: Text(
                  tr('addGpsPointBtn'),
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(width: 8),

            // Undo Button
            if (state.points.isNotEmpty) ...[
              IconButton.filled(
                onPressed: notifier.undoLastPoint,
                icon: const Icon(Icons.undo_rounded),
                tooltip: tr('undoPoint'),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.grey.shade100,
                  foregroundColor: AppColors.textMain,
                  minimumSize: const Size(48, 48),
                ),
              ),
              const SizedBox(width: 8),
            ],

            // Clear All Button
            if (state.points.isNotEmpty) ...[
              IconButton.filled(
                onPressed: () {
                  notifier.clearAllPoints();
                  Fluttertoast.showToast(msg: tr('clearAll'));
                },
                icon: const Icon(Icons.delete_outline_rounded),
                tooltip: tr('clearAllPointsBtn'),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.dangerBg,
                  foregroundColor: AppColors.danger,
                  minimumSize: const Size(48, 48),
                ),
              ),
              const SizedBox(width: 8),
            ],
          ],
        ),

        // Finish button if points >= 3
        if (hasEnoughPoints) ...[
          const SizedBox(height: 10),
          ElevatedButton.icon(
            onPressed: () {
              _showResultModal(context, ref, state.points, perimeter);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.textDarkBrown,
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            icon: const Icon(Icons.check_circle_rounded, size: 20),
            label: Text(
              tr('finishAreaBtn'),
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ],
    );
  }

  // Action controls for Walk / Drive Mode
  Widget _buildWalkModeControls(
    BuildContext context,
    WidgetRef ref,
    AreaTrackerState state,
    AreaTrackerNotifier notifier,
    double perimeter,
    bool hasEnoughPoints,
  ) {
    if (state.isIdle) {
      return ElevatedButton.icon(
        onPressed: () {
          notifier.startTracking();
          Fluttertoast.showToast(msg: tr('walkTrackingActiveHint'));
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.textDarkBrown,
          minimumSize: const Size(double.infinity, 50),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 0,
        ),
        icon: const Icon(Icons.play_arrow_rounded, size: 24),
        label: Text(
          tr('startAreaTrackingBtn'),
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      );
    }

    return Row(
      children: [
        // Pause / Resume in Walk Mode
        IconButton.filled(
          onPressed: state.isRecording ? notifier.pauseTracking : notifier.resumeTracking,
          icon: Icon(state.isRecording ? Icons.pause_rounded : Icons.play_arrow_rounded),
          style: IconButton.styleFrom(
            backgroundColor: Colors.grey.shade100,
            foregroundColor: AppColors.textMain,
            minimumSize: const Size(48, 48),
          ),
        ),
        const SizedBox(width: 8),

        // Undo Button
        if (state.points.isNotEmpty) ...[
          IconButton.filled(
            onPressed: notifier.undoLastPoint,
            icon: const Icon(Icons.undo_rounded),
            tooltip: tr('undoPoint'),
            style: IconButton.styleFrom(
              backgroundColor: Colors.grey.shade100,
              foregroundColor: AppColors.textMain,
              minimumSize: const Size(48, 48),
            ),
          ),
          const SizedBox(width: 8),
        ],

        // Finish / Calculate Button
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () {
              if (!hasEnoughPoints) {
                Fluttertoast.showToast(msg: tr('minThreePointsMsg'));
                return;
              }
              notifier.finishTracking();
              _showResultModal(context, ref, state.points, perimeter);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: hasEnoughPoints ? AppColors.primary : Colors.grey.shade300,
              foregroundColor: hasEnoughPoints ? AppColors.textDarkBrown : Colors.grey.shade500,
              minimumSize: const Size(0, 48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0,
            ),
            icon: const Icon(Icons.check_circle_rounded, size: 20),
            label: Text(
              tr('finishAreaBtn'),
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  void _showResultModal(
    BuildContext context,
    WidgetRef ref,
    List<LatLng> points,
    double perimeter,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AreaResultModal(
        polygonPoints: points,
        perimeterMeters: perimeter,
        onSave: (double acres) {
          // Record to trackerProvider and store as pending acre session
          ref.read(trackerProvider.notifier).doneArea(acres);
          ref.read(areaTrackerProvider.notifier).reset();
          Fluttertoast.showToast(msg: tr('areaSavedSuccessToast'));
          Navigator.of(context).pop();
        },
      ),
    );
  }

  Future<bool?> _showDiscardConfirmDialog(BuildContext context) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(tr('discardMeasurementTitle')),
        content: Text(tr('discardMeasurementDesc')),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(tr('cancel')),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(
              tr('discardBtn'),
              style: const TextStyle(color: AppColors.danger),
            ),
          ),
        ],
      ),
    );
  }
}
