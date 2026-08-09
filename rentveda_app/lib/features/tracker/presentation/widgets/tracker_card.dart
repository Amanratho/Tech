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

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        children: [
          // Header: Tabs & History
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Tabs
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.bgMain,
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    _TabButton(
                      label: tr('time'),
                      isActive: trackerState.activeTab == TrackerTab.time,
                      onTap: () {
                        if (trackerState.timerStatus == TimerStatus.idle) {
                          notifier.setActiveTab(TrackerTab.time);
                        }
                      },
                    ),
                    _TabButton(
                      label: tr('count'),
                      isActive: trackerState.activeTab == TrackerTab.count,
                      onTap: () {
                        if (trackerState.timerStatus == TimerStatus.idle) {
                          notifier.setActiveTab(TrackerTab.count);
                        }
                      },
                    ),
                    _TabButton(
                      label: 'KM',
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
              // History Button
              InkWell(
                onTap: () {}, // Can route to history if needed
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.bgMain,
                    border: Border.all(color: AppColors.border),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.history, size: 16, color: AppColors.textMuted),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Body based on Active Tab
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: _buildBody(trackerState, notifier, context),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(TrackerState state, TrackerNotifier notifier, BuildContext context) {
    if (state.activeTab == TrackerTab.time) {
      return Column(
        key: const ValueKey('TIME'),
        children: [
          Text(
            _formatTime(state.time),
            style: const TextStyle(
              fontSize: 40,
              fontWeight: FontWeight.w900,
              color: AppColors.textMain,
              letterSpacing: 2,
              fontFamily: 'monospace',
            ),
          ),
          const SizedBox(height: 4),
          Text(
            tr('liveSession').toUpperCase(),
            style: AppTypography.caption.copyWith(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              if (state.timerStatus == TimerStatus.idle)
                Expanded(child: _ActionBtn(label: tr('start'), icon: Icons.play_arrow, color: AppColors.textMain, bgColor: AppColors.bgSurface, borderColor: AppColors.textMain, onTap: () {
                   notifier.startTimer();
                })),
              if (state.timerStatus == TimerStatus.running)
                Expanded(child: _ActionBtn(label: tr('pause'), icon: Icons.pause, color: Colors.orange.shade700, bgColor: Colors.orange.shade50, borderColor: Colors.orange.shade200, onTap: notifier.pauseTimer)),
              if (state.timerStatus == TimerStatus.paused)
                Expanded(child: _ActionBtn(label: tr('resume'), icon: Icons.play_arrow, color: AppColors.textMain, bgColor: AppColors.primary, borderColor: AppColors.primary, onTap: notifier.startTimer)),
              if (state.timerStatus != TimerStatus.idle) ...[
                const SizedBox(width: 12),
                Expanded(child: _ActionBtn(label: tr('done'), icon: Icons.check, color: AppColors.textMain, bgColor: AppColors.success, borderColor: AppColors.success, onTap: () {
                  notifier.doneTime();
                  Fluttertoast.showToast(msg: tr('timeSavedSuccess'));
                })),
              ]
            ],
          )
        ],
      );
    } else if (state.activeTab == TrackerTab.count) {
      return Column(
        key: const ValueKey('COUNT'),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _CountBtn(icon: Icons.remove, isPrimary: false, onTap: notifier.decrementCount),
              const SizedBox(width: 24),
              SizedBox(
                width: 80,
                child: Text(
                  state.count.toString(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(width: 24),
              _CountBtn(icon: Icons.add, isPrimary: true, onTap: notifier.incrementCount),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            tr('manualCount').toUpperCase(),
            style: AppTypography.caption.copyWith(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 24),
          _ActionBtn(
            label: tr('saveCount'),
            icon: Icons.check,
            color: state.count > 0 ? AppColors.textMain : AppColors.textMuted,
            bgColor: state.count > 0 ? AppColors.success : AppColors.bgMain,
            borderColor: state.count > 0 ? AppColors.success : AppColors.border,
            onTap: state.count > 0 ? () {
              notifier.doneCount();
              Fluttertoast.showToast(msg: tr('countSavedSuccess'));
            } : null,
          ),
        ],
      );
    } else {
      // Distance
      return Column(
        key: const ValueKey('DISTANCE'),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                state.distance.toStringAsFixed(2),
                style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textMain,
                  letterSpacing: 1,
                  fontFamily: 'monospace',
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'KM',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            tr('liveGpsTracking').toUpperCase(),
            style: AppTypography.caption.copyWith(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              if (state.timerStatus == TimerStatus.idle)
                Expanded(child: _ActionBtn(label: tr('start'), icon: Icons.play_arrow, color: AppColors.textMain, bgColor: AppColors.bgSurface, borderColor: AppColors.textMain, onTap: () {
                   notifier.startTimer();
                   Fluttertoast.showToast(msg: tr('gpsTrackingStarted'));
                })),
              if (state.timerStatus == TimerStatus.running)
                Expanded(child: _ActionBtn(label: tr('pause'), icon: Icons.pause, color: Colors.orange.shade700, bgColor: Colors.orange.shade50, borderColor: Colors.orange.shade200, onTap: notifier.pauseTimer)),
              if (state.timerStatus == TimerStatus.paused)
                Expanded(child: _ActionBtn(label: tr('resume'), icon: Icons.play_arrow, color: AppColors.textMain, bgColor: AppColors.primary, borderColor: AppColors.primary, onTap: notifier.startTimer)),
              if (state.timerStatus != TimerStatus.idle) ...[
                const SizedBox(width: 12),
                Expanded(child: _ActionBtn(label: tr('done'), icon: Icons.check, color: AppColors.textMain, bgColor: AppColors.success, borderColor: AppColors.success, onTap: () {
                  final finalKm = state.distance.toStringAsFixed(2);
                  notifier.doneDistance();
                  Fluttertoast.showToast(msg: '${finalKm}KM Saved!');
                })),
              ]
            ],
          )
        ],
      );
    }
  }
}

class _TabButton extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _TabButton({required this.label, required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: isActive ? [
            BoxShadow(color: AppColors.primary.withValues(alpha: 0.2), blurRadius: 4, offset: const Offset(0, 2))
          ] : null,
        ),
        child: Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
            color: isActive ? AppColors.textMain : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final Color borderColor;
  final VoidCallback? onTap;

  const _ActionBtn({
    required this.label,
    required this.icon,
    required this.color,
    required this.bgColor,
    required this.borderColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: bgColor,
          border: Border.all(color: borderColor),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            if (bgColor != AppColors.bgSurface && bgColor != AppColors.bgMain)
              BoxShadow(
                color: bgColor.withValues(alpha: 0.3),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 8),
            Text(
              label.toUpperCase(),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CountBtn extends StatelessWidget {
  final IconData icon;
  final bool isPrimary;
  final VoidCallback onTap;

  const _CountBtn({required this.icon, required this.isPrimary, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: isPrimary ? AppColors.primary : AppColors.bgMain,
          border: Border.all(color: isPrimary ? AppColors.primary : AppColors.border),
          shape: BoxShape.circle,
          boxShadow: isPrimary ? [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ] : null,
        ),
        child: Icon(
          icon,
          size: 20,
          color: isPrimary ? AppColors.textMain : AppColors.textMain,
        ),
      ),
    );
  }
}
