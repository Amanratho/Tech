import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/tracker_provider.dart';

class TrackerCard extends ConsumerWidget {
  const TrackerCard({super.key});

  String _formatTime(int seconds) {
    final hrs = (seconds ~/ 3600);
    final mins = ((seconds % 3600) ~/ 60);
    final secs = (seconds % 60);
    return '${hrs.toString().padLeft(2, '0')}:${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  void _showHistoryModal(BuildContext context, WidgetRef ref) async {
    final notifier = ref.read(trackerProvider.notifier);
    final history = await notifier.getHistory();

    if (!context.mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _TrackerHistorySheet(
        initialHistory: history,
        onClear: () async {
          await notifier.clearHistory();
          Fluttertoast.showToast(msg: tr('trackerHistoryCleared'));
        },
      ),
    );
  }

  void _confirmReset(BuildContext context, TrackerNotifier notifier) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(tr('resetTrackerTitle'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Text(tr('resetTrackerMsg')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(tr('cancelButton')),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              notifier.resetCurrent();
              Fluttertoast.showToast(msg: tr('trackerResetSuccess'));
            },
            child: Text(tr('reset')),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trackerState = ref.watch(trackerProvider);
    final notifier = ref.read(trackerProvider.notifier);

    // Listen for errors
    ref.listen<TrackerState>(trackerProvider, (previous, next) {
      if (next.error != null && next.error != previous?.error) {
        Fluttertoast.showToast(msg: next.error!);
      }
    });

    final isRunning = trackerState.timerStatus == TimerStatus.running;
    final isPaused = trackerState.timerStatus == TimerStatus.paused;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        border: Border.all(color: isRunning ? AppColors.primary : AppColors.border, width: isRunning ? 1.5 : 1),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: isRunning
                ? AppColors.primary.withValues(alpha: 0.12)
                : Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          )
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header: Segmented Tabs & Live/History controls
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Segmented Tab Selector
              Container(
                height: 34,
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: AppColors.bgMain,
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    _CompactTab(
                      label: tr('time'),
                      icon: Icons.timer_outlined,
                      isActive: trackerState.activeTab == TrackerTab.time,
                      onTap: () {
                        if (trackerState.timerStatus == TimerStatus.idle) {
                          notifier.setActiveTab(TrackerTab.time);
                        }
                      },
                    ),
                    _CompactTab(
                      label: tr('count'),
                      icon: Icons.tag_rounded,
                      isActive: trackerState.activeTab == TrackerTab.count,
                      onTap: () {
                        if (trackerState.timerStatus == TimerStatus.idle) {
                          notifier.setActiveTab(TrackerTab.count);
                        }
                      },
                    ),
                    _CompactTab(
                      label: 'KM',
                      icon: Icons.navigation_outlined,
                      isActive: trackerState.activeTab == TrackerTab.distance,
                      onTap: () {
                        if (trackerState.timerStatus == TimerStatus.idle) {
                          notifier.setActiveTab(TrackerTab.distance);
                        }
                      },
                    ),
                  ],
                ),
              ),

              // Status badge & History Button
              Row(
                children: [
                  if (isRunning) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.successBg,
                        border: Border.all(color: AppColors.successBorder),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: AppColors.successDark,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            tr('trackerLive'),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: AppColors.successDark,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                  ] else if (isPaused) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        tr('trackerPaused'),
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFFB45309),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],

                  // History Button
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      onTap: () => _showHistoryModal(context, ref),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: AppColors.bgMain,
                          border: Border.all(color: AppColors.border),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.history_rounded,
                          size: 18,
                          color: AppColors.textMain,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Body Display: Compact Metrics
          _buildCompactBody(trackerState, notifier, context),

          const SizedBox(height: 14),

          // Actions Row
          _buildActionControls(trackerState, notifier, context),
        ],
      ),
    );
  }

  Widget _buildCompactBody(TrackerState state, TrackerNotifier notifier, BuildContext context) {
    if (state.activeTab == TrackerTab.time) {
      return Column(
        key: const ValueKey('TIME_COMPACT'),
        children: [
          Text(
            _formatTime(state.time),
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: AppColors.textMain,
              letterSpacing: 1.5,
              fontFamily: 'monospace',
            ),
          ),
          const SizedBox(height: 2),
          Text(
            tr('trackerHoursMinsSecs'),
            style: AppTypography.caption.copyWith(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
              color: AppColors.textMuted,
            ),
          ),
        ],
      );
    } else if (state.activeTab == TrackerTab.count) {
      return Column(
        key: const ValueKey('COUNT_COMPACT'),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _RoundStepBtn(
                icon: Icons.remove_rounded,
                onTap: () => notifier.decrementCount(1),
              ),
              const SizedBox(width: 16),
              Container(
                constraints: const BoxConstraints(minWidth: 70),
                alignment: Alignment.center,
                child: Text(
                  state.count.toString(),
                  style: const TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.w900,
                    color: AppColors.primaryGold,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              _RoundStepBtn(
                icon: Icons.add_rounded,
                isPrimary: true,
                onTap: () => notifier.incrementCount(1),
              ),
              const SizedBox(width: 12),
              // Quick +5 button
              InkWell(
                onTap: () => notifier.incrementCount(5),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGoldBg,
                    border: Border.all(color: AppColors.borderDarkGold.withValues(alpha: 0.3)),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    '+5',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primaryGold,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            tr('trackerTotalCount'),
            style: AppTypography.caption.copyWith(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
              color: AppColors.textMuted,
            ),
          ),
        ],
      );
    } else {
      // Distance (KM)
      return Column(
        key: const ValueKey('DISTANCE_COMPACT'),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                state.distance.toStringAsFixed(2),
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textMain,
                  letterSpacing: 1,
                  fontFamily: 'monospace',
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primaryGoldBg,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.borderDarkGold.withValues(alpha: 0.3)),
                ),
                child: const Text(
                  'KM',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primaryGold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            tr('trackerGpsDistance'),
            style: AppTypography.caption.copyWith(
              fontSize: 9,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
              color: AppColors.textMuted,
            ),
          ),
        ],
      );
    }
  }

  Widget _buildActionControls(TrackerState state, TrackerNotifier notifier, BuildContext context) {
    final status = state.timerStatus;

    if (state.activeTab == TrackerTab.time) {
      if (status == TimerStatus.idle) {
        return _CompactBtn(
          label: tr('startTimeTracker'),
          icon: Icons.play_arrow_rounded,
          bgColor: AppColors.primary,
          textColor: AppColors.textMain,
          borderColor: AppColors.primary,
          onTap: () => notifier.startTimer(),
        );
      } else if (status == TimerStatus.running) {
        return Row(
          children: [
            _ResetIconBtn(onTap: () => _confirmReset(context, notifier)),
            const SizedBox(width: 8),
            Expanded(
              child: _CompactBtn(
                label: tr('pause'),
                icon: Icons.pause_rounded,
                bgColor: const Color(0xFFFEF3C7),
                textColor: const Color(0xFFB45309),
                borderColor: const Color(0xFFFDE68A),
                onTap: notifier.pauseTimer,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _CompactBtn(
                label: tr('doneAndSave'),
                icon: Icons.check_circle_rounded,
                bgColor: AppColors.successBg,
                textColor: AppColors.successDark,
                borderColor: AppColors.successBorder,
                onTap: () {
                  notifier.doneTime();
                  Fluttertoast.showToast(msg: tr('timeSavedSuccess'));
                },
              ),
            ),
          ],
        );
      } else {
        // Paused
        return Row(
          children: [
            _ResetIconBtn(onTap: () => _confirmReset(context, notifier)),
            const SizedBox(width: 8),
            Expanded(
              child: _CompactBtn(
                label: tr('resume'),
                icon: Icons.play_arrow_rounded,
                bgColor: AppColors.primary,
                textColor: AppColors.textMain,
                borderColor: AppColors.primary,
                onTap: notifier.startTimer,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _CompactBtn(
                label: tr('doneAndSave'),
                icon: Icons.check_circle_rounded,
                bgColor: AppColors.successBg,
                textColor: AppColors.successDark,
                borderColor: AppColors.successBorder,
                onTap: () {
                  notifier.doneTime();
                  Fluttertoast.showToast(msg: tr('timeSavedSuccess'));
                },
              ),
            ),
          ],
        );
      }
    } else if (state.activeTab == TrackerTab.count) {
      if (state.count == 0) {
        return Container(
          height: 38,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.bgMain,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: Text(
            tr('tapToAddCount'),
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMuted),
          ),
        );
      }

      return Row(
        children: [
          _ResetIconBtn(onTap: () => _confirmReset(context, notifier)),
          const SizedBox(width: 8),
          Expanded(
            child: _CompactBtn(
              label: tr('saveCountWithVal', namedArgs: {'count': state.count.toString()}),
              icon: Icons.check_circle_rounded,
              bgColor: AppColors.successBg,
              textColor: AppColors.successDark,
              borderColor: AppColors.successBorder,
              onTap: () {
                notifier.doneCount();
                Fluttertoast.showToast(msg: tr('countSavedSuccess'));
              },
            ),
          ),
        ],
      );
    } else {
      // Distance
      if (status == TimerStatus.idle) {
        return _CompactBtn(
          label: tr('startGpsTracking'),
          icon: Icons.navigation_rounded,
          bgColor: AppColors.primary,
          textColor: AppColors.textMain,
          borderColor: AppColors.primary,
          onTap: () {
            notifier.startTimer();
            Fluttertoast.showToast(msg: tr('gpsTrackingStarted'));
          },
        );
      } else if (status == TimerStatus.running) {
        return Row(
          children: [
            _ResetIconBtn(onTap: () => _confirmReset(context, notifier)),
            const SizedBox(width: 8),
            Expanded(
              child: _CompactBtn(
                label: tr('pause'),
                icon: Icons.pause_rounded,
                bgColor: const Color(0xFFFEF3C7),
                textColor: const Color(0xFFB45309),
                borderColor: const Color(0xFFFDE68A),
                onTap: notifier.pauseTimer,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _CompactBtn(
                label: tr('doneAndSave'),
                icon: Icons.check_circle_rounded,
                bgColor: AppColors.successBg,
                textColor: AppColors.successDark,
                borderColor: AppColors.successBorder,
                onTap: () {
                  final finalKm = state.distance.toStringAsFixed(2);
                  notifier.doneDistance();
                  Fluttertoast.showToast(msg: tr('kmSavedSuccess', namedArgs: {'km': finalKm}));
                },
              ),
            ),
          ],
        );
      } else {
        // Paused
        return Row(
          children: [
            _ResetIconBtn(onTap: () => _confirmReset(context, notifier)),
            const SizedBox(width: 8),
            Expanded(
              child: _CompactBtn(
                label: tr('resume'),
                icon: Icons.play_arrow_rounded,
                bgColor: AppColors.primary,
                textColor: AppColors.textMain,
                borderColor: AppColors.primary,
                onTap: notifier.startTimer,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _CompactBtn(
                label: tr('doneAndSave'),
                icon: Icons.check_circle_rounded,
                bgColor: AppColors.successBg,
                textColor: AppColors.successDark,
                borderColor: AppColors.successBorder,
                onTap: () {
                  final finalKm = state.distance.toStringAsFixed(2);
                  notifier.doneDistance();
                  Fluttertoast.showToast(msg: tr('kmSavedSuccess', namedArgs: {'km': finalKm}));
                },
              ),
            ),
          ],
        );
      }
    }
  }
}

class _CompactTab extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isActive;
  final VoidCallback onTap;

  const _CompactTab({
    required this.label,
    required this.icon,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.25),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  )
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 13,
              color: isActive ? AppColors.textMain : AppColors.textMuted,
            ),
            const SizedBox(width: 4),
            Text(
              label.toUpperCase(),
              style: TextStyle(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                color: isActive ? AppColors.textMain : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoundStepBtn extends StatelessWidget {
  final IconData icon;
  final bool isPrimary;
  final VoidCallback onTap;

  const _RoundStepBtn({
    required this.icon,
    this.isPrimary = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: isPrimary ? AppColors.primary : AppColors.bgMain,
            shape: BoxShape.circle,
            border: Border.all(
              color: isPrimary ? AppColors.primary : AppColors.border,
            ),
            boxShadow: isPrimary
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Icon(
            icon,
            size: 18,
            color: AppColors.textMain,
          ),
        ),
      ),
    );
  }
}

class _ResetIconBtn extends StatelessWidget {
  final VoidCallback onTap;

  const _ResetIconBtn({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: AppColors.bgMain,
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(
            Icons.replay_rounded,
            size: 18,
            color: AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}

class _CompactBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color bgColor;
  final Color textColor;
  final Color borderColor;
  final VoidCallback? onTap;

  const _CompactBtn({
    required this.label,
    required this.icon,
    required this.bgColor,
    required this.textColor,
    required this.borderColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          height: 38,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: bgColor,
            border: Border.all(color: borderColor),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: textColor),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: textColor,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TrackerHistorySheet extends StatefulWidget {
  final List<Map<String, dynamic>> initialHistory;
  final Future<void> Function() onClear;

  const _TrackerHistorySheet({
    required this.initialHistory,
    required this.onClear,
  });

  @override
  State<_TrackerHistorySheet> createState() => _TrackerHistorySheetState();
}

class _TrackerHistorySheetState extends State<_TrackerHistorySheet> {
  late List<Map<String, dynamic>> _history;

  @override
  void initState() {
    super.initState();
    _history = List.from(widget.initialHistory);
  }

  void _confirmClear() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(tr('clearTrackerHistoryTitle'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Text(tr('clearTrackerHistoryMsg')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(tr('cancelButton')),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              await widget.onClear();
              setState(() => _history.clear());
            },
            child: Text(tr('clearAll')),
          ),
        ],
      ),
    );
  }

  void _confirmDeleteSingle(int index, Map<String, dynamic> item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(tr('deleteSessionTitle'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Text(tr('deleteSessionMsg')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(tr('cancelButton')),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              final id = item['id']?.toString() ?? '';
              await TrackerNotifier.deleteSession(id);
              if (mounted) {
                setState(() => _history.removeAt(index));
                Fluttertoast.showToast(msg: tr('sessionDeleted'));
              }
            },
            child: Text(tr('deleteButton')),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.65,
      decoration: const BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.history_rounded, size: 20, color: AppColors.primaryGold),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          tr('trackerHistory'),
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textMain),
                        ),
                        Text(
                          tr('savedSessionsCount', namedArgs: {'count': _history.length.toString()}),
                          style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ],
                ),
                if (_history.isNotEmpty)
                  TextButton.icon(
                    onPressed: _confirmClear,
                    icon: const Icon(Icons.delete_outline_rounded, size: 16, color: AppColors.danger),
                    label: Text(
                      tr('clear'),
                      style: const TextStyle(color: AppColors.danger, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Content
          Expanded(
            child: _history.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: const BoxDecoration(
                              color: AppColors.bgMain,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.history_toggle_off_rounded, size: 40, color: AppColors.textSubtle),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            tr('noTrackerSessions'),
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textMain),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            tr('noTrackerSessionsDesc'),
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _history.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (ctx, index) {
                      final item = _history[index];
                      final type = item['type'] ?? 'TIME';
                      final value = item['value'] ?? '';
                      final timestampStr = item['timestamp'] ?? '';
                      String dateDisplay = '';
                      if (timestampStr.isNotEmpty) {
                        try {
                          final dt = DateTime.parse(timestampStr);
                          dateDisplay = DateFormat('dd MMM yyyy, hh:mm a').format(dt);
                        } catch (_) {
                          dateDisplay = timestampStr;
                        }
                      }

                      IconData iconData = Icons.timer_outlined;
                      Color iconColor = Colors.blue.shade600;
                      Color iconBg = Colors.blue.shade50;
                      String typeLabel = tr('timeSession');

                      if (type == 'COUNT') {
                        iconData = Icons.tag_rounded;
                        iconColor = Colors.amber.shade800;
                        iconBg = Colors.amber.shade50;
                        typeLabel = tr('countSession');
                      } else if (type == 'DISTANCE') {
                        iconData = Icons.navigation_outlined;
                        iconColor = Colors.teal.shade600;
                        iconBg = Colors.teal.shade50;
                        typeLabel = tr('distanceSession');
                      }

                      return Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.bgMain,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: iconBg,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(iconData, size: 20, color: iconColor),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        typeLabel,
                                        style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.textMuted,
                                        ),
                                      ),
                                      Text(
                                        dateDisplay,
                                        style: const TextStyle(fontSize: 10, color: AppColors.textSubtle),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        value,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.textMain,
                                        ),
                                      ),
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppColors.successBg,
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              tr('savedBadge'),
                                              style: const TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.successDark,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          GestureDetector(
                                            onTap: () => _confirmDeleteSingle(index, item),
                                            behavior: HitTestBehavior.opaque,
                                            child: Container(
                                              padding: const EdgeInsets.all(4),
                                              decoration: BoxDecoration(
                                                color: AppColors.dangerBg,
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: const Icon(
                                                Icons.delete_outline_rounded,
                                                size: 16,
                                                color: AppColors.danger,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
