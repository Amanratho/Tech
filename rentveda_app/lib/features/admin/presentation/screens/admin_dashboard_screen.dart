import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../models/admin_models.dart';
import '../../providers/admin_provider.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _broadcastTitleController = TextEditingController();
  final TextEditingController _broadcastMsgController = TextEditingController();

  bool _showPopupCheck = true;
  bool _sendPushCheck = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    Future.microtask(() {
      ref.read(adminProvider.notifier).fetchOverview();
      ref.read(adminProvider.notifier).fetchUsers();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    _broadcastTitleController.dispose();
    _broadcastMsgController.dispose();
    super.dispose();
  }

  void _makeCall(String mobile) async {
    final clean = mobile.replaceAll(RegExp(r'\D'), '');
    if (clean.isEmpty) return;
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _openWhatsApp(String mobile, String name) async {
    var clean = mobile.replaceAll(RegExp(r'\D'), '');
    if (clean.length == 10) clean = '91$clean';
    final message = Uri.encodeComponent('नमस्ते $name जी, RentVeda सपोर्ट टीम की तरफ से।');
    final uri = Uri.parse('https://wa.me/$clean?text=$message');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminProvider);
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B), // Premium dark navy
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text('👑 ', style: TextStyle(fontSize: 18)),
                Text(
                  'Admin Console',
                  style: AppTypography.cardHeader.copyWith(color: Colors.white, fontSize: 18),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'OWNER',
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w900,
                      fontSize: 9,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
            const Text(
              'RentVeda Master Control',
              style: TextStyle(color: Colors.white70, fontSize: 11),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            tooltip: 'Refresh Data',
            onPressed: () {
              ref.read(adminProvider.notifier).fetchOverview();
              ref.read(adminProvider.notifier).fetchUsers();
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.white60,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(icon: Icon(Icons.analytics_outlined, size: 20), text: 'Overview'),
            Tab(icon: Icon(Icons.people_alt_outlined, size: 20), text: 'Users'),
            Tab(icon: Icon(Icons.campaign_outlined, size: 20), text: 'Broadcast'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(state, currencyFormat),
          _buildUsersTab(state),
          _buildBroadcastTab(state),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 1: OVERVIEW & STATS
  // ==========================================
  Widget _buildOverviewTab(AdminState state, NumberFormat currencyFormat) {
    if (state.isLoadingOverview && state.overview == null) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primaryGold));
    }

    final stats = state.overview;
    if (stats == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off, size: 48, color: AppColors.textSubtle),
            const SizedBox(height: 12),
            Text(state.error ?? 'Failed to load stats', style: AppTypography.bodyMain),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => ref.read(adminProvider.notifier).fetchOverview(),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(adminProvider.notifier).fetchOverview();
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Total Users Hero Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E293B), Color(0xFF334155)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'TOTAL REGISTERED USERS',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white12,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.bolt, color: AppColors.primary, size: 14),
                          SizedBox(width: 4),
                          Text('LIVE', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${stats.totalUsers}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 36,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 14),
                const Divider(color: Colors.white24, height: 1),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildMiniBadge('Trial (90d)', '${stats.trialUsers}', Colors.amber),
                    _buildMiniBadge('Active Paid', '${stats.activeUsers}', AppColors.success),
                    _buildMiniBadge('Expired', '${stats.expiredUsers}', Colors.orange),
                    _buildMiniBadge('Blocked', '${stats.blockedUsers}', AppColors.danger),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Business Activity Row
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  icon: Icons.agriculture,
                  iconColor: const Color(0xFF2563EB),
                  bgColor: const Color(0xFFEFF6FF),
                  title: 'Machinery',
                  value: '${stats.totalMachines}',
                  subtitle: 'Registered units',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMetricCard(
                  icon: Icons.receipt_long,
                  iconColor: const Color(0xFF7C3AED),
                  bgColor: const Color(0xFFF5F3FF),
                  title: 'Work Entries',
                  value: '${stats.totalRentals}',
                  subtitle: 'Rent transactions',
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Financial Row
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  icon: Icons.currency_rupee,
                  iconColor: AppColors.successDark,
                  bgColor: AppColors.successBg,
                  title: 'Turnover Logged',
                  value: currencyFormat.format(stats.totalTurnover),
                  subtitle: 'Total work recorded',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMetricCard(
                  icon: Icons.pending_actions,
                  iconColor: const Color(0xFFD97706),
                  bgColor: const Color(0xFFFEF3C7),
                  title: 'Pending Due',
                  value: currencyFormat.format(stats.totalPending),
                  subtitle: 'Uncollected rent',
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Quick Action Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primaryGoldBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.6)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.manage_accounts, color: Colors.black, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Manage Users & Trials',
                        style: AppTypography.cardHeader.copyWith(fontSize: 14),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Extend user days, upgrade plans, or call testers.',
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    _tabController.animateTo(1);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGold,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  child: const Text('View Users', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildMiniBadge(String label, String count, Color color) {
    return Column(
      children: [
        Text(
          count,
          style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 10),
        ),
      ],
    );
  }

  Widget _buildMetricCard({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String title,
    required String value,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: AppColors.textMain,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMain),
          ),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 2: USERS LIST & ACTIONS
  // ==========================================
  Widget _buildUsersTab(AdminState state) {
    return Column(
      children: [
        // Search & Filter Header
        Container(
          color: Colors.white,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Column(
            children: [
              // Search Field
              TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search by name, mobile, or company...',
                  hintStyle: const TextStyle(fontSize: 13, color: AppColors.textSubtle),
                  prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSubtle),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, size: 18),
                          onPressed: () {
                            _searchController.clear();
                            ref.read(adminProvider.notifier).fetchUsers(search: '');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: const Color(0xFFF1F5F9),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                onSubmitted: (val) {
                  ref.read(adminProvider.notifier).fetchUsers(search: val.trim());
                },
              ),
              const SizedBox(height: 10),
              // Filter Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('all', 'All Users', state.selectedStatusFilter),
                    const SizedBox(width: 8),
                    _buildFilterChip('trial', 'Trial', state.selectedStatusFilter),
                    const SizedBox(width: 8),
                    _buildFilterChip('active', 'Active Paid', state.selectedStatusFilter),
                    const SizedBox(width: 8),
                    _buildFilterChip('expired', 'Expired', state.selectedStatusFilter),
                    const SizedBox(width: 8),
                    _buildFilterChip('blocked', 'Blocked', state.selectedStatusFilter),
                  ],
                ),
              ),
            ],
          ),
        ),

        const Divider(height: 1, color: AppColors.border),

        // User List View
        Expanded(
          child: state.isLoadingUsers
              ? const Center(child: CircularProgressIndicator(color: AppColors.primaryGold))
              : state.users.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.person_search, size: 48, color: AppColors.textSubtle),
                          const SizedBox(height: 12),
                          const Text('No users found', style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          const Text('Try changing search or filter', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              _searchController.clear();
                              ref.read(adminProvider.notifier).fetchUsers(search: '', status: 'all');
                            },
                            child: const Text('Reset Filters'),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () async {
                        await ref.read(adminProvider.notifier).fetchUsers();
                      },
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: state.users.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final user = state.users[index];
                          return _buildUserCard(user);
                        },
                      ),
                    ),
        ),
      ],
    );
  }

  Widget _buildFilterChip(String value, String label, String currentSelection) {
    final isSelected = value == currentSelection;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.primary,
      backgroundColor: Colors.white,
      side: BorderSide(color: isSelected ? AppColors.primaryGold : AppColors.border),
      labelStyle: TextStyle(
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
        color: isSelected ? Colors.black : AppColors.textMuted,
      ),
      onSelected: (_) {
        ref.read(adminProvider.notifier).fetchUsers(status: value);
      },
    );
  }

  Widget _buildUserCard(AdminUserItem user) {
    Color statusColor;
    String statusText;
    if (user.isBlocked) {
      statusColor = AppColors.danger;
      statusText = 'BLOCKED';
    } else if (user.subscriptionStatus == 'active') {
      statusColor = AppColors.success;
      statusText = 'PAID ACTIVE';
    } else if (user.subscriptionStatus == 'trial') {
      statusColor = Colors.amber.shade800;
      statusText = '${user.daysLeft}d TRIAL';
    } else {
      statusColor = Colors.red;
      statusText = 'EXPIRED';
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: user.isBlocked ? AppColors.dangerBorder : AppColors.border,
          width: user.isBlocked ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row: Avatar, Name & Status
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: const Color(0xFFF1F5F9),
                child: Text(
                  user.username.isNotEmpty ? user.username[0].toUpperCase() : 'U',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMain),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.username,
                      style: AppTypography.cardHeader.copyWith(fontSize: 14),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      user.companyName.isNotEmpty ? user.companyName : user.mobileNo,
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: statusColor),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 10),

          // Details Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildDetailChip(Icons.agriculture, '${user.machineCount} Machines'),
              _buildDetailChip(Icons.receipt, '${user.rentalCount} Work entries'),
              _buildDetailChip(
                Icons.calendar_today,
                user.createdAt != null ? DateFormat('dd MMM yy').format(user.createdAt!) : '-',
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Actions Row
          Row(
            children: [
              // Call Button
              if (user.mobileNo.isNotEmpty) ...[
                OutlinedButton.icon(
                  onPressed: () => _makeCall(user.mobileNo),
                  icon: const Icon(Icons.call, size: 14, color: AppColors.successDark),
                  label: const Text('Call', style: TextStyle(fontSize: 12, color: AppColors.successDark)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    side: const BorderSide(color: AppColors.successBorder),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
                const SizedBox(width: 6),
                OutlinedButton.icon(
                  onPressed: () => _openWhatsApp(user.mobileNo, user.username),
                  icon: const Icon(Icons.chat, size: 14, color: Color(0xFF25D366)),
                  label: const Text('WhatsApp', style: TextStyle(fontSize: 12, color: Color(0xFF25D366))),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    side: const BorderSide(color: Color(0xFFBBF7D0)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ],
              const Spacer(),
              // Manage Button
              ElevatedButton.icon(
                onPressed: () => _showUserActionSheet(user),
                icon: const Icon(Icons.tune, size: 14),
                label: const Text('Manage', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E293B),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetailChip(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 12, color: AppColors.textSubtle),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
      ],
    );
  }

  // Bottom Sheet for User Actions
  void _showUserActionSheet(AdminUserItem user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user.username, style: AppTypography.cardHeader.copyWith(fontSize: 16)),
                      Text(user.mobileNo, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.primaryGoldBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.primary),
                    ),
                    child: Text(
                      '${user.daysLeft} DAYS LEFT',
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryGold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                '⚡ EXTEND VALIDITY',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  _buildQuickExtendBtn(user.uid, 30, '+30 Days'),
                  const SizedBox(width: 8),
                  _buildQuickExtendBtn(user.uid, 90, '+90 Days'),
                  const SizedBox(width: 8),
                  _buildQuickExtendBtn(user.uid, 365, '+1 Year'),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                '💎 CHANGE PLAN',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildPlanBtn(user.uid, 'free_trial', 'trial', 'Free Trial'),
                  _buildPlanBtn(user.uid, 'monthly', 'active', 'Monthly Active'),
                  _buildPlanBtn(user.uid, 'yearly', 'active', 'Yearly Pro'),
                  _buildPlanBtn(user.uid, 'lifetime', 'active', 'Lifetime VIP'),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                '🚫 ACCESS CONTROL',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(
                  user.isBlocked ? Icons.lock_open : Icons.block,
                  color: user.isBlocked ? AppColors.success : AppColors.danger,
                ),
                title: Text(
                  user.isBlocked ? 'Unblock User Account' : 'Block / Suspend User',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: user.isBlocked ? AppColors.success : AppColors.danger,
                  ),
                ),
                subtitle: Text(
                  user.isBlocked
                    ? 'Allow user to login and access RentVeda'
                    : 'Prevent user from logging in with suspension message',
                  style: const TextStyle(fontSize: 11),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _confirmBlockToggle(user);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildQuickExtendBtn(String uid, int days, String label) {
    return Expanded(
      child: ElevatedButton(
        onPressed: () async {
          Navigator.pop(context);
          final success = await ref.read(adminProvider.notifier).extendValidity(uid, days);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(success ? 'Validity extended by $days days!' : 'Failed to extend validity'),
                backgroundColor: success ? AppColors.success : AppColors.danger,
              ),
            );
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFEFF6FF),
          foregroundColor: const Color(0xFF2563EB),
          elevation: 0,
          side: const BorderSide(color: Color(0xFFBFDBFE)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
        child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildPlanBtn(String uid, String plan, String status, String label) {
    return ActionChip(
      label: Text(label),
      backgroundColor: Colors.white,
      side: const BorderSide(color: AppColors.border),
      labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMain),
      onPressed: () async {
        Navigator.pop(context);
        final success = await ref.read(adminProvider.notifier).changePlan(uid, plan, status);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(success ? 'Plan updated to $label!' : 'Failed to update plan'),
              backgroundColor: success ? AppColors.success : AppColors.danger,
            ),
          );
        }
      },
    );
  }

  void _confirmBlockToggle(AdminUserItem user) {
    final reasonController = TextEditingController(text: user.blockReason);
    showDialog(
      context: context,
      builder: (dialogCtx) {
        return AlertDialog(
          title: Text(user.isBlocked ? 'Unblock User' : 'Block User'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                user.isBlocked
                    ? 'Are you sure you want to restore access for ${user.username}?'
                    : 'Are you sure you want to suspend access for ${user.username}?',
              ),
              if (!user.isBlocked) ...[
                const SizedBox(height: 12),
                TextField(
                  controller: reasonController,
                  decoration: const InputDecoration(
                    labelText: 'Reason for blocking',
                    hintText: 'e.g. Non-payment, violation',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogCtx),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(dialogCtx);
                final willBlock = !user.isBlocked;
                final success = await ref
                    .read(adminProvider.notifier)
                    .toggleBlockUser(user.uid, willBlock, reasonController.text.trim());
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(success ? 'User status updated!' : 'Failed to update status'),
                      backgroundColor: success ? AppColors.success : AppColors.danger,
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: user.isBlocked ? AppColors.success : AppColors.danger,
                foregroundColor: Colors.white,
              ),
              child: Text(user.isBlocked ? 'Unblock' : 'Confirm Block'),
            ),
          ],
        );
      },
    );
  }

  // ==========================================
  // TAB 3: BROADCAST & NOTIFICATIONS
  // ==========================================
  Widget _buildBroadcastTab(AdminState state) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFBFDBFE)),
          ),
          child: const Row(
            children: [
              Icon(Icons.info_outline, color: Color(0xFF2563EB), size: 24),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Send messages to all registered farmers & machine owners via in-app popup announcements and push notifications.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF1E3A8A)),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        TextField(
          controller: _broadcastTitleController,
          decoration: InputDecoration(
            labelText: 'Announcement Title',
            hintText: 'e.g. नई सुविधा उपलब्ध है! / Special Offer',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            filled: true,
            fillColor: Colors.white,
          ),
        ),

        const SizedBox(height: 16),

        TextField(
          controller: _broadcastMsgController,
          maxLines: 4,
          decoration: InputDecoration(
            labelText: 'Announcement Message',
            hintText: 'Type your message for all users here...',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            filled: true,
            fillColor: Colors.white,
          ),
        ),

        const SizedBox(height: 16),

        SwitchListTile(
          value: _showPopupCheck,
          title: const Text('Show In-App Popup on Open', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: const Text('Shows an alert dialog when users open the app', style: TextStyle(fontSize: 11)),
          activeThumbColor: AppColors.primaryGold,
          onChanged: (val) => setState(() => _showPopupCheck = val),
        ),

        SwitchListTile(
          value: _sendPushCheck,
          title: const Text('Send Push Notification (FCM)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: const Text('Rings all user phones in notification bar', style: TextStyle(fontSize: 11)),
          activeThumbColor: AppColors.primaryGold,
          onChanged: (val) => setState(() => _sendPushCheck = val),
        ),

        const SizedBox(height: 24),

        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton.icon(
            onPressed: state.isSubmitting
                ? null
                : () async {
                    final msg = _broadcastMsgController.text.trim();
                    final title = _broadcastTitleController.text.trim();
                    if (msg.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter announcement message')),
                      );
                      return;
                    }

                    final success = await ref.read(adminProvider.notifier).sendBroadcast(
                          title: title.isEmpty ? 'RentVeda Update' : title,
                          message: msg,
                          showPopup: _showPopupCheck,
                          sendPush: _sendPushCheck,
                        );

                    if (mounted) {
                      if (success) {
                        _broadcastTitleController.clear();
                        _broadcastMsgController.clear();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Broadcast sent successfully to all users!'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Failed to send broadcast'),
                            backgroundColor: AppColors.danger,
                          ),
                        );
                      }
                    }
                  },
            icon: state.isSubmitting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : const Icon(Icons.send),
            label: Text(
              state.isSubmitting ? 'Sending...' : 'Send Broadcast to All Users',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGold,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),

        const SizedBox(height: 16),

        // Dismiss popup button
        SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: state.isSubmitting
                ? null
                : () async {
                    final success = await ref.read(adminProvider.notifier).clearBroadcast();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(success ? 'Active announcements cleared!' : 'Failed to clear'),
                        ),
                      );
                    }
                  },
            icon: const Icon(Icons.cancel_outlined, size: 16),
            label: const Text('Clear Active In-App Popup For Everyone'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
      ],
    );
  }
}
