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
  @override
  void initState() {
    super.initState();
    // Use Future.microtask to avoid modifying provider during build
    Future.microtask(() => ref.read(machineMaintenanceProvider.notifier).fetchMachineSummary());
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

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      physics: const AlwaysScrollableScrollPhysics(),
      itemCount: state.summaries.length,
      itemBuilder: (context, index) {
        final machine = state.summaries[index];
        return MachineCard(machine: machine);
      },
    );
  }
}
