import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../providers/home_provider.dart';
import '../../../profile/providers/profile_provider.dart';
import '../widgets/dashboard_header.dart';
import '../widgets/quick_actions.dart';
import '../widgets/machine_gallery.dart';
import '../widgets/recent_activity.dart';
import '../../../tracker/presentation/widgets/tracker_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _announcementShown = false;

  @override
  void initState() {
    super.initState();
    // Load dashboard and profile data when screen opens
    Future.microtask(() {
      if (mounted) {
        ref.read(homeProvider.notifier).loadDashboardData();
        ref.read(profileProvider.notifier).fetchProfile();
      }
    });
  }

  void _checkAnnouncement(Map<String, dynamic>? userData) {
    if (_announcementShown || userData == null) return;

    final announcement = userData['announcement'] as String?;
    final showPopup = userData['showAnnouncementPopup'] as bool? ?? false;

    if (showPopup && announcement != null && announcement.trim().isNotEmpty) {
      _announcementShown = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: const Row(
              children: [
                Icon(Icons.campaign_rounded, color: Color(0xFFFBC02D), size: 28),
                SizedBox(width: 10),
                Text(
                  'Notice',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
              ],
            ),
            content: Text(
              announcement,
              style: const TextStyle(fontSize: 15, height: 1.4),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text(
                  'OK',
                  style: TextStyle(color: Color(0xFFE65100), fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        );
      });
    }
  }

  void _openWhatsApp(String? number) async {
    final clean = (number ?? '').replaceAll(RegExp(r'[^0-9]'), '');
    final phone = clean.isEmpty ? '919876543210' : clean;
    final uri = Uri.parse(
      'https://wa.me/$phone?text=${Uri.encodeComponent("Hello RentVeda Team, I want to renew/activate my subscription.")}',
    );
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  Widget _buildSubscriptionNoticeBanner(Map<String, dynamic>? userData) {
    if (userData == null) return const SizedBox.shrink();

    final status = userData['subscriptionStatus'] as String? ?? 'trial';
    final daysLeft = userData['daysLeft'] as int? ?? 90;
    final waNumber = userData['paymentWhatsappNumber'] as String? ?? '';

    // Only show banner if expired or trial is ending soon (within 7 days)
    if (status == 'expired') {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFFCA5A5)),
        ),
        child: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Color(0xFFDC2626), size: 26),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Trial Expired',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF991B1B), fontSize: 13),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Renew subscription to keep full access.',
                    style: TextStyle(color: Color(0xFF7F1D1D), fontSize: 12),
                  ),
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () => _openWhatsApp(waNumber),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D366),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: const Text('Renew', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
    }

    if (status == 'trial' && daysLeft <= 7) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFFFFBEB),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFFDE68A)),
        ),
        child: Row(
          children: [
            const Icon(Icons.timer_outlined, color: Color(0xFFD97706), size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Free trial ends in $daysLeft day${daysLeft == 1 ? '' : 's'}. Contact us anytime to extend.',
                style: const TextStyle(color: Color(0xFF92400E), fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      );
    }

    return const SizedBox.shrink();
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeProvider);
    final profileState = ref.watch(profileProvider);

    // Check if popup announcement should be displayed
    if (profileState.userData != null) {
      _checkAnnouncement(profileState.userData);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      body: Column(
        children: [
          Expanded(
            child: homeState.isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFFBC02D)))
                : RefreshIndicator(
                    color: const Color(0xFFFBC02D),
                    onRefresh: () async {
                      await Future.wait([
                        ref.read(homeProvider.notifier).loadDashboardData(),
                        ref.read(profileProvider.notifier).fetchProfile(),
                      ]);
                    },
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // 1. Dashboard Header with Greeting & Metric Cards
                          DashboardHeader(
                            payments: homeState.payments,
                            reminders: homeState.reminders,
                            machines: homeState.machines,
                            onSummaryTap: () => context.go('/summary'),
                            onPaymentsTap: () => context.push('/payment-tracking'),
                            onBillsTap: () => context.push('/bill-history'),
                            onMachinesTap: () => context.push('/machine-maintenance'),
                          ),

                          // 1.1 Subscription / Notice Banner (if any)
                          _buildSubscriptionNoticeBanner(profileState.userData),

                          // 2. Work Tracker
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16),
                            child: TrackerCard(),
                          ),
                          const SizedBox(height: 24),

                          // 3. Quick Action Shortcuts
                          const QuickActions(),
                          const SizedBox(height: 24),

                          // 4. Machine Gallery
                          MachineGallery(
                            machines: homeState.machines,
                            onAddTap: () => context.push('/add-machine'),
                          ),
                          const SizedBox(height: 24),

                          // 5. Recent Activity Feed
                          RecentActivity(
                            payments: homeState.payments,
                            onViewAllTap: () => context.push('/bill-history'),
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
