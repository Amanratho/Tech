import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/home_provider.dart';
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
  @override
  void initState() {
    super.initState();
    // Load dashboard data when screen opens
    Future.microtask(() {
      ref.read(homeProvider.notifier).loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final homeState = ref.watch(homeProvider);

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
                      await ref.read(homeProvider.notifier).loadDashboardData();
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
