import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../../features/reminders/providers/reminders_provider.dart';

class NotificationBell extends ConsumerStatefulWidget {
  const NotificationBell({super.key});

  @override
  ConsumerState<NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends ConsumerState<NotificationBell> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(remindersProvider.notifier).loadReminders();
    });
  }

  void _showNotificationMenu(BuildContext context, List<dynamic> actionableReminders) {
    // Get the render box of the bell icon
    final RenderBox button = context.findRenderObject() as RenderBox;
    final RenderBox overlay = Navigator.of(context).overlay!.context.findRenderObject() as RenderBox;
    final RelativeRect position = RelativeRect.fromRect(
      Rect.fromPoints(
        button.localToGlobal(Offset(0, button.size.height + 10), ancestor: overlay),
        button.localToGlobal(button.size.bottomRight(Offset(0, 10)), ancestor: overlay),
      ),
      Offset.zero & overlay.size,
    );

    showMenu(
      context: context,
      position: position,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.white,
      constraints: const BoxConstraints(
        maxWidth: 340,
        maxHeight: 400,
      ),
      items: [
        PopupMenuItem(
          enabled: false,
          padding: EdgeInsets.zero,
          child: Container(
            width: 340,
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.border)),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  tr('pendingCollections'),
                  style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w700),
                ),
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, size: 14, color: AppColors.textMuted),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (actionableReminders.isEmpty)
          PopupMenuItem(
            enabled: false,
            child: Container(
              width: 340,
              padding: const EdgeInsets.symmetric(vertical: 32),
              alignment: Alignment.center,
              child: Text(
                tr('noDuesToday'),
                style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
              ),
            ),
          )
        else
          ...actionableReminders.take(10).map((rem) {
            final name = rem['customerName']?.toString() ?? 'Unknown';
            final mobile = (rem['mobileNumber'] ?? rem['customerMobile'])?.toString() ?? '';
            final amount = (rem['pendingAmount'] ?? 0).toDouble();

            return PopupMenuItem(
              padding: EdgeInsets.zero,
              child: Container(
                width: 340,
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: AppColors.border)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tr('dueFrom'),
                      style: AppTypography.caption.copyWith(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            name,
                            style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w700),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '${tr('toCollect')} ₹${amount.toStringAsFixed(0)}',
                          style: AppTypography.caption.copyWith(color: AppColors.successDark, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      mobile,
                      style: AppTypography.caption.copyWith(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            );
          }),
        if (actionableReminders.isNotEmpty)
          PopupMenuItem(
            padding: EdgeInsets.zero,
            onTap: () {
              Future.delayed(const Duration(milliseconds: 50), () {
                if (context.mounted) {
                  context.push('/reminders');
                }
              });
            },
            child: Container(
              width: 340,
              padding: const EdgeInsets.symmetric(vertical: 12),
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                color: Color(0xFFFAFAFA),
                borderRadius: BorderRadius.only(bottomLeft: Radius.circular(16), bottomRight: Radius.circular(16)),
              ),
              child: Text(
                tr('viewAllPendingDues'),
                style: AppTypography.caption.copyWith(color: AppColors.primary, fontWeight: FontWeight.w700),
              ),
            ),
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final remindersState = ref.watch(remindersProvider);

    // Filter logic: reminderDate <= today (strip time)
    final now = DateTime.now();
    final todayEnd = DateTime(now.year, now.month, now.day, 23, 59, 59);

    final actionableReminders = remindersState.reminders.where((rem) {
      final dateStr = rem['reminderDate']?.toString();
      if (dateStr == null || dateStr.isEmpty) return false;
      try {
        final date = DateTime.parse(dateStr);
        return date.isBefore(todayEnd) || date.isAtSameMomentAs(todayEnd);
      } catch (e) {
        return false;
      }
    }).toList();

    final hasUnread = actionableReminders.isNotEmpty;

    return GestureDetector(
      onTap: () => _showNotificationMenu(context, actionableReminders),
      child: Stack(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            child: const Icon(Icons.notifications_rounded, size: 26, color: AppColors.primaryGold),
          ),
          if (hasUnread)
            Positioned(
              top: 6,
              right: 6,
              child: Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: AppColors.danger,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.bgSurface, width: 1.5),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
