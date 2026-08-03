import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/reminders_provider.dart';
import '../widgets/edit_reminder_modal.dart';
import '../widgets/confirm_reminder_dialog.dart';

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
      return {'label': 'No Date', 'color': AppColors.textDarkBrown, 'bg': AppColors.bgMain, 'border': AppColors.border};
    }
    final date = DateTime.tryParse(dateStr);
    if (date == null) {
      return {'label': 'Invalid Date', 'color': AppColors.textDarkBrown, 'bg': AppColors.bgMain, 'border': AppColors.border};
    }

    if (_isToday(date)) {
      return {'label': tr('reminderStatusDueToday'), 'color': AppColors.warningDark, 'bg': AppColors.primaryGoldBg, 'border': AppColors.warning};
    }
    if (_isPast(date)) {
      return {'label': tr('reminderStatusOverdue'), 'color': AppColors.dangerDark, 'bg': AppColors.dangerBg, 'border': AppColors.dangerBorder};
    }
    return {'label': tr('reminderStatusUpcoming'), 'color': Colors.blue[700]!, 'bg': Colors.blue[50]!, 'border': Colors.blue[200]!};
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
      if (dateStr == null || dateStr.isEmpty) return false; // Hide no-date items from strict filters

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
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: Column(
          children: [
            // ── UNIFIED STICKY APP HEADER & SEARCH BAR ──
            Container(
              color: AppColors.bgSurface.withValues(alpha: 0.95),
              child: Column(
                children: [
                  // Search Input
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (val) => setState(() => _searchQuery = val),
                      style: AppTypography.bodyMain.copyWith(fontSize: 12),
                      decoration: InputDecoration(
                        hintText: tr('reminderSearchPlaceholder'),
                        hintStyle: AppTypography.caption.copyWith(color: AppColors.textMuted),
                        prefixIcon: const Icon(Icons.search, size: 16, color: AppColors.textMuted),
                        filled: true,
                        fillColor: AppColors.bgMain,
                        contentPadding: const EdgeInsets.symmetric(vertical: 0),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(30),
                          borderSide: const BorderSide(color: AppColors.primary),
                        ),
                      ),
                    ),
                  ),

                  // Quick Filter Pills
                  Padding(
                    padding: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _FilterPill(label: tr('reminderFilterAll'), value: 'all', groupValue: _filterStatus, onChanged: (v) => setState(() => _filterStatus = v)),
                          const SizedBox(width: 8),
                          _FilterPill(label: tr('reminderFilterOverdue'), value: 'overdue', groupValue: _filterStatus, onChanged: (v) => setState(() => _filterStatus = v)),
                          const SizedBox(width: 8),
                          _FilterPill(label: tr('reminderFilterToday'), value: 'today', groupValue: _filterStatus, onChanged: (v) => setState(() => _filterStatus = v)),
                          const SizedBox(width: 8),
                          _FilterPill(label: tr('reminderFilterUpcoming'), value: 'upcoming', groupValue: _filterStatus, onChanged: (v) => setState(() => _filterStatus = v)),
                        ],
                      ),
                    ),
                  ),
                  const Divider(height: 1, color: AppColors.border),
                ],
              ),
            ),

            // ── REMINDER TILES LIST ──
            Expanded(
              child: state.isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : state.error != null
                      ? Center(
                          child: Text(
                            'Error: ${state.error}',
                            style: AppTypography.bodyMain.copyWith(color: AppColors.danger),
                          ),
                        )
                      : displayedReminders.isEmpty
                          ? Center(
                              child: Text(
                                tr('reminderNoResults'),
                                style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
                              ),
                            )
                          : ListView.builder(
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
                                  clipBehavior: Clip.antiAlias,
                                  decoration: BoxDecoration(
                                    color: AppColors.bgSurface,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: AppColors.border),
                                    boxShadow: [
                                      BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
                                    ],
                                  ),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.stretch,
                                    children: [
                                      // Visual Accent Glow Line
                                      Container(
                                        width: 4,
                                        color: dateStatus['color'] as Color,
                                      ),
                                      
                                      // Card Content
                                      Expanded(
                                        child: Padding(
                                          padding: const EdgeInsets.all(12),
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
                                                    borderRadius: BorderRadius.circular(12),
                                                    child: Container(
                                                      width: 36,
                                                      height: 36,
                                                      decoration: BoxDecoration(
                                                        color: AppColors.successBg,
                                                        border: Border.all(color: AppColors.successBorder),
                                                        borderRadius: BorderRadius.circular(12),
                                                      ),
                                                      child: const Icon(Icons.phone, size: 14, color: AppColors.successDark),
                                                    ),
                                                  ),
                                                  const SizedBox(width: 12),
                                                  
                                                  // Name & Phone
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        Text(
                                                          customerName,
                                                          style: AppTypography.cardHeader.copyWith(fontSize: 14),
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                        const SizedBox(height: 2),
                                                        Text(
                                                          mobile,
                                                          style: AppTypography.caption.copyWith(color: AppColors.textDarkBrown, fontSize: 10),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  
                                                  // Status Badge
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                                    decoration: BoxDecoration(
                                                      color: dateStatus['bg'] as Color,
                                                      border: Border.all(color: dateStatus['border'] as Color),
                                                      borderRadius: BorderRadius.circular(12),
                                                    ),
                                                    child: Text(
                                                      dateStatus['label'] as String,
                                                      style: AppTypography.caption.copyWith(
                                                        color: dateStatus['color'] as Color,
                                                        fontSize: 9,
                                                        fontWeight: FontWeight.w800,
                                                        letterSpacing: 0.5,
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              const SizedBox(height: 12),
                                              
                                              // Middle row: Follow-up Date & Pending Amount
                                              Container(
                                                padding: const EdgeInsets.all(12),
                                                decoration: BoxDecoration(
                                                  color: AppColors.bgMain,
                                                  borderRadius: BorderRadius.circular(12),
                                                  border: Border.all(color: AppColors.border),
                                                ),
                                                child: Row(
                                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                  children: [
                                                    Column(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        Text(
                                                          tr('reminderFollowUp').toUpperCase(),
                                                          style: AppTypography.caption.copyWith(fontSize: 9, color: AppColors.textDarkBrown, fontWeight: FontWeight.w700),
                                                        ),
                                                        const SizedBox(height: 2),
                                                        Row(
                                                          children: [
                                                            const Icon(Icons.calendar_today, size: 10, color: AppColors.primaryGold),
                                                            const SizedBox(width: 4),
                                                            Text(formattedDate, style: AppTypography.bodyMain.copyWith(fontSize: 12, fontWeight: FontWeight.w700)),
                                                          ],
                                                        ),
                                                      ],
                                                    ),
                                                    Column(
                                                      crossAxisAlignment: CrossAxisAlignment.end,
                                                      children: [
                                                        Text(
                                                          tr('reminderPendingDues').toUpperCase(),
                                                          style: AppTypography.caption.copyWith(fontSize: 9, color: AppColors.textDarkBrown, fontWeight: FontWeight.w700),
                                                        ),
                                                        const SizedBox(height: 2),
                                                        Row(
                                                          children: [
                                                            const Icon(Icons.money, size: 12, color: AppColors.successDark),
                                                            const SizedBox(width: 4),
                                                            Text(
                                                              '₹$pendingAmt',
                                                              style: AppTypography.bodyMain.copyWith(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.successDark),
                                                            ),
                                                          ],
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              const SizedBox(height: 12),
                                              
                                              // Actions Row
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.end,
                                                children: [
                                                  // Edit
                                                  _ActionBtn(
                                                    icon: Icons.edit,
                                                    onTap: () {
                                                      showModalBottomSheet(
                                                        context: context,
                                                        isScrollControlled: true,
                                                        backgroundColor: Colors.transparent,
                                                        builder: (context) => Padding(
                                                          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
                                                          child: EditReminderModal(reminder: rem),
                                                        ),
                                                      );
                                                    },
                                                  ),
                                                  const SizedBox(width: 8),
                                                  // Delete
                                                  _ActionBtn(
                                                    icon: Icons.delete_outline,
                                                    color: AppColors.dangerDark,
                                                    bgColor: AppColors.dangerBg,
                                                    borderColor: AppColors.dangerBorder,
                                                    onTap: () {
                                                      showDialog(
                                                        context: context,
                                                        builder: (context) => ConfirmReminderDialog(reminder: rem, action: "DELETE"),
                                                      );
                                                    },
                                                  ),
                                                  const SizedBox(width: 8),
                                                  // Mark Paid
                                                  InkWell(
                                                    onTap: () {
                                                      showDialog(
                                                        context: context,
                                                        builder: (context) => ConfirmReminderDialog(reminder: rem, action: "COMPLETE"),
                                                      );
                                                    },
                                                    borderRadius: BorderRadius.circular(12),
                                                    child: Container(
                                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                                      decoration: BoxDecoration(
                                                        color: AppColors.successDark,
                                                        borderRadius: BorderRadius.circular(12),
                                                        boxShadow: [
                                                          BoxShadow(color: AppColors.successDark.withValues(alpha: 0.3), blurRadius: 4, offset: const Offset(0, 2)),
                                                        ],
                                                      ),
                                                      child: Row(
                                                        children: [
                                                          const Icon(Icons.check_circle, size: 12, color: Colors.white),
                                                          const SizedBox(width: 6),
                                                          Text(
                                                            tr('reminderMarkPaid'),
                                                            style: AppTypography.caption.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
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
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
            ),
          ],
        ),
      ),
    );
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
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.warning : AppColors.bgMain,
          border: Border.all(color: isSelected ? AppColors.primaryGold : AppColors.border),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: AppTypography.caption.copyWith(
            fontSize: 10,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
            color: isSelected ? AppColors.warningDark : AppColors.textDarkBrown,
          ),
        ),
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final Color? color;
  final Color? bgColor;
  final Color? borderColor;

  const _ActionBtn({
    required this.icon,
    required this.onTap,
    this.color,
    this.bgColor,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: bgColor ?? AppColors.bgMain,
          border: Border.all(color: borderColor ?? AppColors.border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(
          icon,
          size: 14,
          color: color ?? AppColors.textDarkBrown,
        ),
      ),
    );
  }
}
