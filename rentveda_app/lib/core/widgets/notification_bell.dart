import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../../features/reminders/providers/reminders_provider.dart';
import '../../features/reminders/utils/reminder_whatsapp_helper.dart';

class NotificationBell extends ConsumerStatefulWidget {
  const NotificationBell({super.key});

  @override
  ConsumerState<NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends ConsumerState<NotificationBell> {
  Set<String> _readIds = {};

  @override
  void initState() {
    super.initState();
    _loadReadIds();
    Future.microtask(() {
      if (mounted) {
        ref.read(remindersProvider.notifier).loadReminders();
      }
    });
  }

  Future<void> _loadReadIds() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('read_reminder_ids') ?? [];
    if (mounted) {
      setState(() {
        _readIds = list.toSet();
      });
    }
  }

  Future<void> _markAsRead(String id) async {
    if (id.isEmpty) return;
    _readIds.add(id);
    setState(() {});
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('read_reminder_ids', _readIds.toList());
  }

  Future<void> _markAllAsRead(List<dynamic> reminders) async {
    for (final rem in reminders) {
      final id = rem['_id']?.toString();
      if (id != null && id.isNotEmpty) {
        _readIds.add(id);
      }
    }
    setState(() {});
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('read_reminder_ids', _readIds.toList());
  }

  void _showNotificationMenu(
    BuildContext context,
    List<dynamic> actionableReminders,
    bool hasUnread,
    int unreadCount,
  ) {
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
        maxHeight: 450,
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
                Row(
                  children: [
                    Text(
                      tr('pendingCollections'),
                      style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w700),
                    ),
                    if (hasUnread) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.danger.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.dangerBorder),
                        ),
                        child: Text(
                          '$unreadCount NEW',
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: AppColors.dangerDark,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (hasUnread) ...[
                      InkWell(
                        onTap: () async {
                          Navigator.of(context).pop();
                          await _markAllAsRead(actionableReminders);
                        },
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFFBFDBFE)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.done_all, size: 12, color: Color(0xFF2563EB)),
                              SizedBox(width: 4),
                              Text(
                                'Mark read',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF2563EB),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
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
            final id = rem['_id']?.toString() ?? '';
            final isUnread = id.isNotEmpty && !_readIds.contains(id);
            final name = rem['customerName']?.toString() ?? 'Unknown';
            final mobile = (rem['mobileNumber'] ?? rem['customerMobile'])?.toString() ?? '';
            final amount = double.tryParse(rem['pendingAmount']?.toString() ?? '') ?? 0.0;

            return PopupMenuItem(
              padding: EdgeInsets.zero,
              onTap: () {
                _markAsRead(id);
                Future.delayed(const Duration(milliseconds: 50), () {
                  if (context.mounted) {
                    context.push('/reminders', extra: {
                      'customerName': name,
                      'rentalId': id,
                    });
                  }
                });
              },
              child: Container(
                width: 340,
                decoration: BoxDecoration(
                  color: isUnread ? const Color(0xFFFFFDF2) : Colors.white,
                  border: const Border(bottom: BorderSide(color: AppColors.border)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            if (isUnread) ...[
                              Container(
                                width: 6,
                                height: 6,
                                margin: const EdgeInsets.only(right: 6),
                                decoration: const BoxDecoration(
                                  color: Color(0xFFD97706),
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ],
                            Text(
                              tr('dueFrom'),
                              style: AppTypography.caption.copyWith(
                                fontSize: 11,
                                color: isUnread ? const Color(0xFFB45309) : AppColors.textMuted,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        if (isUnread)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF3C7),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'NEW',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF795900),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            name,
                            style: AppTypography.bodyMain.copyWith(
                              fontWeight: isUnread ? FontWeight.w800 : FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '${tr('toCollect')} ₹${amount.toStringAsFixed(0)}',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.successDark,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          mobile,
                          style: AppTypography.caption.copyWith(
                            fontSize: 11,
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        // Quick WhatsApp Send Button
                        GestureDetector(
                          onTap: () {
                            Navigator.of(context).pop();
                            ReminderWhatsAppHelper.sendReminder(
                              context: context,
                              ref: ref,
                              reminder: rem,
                            );
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDCF8C6),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF25D366).withValues(alpha: 0.4)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.chat, size: 12, color: Color(0xFF25D366)),
                                const SizedBox(width: 4),
                                Text(
                                  tr('whatsappBtn'),
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1E7E34),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
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
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
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

    // Red dot ONLY shows when there are unread reminders
    final unreadReminders = actionableReminders.where((rem) {
      final id = rem['_id']?.toString() ?? '';
      return id.isNotEmpty && !_readIds.contains(id);
    }).toList();

    final hasUnread = unreadReminders.isNotEmpty;
    final unreadCount = unreadReminders.length;

    return GestureDetector(
      onTap: () => _showNotificationMenu(
        context,
        actionableReminders,
        hasUnread,
        unreadCount,
      ),
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
