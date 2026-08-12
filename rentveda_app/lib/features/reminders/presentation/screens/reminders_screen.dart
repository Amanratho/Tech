import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/reminders_provider.dart';
import '../widgets/edit_reminder_modal.dart';
import '../widgets/confirm_reminder_dialog.dart';
import 'package:fluttertoast/fluttertoast.dart';

class RemindersScreen extends ConsumerStatefulWidget {
  const RemindersScreen({super.key});

  @override
  ConsumerState<RemindersScreen> createState() => _RemindersScreenState();
}

class _RemindersScreenState extends ConsumerState<RemindersScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _filterStatus = 'all'; // all, overdue, today, upcoming

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(remindersProvider.notifier).loadReminders();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    } else {
      Fluttertoast.showToast(msg: "Could not launch dialer");
    }
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }

  bool _isPast(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final compareDate = DateTime(date.year, date.month, date.day);
    return compareDate.isBefore(today);
  }

  Map<String, dynamic> _getDateStatus(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) {
      return {'label': 'No Date', 'color': const Color(0xFF4F4633), 'bg': Colors.grey[100]!, 'border': Colors.grey[200]!};
    }
    final date = DateTime.tryParse(dateStr);
    if (date == null) {
      return {'label': 'Invalid Date', 'color': const Color(0xFF4F4633), 'bg': Colors.grey[100]!, 'border': Colors.grey[200]!};
    }

    if (_isToday(date)) {
      return {'label': tr('reminderStatusDueToday') == 'reminderStatusDueToday' ? 'Due Today' : tr('reminderStatusDueToday'), 'color': const Color(0xFFD97706), 'bg': const Color(0xFFFEF3C7), 'border': Colors.amber[200]!};
    }
    if (_isPast(date)) {
      return {'label': tr('reminderStatusOverdue') == 'reminderStatusOverdue' ? 'Overdue' : tr('reminderStatusOverdue'), 'color': const Color(0xFFDC2626), 'bg': const Color(0xFFFEE2E2), 'border': Colors.red[200]!};
    }
    return {'label': tr('reminderStatusUpcoming') == 'reminderStatusUpcoming' ? 'Upcoming' : tr('reminderStatusUpcoming'), 'color': Colors.blue[600]!, 'bg': Colors.blue[50]!, 'border': Colors.blue[200]!};
  }

  List<dynamic> _getFilteredReminders(List<dynamic> allReminders) {
    return allReminders.where((rem) {
      // 1. Search
      final customerName = rem['customerName']?.toString().toLowerCase() ?? '';
      final mobileNumber = rem['mobileNumber']?.toString() ?? '';
      final customerMobile = rem['customerMobile']?.toString() ?? '';
      
      final matchesSearch = _searchQuery.isEmpty || 
          customerName.contains(_searchQuery.toLowerCase()) || 
          mobileNumber.contains(_searchQuery) ||
          customerMobile.contains(_searchQuery);

      if (!matchesSearch) return false;

      // 2. Filter status
      if (_filterStatus == 'all') return true;

      final dateStr = rem['reminderDate']?.toString();
      if (dateStr == null || dateStr.isEmpty) return false;

      final date = DateTime.tryParse(dateStr);
      if (date == null) return false;

      final today = _isToday(date);
      final past = _isPast(date) && !today;

      if (_filterStatus == 'overdue') return past;
      if (_filterStatus == 'today') return today;
      if (_filterStatus == 'upcoming') return !past && !today;

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(remindersProvider);
    final displayedReminders = _getFilteredReminders(state.reminders);

    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9), // Match React bg
      body: Column(
        children: [
          // ── UNIFIED STICKY SEARCH BAR & FILTERS ──
          Container(
            color: Colors.white.withValues(alpha: 0.95),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              children: [
                // Search Input
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9F9F9),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() => _searchQuery = val),
                    style: AppTypography.bodyMain.copyWith(fontSize: 14),
                    decoration: InputDecoration(
                      hintText: tr('reminderSearchPlaceholder') == 'reminderSearchPlaceholder' ? 'Search by customer name or mobile...' : tr('reminderSearchPlaceholder'),
                      hintStyle: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 13),
                      prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.textSubtle),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Quick Filter Pills
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _FilterPill(label: tr('reminderFilterAll') == 'reminderFilterAll' ? 'All Reminders' : tr('reminderFilterAll'), value: 'all', groupValue: _filterStatus, onChanged: (v) => setState(() => _filterStatus = v)),
                      const SizedBox(width: 8),
                      _FilterPill(label: tr('reminderFilterOverdue') == 'reminderFilterOverdue' ? 'Overdue' : tr('reminderFilterOverdue'), value: 'overdue', groupValue: _filterStatus, onChanged: (v) => setState(() => _filterStatus = v)),
                      const SizedBox(width: 8),
                      _FilterPill(label: tr('reminderFilterToday') == 'reminderFilterToday' ? 'Due Today' : tr('reminderFilterToday'), value: 'today', groupValue: _filterStatus, onChanged: (v) => setState(() => _filterStatus = v)),
                      const SizedBox(width: 8),
                      _FilterPill(label: tr('reminderFilterUpcoming') == 'reminderFilterUpcoming' ? 'Upcoming' : tr('reminderFilterUpcoming'), value: 'upcoming', groupValue: _filterStatus, onChanged: (v) => setState(() => _filterStatus = v)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // ── REMINDER TILES LIST ──
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.warning))
                : state.error != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Error: ${state.error}',
                              style: AppTypography.bodyMain.copyWith(color: AppColors.danger),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () => ref.read(remindersProvider.notifier).loadReminders(),
                              child: Text(tr('reminderRetry')),
                            )
                          ],
                        ),
                      )
                    : displayedReminders.isEmpty
                        ? Center(
                            child: Container(
                              margin: const EdgeInsets.all(24),
                              padding: const EdgeInsets.all(48),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Text(
                                tr('reminderNoResults') == 'reminderNoResults' ? 'No pending reminders match the filter' : tr('reminderNoResults'),
                                style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontWeight: FontWeight.w600),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () async => ref.read(remindersProvider.notifier).loadReminders(),
                            color: AppColors.warning,
                            child: ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: displayedReminders.length,
                                itemBuilder: (context, index) {
                                  final rem = displayedReminders[index];
                                  final dateStatus = _getDateStatus(rem['reminderDate']?.toString());
                                  
                                  final customerName = rem['customerName']?.toString() ?? 'N/A';
                                  final mobile = rem['customerMobile']?.toString() ?? rem['mobileNumber']?.toString() ?? 'N/A';
                                  final pendingAmt = rem['pendingAmount']?.toString() ?? '0';
                                  
                                  String formattedDate = 'N/A';
                                  if (rem['reminderDate'] != null) {
                                    final d = DateTime.tryParse(rem['reminderDate'].toString());
                                    if (d != null) formattedDate = DateFormat('dd MMM yyyy').format(d);
                                  }

                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 12),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: AppColors.border),
                                      boxShadow: [
                                        BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
                                      ],
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(16),
                                      child: IntrinsicHeight(
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.stretch,
                                          children: [
                                            // Visual Accent Glow Line
                                            Container(
                                              width: 6,
                                              color: dateStatus['color'] as Color,
                                            ),
                                            
                                            // Card Content
                                            Expanded(
                                              child: Padding(
                                                padding: const EdgeInsets.all(16),
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    // Header row: Customer & Date status pill
                                                    Row(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        // Call Button
                                                        InkWell(
                                                          onTap: () => _makePhoneCall(mobile),
                                                          borderRadius: BorderRadius.circular(20),
                                                          child: Container(
                                                            width: 40,
                                                            height: 40,
                                                            decoration: BoxDecoration(
                                                              color: AppColors.successBg,
                                                              border: Border.all(color: AppColors.successBorder),
                                                              shape: BoxShape.circle,
                                                            ),
                                                            child: const Icon(Icons.phone, size: 20, color: AppColors.success),
                                                          ),
                                                        ),
                                                        const SizedBox(width: 12),
                                                        Expanded(
                                                          child: Column(
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            children: [
                                                              Text(
                                                                customerName,
                                                                style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold, fontSize: 16),
                                                                maxLines: 1,
                                                                overflow: TextOverflow.ellipsis,
                                                              ),
                                                              Text(
                                                                mobile,
                                                                style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 12),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                        // Date Status Pill
                                                        Container(
                                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                          decoration: BoxDecoration(
                                                            color: dateStatus['bg'] as Color,
                                                            border: Border.all(color: dateStatus['border'] as Color),
                                                            borderRadius: BorderRadius.circular(20),
                                                          ),
                                                          child: Text(
                                                            dateStatus['label'],
                                                            style: TextStyle(
                                                              color: dateStatus['color'] as Color,
                                                              fontSize: 10,
                                                              fontWeight: FontWeight.bold,
                                                            ),
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                    const SizedBox(height: 16),
                                                    const Divider(height: 1, color: AppColors.border),
                                                    const SizedBox(height: 16),
                                                    
                                                    // Details Row
                                                    Wrap(
                                                      spacing: 16,
                                                      runSpacing: 12,
                                                      children: [
                                                        _buildInfoItem(Icons.agriculture, rem['machineName']?.toString() ?? 'Machine', Colors.grey.shade600),
                                                        _buildInfoItem(Icons.calendar_today, formattedDate, Colors.red.shade500),
                                                        _buildInfoItem(Icons.currency_rupee, '₹$pendingAmt', Colors.yellow.shade800),
                                                        _buildInfoItem(Icons.access_time, _daysRemaining(rem['reminderDate']?.toString()), Colors.blue.shade500),
                                                      ],
                                                    ),
                                                    
                                                    const SizedBox(height: 20),
                                                    
                                                    // Action Buttons
                                                    Row(
                                                      children: [
                                                        Expanded(
                                                          flex: 2,
                                                          child: OutlinedButton.icon(
                                                            onPressed: () {
                                                              showModalBottomSheet(
                                                                context: context,
                                                                isScrollControlled: true,
                                                                backgroundColor: Colors.transparent,
                                                                builder: (context) => EditReminderModal(reminder: rem),
                                                              );
                                                            },
                                                            icon: const Icon(Icons.edit, size: 14),
                                                            label: Text(tr('reminderReschedule') == 'reminderReschedule' ? 'Reschedule' : tr('reminderReschedule'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                                            style: OutlinedButton.styleFrom(
                                                              foregroundColor: AppColors.textSubtle,
                                                              side: const BorderSide(color: AppColors.border),
                                                              padding: const EdgeInsets.symmetric(vertical: 12),
                                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                                            ),
                                                          ),
                                                        ),
                                                        const SizedBox(width: 8),
                                                        Expanded(
                                                          flex: 1,
                                                          child: OutlinedButton(
                                                            onPressed: () {
                                                              showDialog(
                                                                context: context,
                                                                builder: (context) => ConfirmReminderDialog(
                                                                  reminder: rem,
                                                                  action: 'CANCEL',
                                                                ),
                                                              );
                                                            },
                                                            style: OutlinedButton.styleFrom(
                                                              foregroundColor: Colors.red.shade600,
                                                              side: BorderSide(color: Colors.red.shade200),
                                                              padding: const EdgeInsets.symmetric(vertical: 12),
                                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                                              backgroundColor: Colors.red.shade50,
                                                            ),
                                                            child: Text(tr('reminderCancelBtn'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                                          ),
                                                        ),
                                                        const SizedBox(width: 8),
                                                        Expanded(
                                                          flex: 1,
                                                          child: ElevatedButton(
                                                            onPressed: () {
                                                              showDialog(
                                                                context: context,
                                                                builder: (context) => ConfirmReminderDialog(
                                                                  reminder: rem,
                                                                  action: 'COMPLETE',
                                                                ),
                                                              );
                                                            },
                                                            style: ElevatedButton.styleFrom(
                                                              backgroundColor: Colors.green.shade600,
                                                              foregroundColor: Colors.white,
                                                              padding: const EdgeInsets.symmetric(vertical: 12),
                                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                                              elevation: 0,
                                                            ),
                                                            child: Text(tr('reminderPaidBtn'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String text, Color iconColor) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: iconColor),
        const SizedBox(width: 6),
        Text(
          text,
          style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600, color: const Color(0xFF4F4633)),
        ),
      ],
    );
  }

  String _timeAgo(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inDays > 0) return tr('reminderDaysAgo', namedArgs: {'days': diff.inDays.toString()});
    if (diff.inHours > 0) return tr('reminderHoursAgo', namedArgs: {'hours': diff.inHours.toString()});
    if (diff.inMinutes > 0) return tr('reminderMinsAgo', namedArgs: {'mins': diff.inMinutes.toString()});
    return tr('reminderJustNow');
  }
}

class _FilterPill extends StatelessWidget {
  final String label;
  final String value;
  final String groupValue;
  final ValueChanged<String> onChanged;

  const _FilterPill({
    required this.label,
    required this.value,
    required this.groupValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return InkWell(
      onTap: () => onChanged(value),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.warning : AppColors.bgMain, // Yellow when selected
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF795900) : AppColors.border,
          ),
          boxShadow: isSelected 
              ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4)]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
            color: isSelected ? const Color(0xFF6C5000) : const Color(0xFF4F4633),
          ),
        ),
      ),
    );
  }
}
