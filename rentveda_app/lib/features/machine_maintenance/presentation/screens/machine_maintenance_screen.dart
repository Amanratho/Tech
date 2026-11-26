import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/machine_maintenance_provider.dart';
import '../widgets/machine_card.dart';

class MachineMaintenanceScreen extends ConsumerStatefulWidget {
  const MachineMaintenanceScreen({super.key});

  @override
  ConsumerState<MachineMaintenanceScreen> createState() => _MachineMaintenanceScreenState();
}

class _MachineMaintenanceScreenState extends ConsumerState<MachineMaintenanceScreen> {
  bool _showArchived = false;

  @override
  void initState() {
    super.initState();
    // Use Future.microtask to avoid modifying provider during build
    Future.microtask(() {
      if (mounted) {
        ref.read(machineMaintenanceProvider.notifier).fetchMachineSummary();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(machineMaintenanceProvider);

    return Scaffold(
      backgroundColor: AppColors.bgSurface,
      body: RefreshIndicator(
        onRefresh: () => ref.read(machineMaintenanceProvider.notifier).fetchMachineSummary(),
        color: AppColors.primary,
        child: _buildBody(state),
      ),
    );
  }

  Widget _buildBody(MachineMaintenanceState state) {
    if (state.isLoading && state.summaries.isEmpty) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    if (state.error != null && state.summaries.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
            const SizedBox(height: 16),
            Text(
              state.error!,
              style: AppTypography.bodySecondary.copyWith(color: AppColors.danger),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(machineMaintenanceProvider.notifier).fetchMachineSummary(),
              child: Text(tr('eodFetchError')),
            ),
          ],
        ),
      );
    }

    if (state.summaries.isEmpty) {
      return CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverFillRemaining(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.handyman_outlined, size: 64, color: AppColors.textSubtle),
                  const SizedBox(height: 16),
                  Text(
                    tr('noMachinesFound'),
                    style: AppTypography.cardHeader.copyWith(color: AppColors.textSubtle),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    final activeMachines = state.summaries.where((m) => !m.isArchived).toList();
    final archivedMachines = state.summaries.where((m) => m.isArchived).toList();

    // If currently showing archived view
    if (_showArchived) {
      return Column(
        children: [
          // Header with Back button and Info
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Row(
              children: [
                InkWell(
                  borderRadius: BorderRadius.circular(8),
                  onTap: () => setState(() => _showArchived = false),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.arrow_back, size: 16, color: AppColors.textMain),
                        const SizedBox(width: 4),
                        Text(
                          tr('backToActiveMachines'),
                          style: AppTypography.caption.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF7ED),
                    border: Border.all(color: const Color(0xFFFED7AA)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.archive, size: 12, color: Color(0xFFC2410C)),
                      const SizedBox(width: 4),
                      Text(
                        '${tr('archivedBadge')} (${archivedMachines.length})',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFC2410C),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Informative Banner
          Container(
            width: double.infinity,
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF7ED),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFFED7AA)),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, size: 16, color: Color(0xFFC2410C)),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    tr('archivedMachinesNotice'),
                    style: AppTypography.caption.copyWith(
                      color: const Color(0xFF9A3412),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Archived Machines List
          Expanded(
            child: archivedMachines.isEmpty
                ? Center(
                    child: Text(
                      tr('noArchivedMachines'),
                      style: AppTypography.cardHeader.copyWith(color: AppColors.textSubtle),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    physics: const AlwaysScrollableScrollPhysics(),
                    itemCount: archivedMachines.length,
                    itemBuilder: (context, index) {
                      return MachineCard(machine: archivedMachines[index]);
                    },
                  ),
          ),
        ],
      );
    }

    // Default View: Shows Active Machines directly without any tabs!
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      physics: const AlwaysScrollableScrollPhysics(),
      // +1 to show the "View Archived Machines" button at the bottom if archived machines exist
      itemCount: activeMachines.length + (archivedMachines.isNotEmpty ? 1 : 0),
      itemBuilder: (context, index) {
        if (index < activeMachines.length) {
          final machine = activeMachines[index];
          return MachineCard(machine: machine);
        }

        // Bottom Button to view archived machines
        return Padding(
          padding: const EdgeInsets.only(top: 8, bottom: 24),
          child: Center(
            child: OutlinedButton.icon(
              onPressed: () => setState(() => _showArchived = true),
              icon: const Icon(Icons.archive_outlined, size: 18, color: Color(0xFFC2410C)),
              label: Text(
                '${tr('viewArchivedMachines')} (${archivedMachines.length})',
                style: const TextStyle(
                  color: Color(0xFFC2410C),
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFFED7AA)),
                backgroundColor: const Color(0xFFFFF7ED),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
              ),
            ),
          ),
        );
      },
    );
  }
}
