import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/top_app_bar.dart';
import '../../providers/update_machinery_provider.dart';

class UpdateMachineryScreen extends ConsumerStatefulWidget {
  const UpdateMachineryScreen({super.key});

  @override
  ConsumerState<UpdateMachineryScreen> createState() => _UpdateMachineryScreenState();
}

class _UpdateMachineryScreenState extends ConsumerState<UpdateMachineryScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(updateMachineryProvider.notifier).fetchMachines());
  }

  void _showArchiveConfirm(String machineId) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.bgSurface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(tr('archiveMachine'), style: AppTypography.cardHeader),
          content: Text("Are you sure you want to archive this machine? Historical data will be preserved.", style: AppTypography.bodyMain),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(tr('cancelButton'), style: AppTypography.buttonText.copyWith(color: AppColors.textSubtle)),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(dialogContext);
                final success = await ref.read(updateMachineryProvider.notifier).archiveMachine(machineId);
                if (success) {
                  Fluttertoast.showToast(msg: "Machine archived successfully!", backgroundColor: AppColors.successDark);
                } else {
                  final error = ref.read(updateMachineryProvider).error ?? "Failed to archive machine";
                  Fluttertoast.showToast(msg: error, backgroundColor: AppColors.danger);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.danger,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text(tr('archiveMachine')),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(updateMachineryProvider);

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      appBar: const RentVedaAppBar(showBackButton: true),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tr('manageMachinery'),
                        style: AppTypography.screenHeader,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "${state.machines.length} ${tr('registeredMachines')}",
                        style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () => context.push('/add-machine'),
                    icon: const Icon(Icons.add, size: 16),
                    label: const Text("Add New"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryGold,
                      foregroundColor: AppColors.textMain,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                  )
                ],
              ),
              const SizedBox(height: 24),

              // Content
              if (state.isLoading && state.machines.isEmpty)
                const Expanded(child: Center(child: CircularProgressIndicator(color: AppColors.primaryGold)))
              else if (state.machines.isEmpty)
                Expanded(
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: AppColors.bgSurface,
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Text(tr('noMachinesFound'), style: AppTypography.bodySecondary, textAlign: TextAlign.center),
                    ),
                  ),
                )
              else
                Expanded(
                  child: ListView.separated(
                    itemCount: state.machines.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final machine = state.machines[index];
                      final machineId = machine['Machine_id']?.toString() ?? '';
                      final imageUrl = machine['image'];
                      
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.bgSurface,
                          border: Border.all(color: AppColors.border),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 4)),
                          ],
                        ),
                        child: Row(
                          children: [
                            // Machine Image
                            Container(
                              width: 60,
                              height: 60,
                              decoration: BoxDecoration(
                                color: AppColors.bgMain,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: imageUrl != null && imageUrl.toString().isNotEmpty
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Image.network(imageUrl, fit: BoxFit.cover),
                                    )
                                  : const Icon(Icons.precision_manufacturing, color: AppColors.textSubtle),
                            ),
                            const SizedBox(width: 16),
                            
                            // Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    machine['Machine_name'] ?? 'Unknown',
                                    style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.primaryGold.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.3)),
                                    ),
                                    child: Text(
                                      machine['RentType'] ?? 'Unknown',
                                      style: AppTypography.caption.copyWith(color: AppColors.primaryGold, fontWeight: FontWeight.bold),
                                    ),
                                  )
                                ],
                              ),
                            ),
                            
                            // Actions
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit_note, color: AppColors.primaryGold),
                                  onPressed: () {
                                    context.push('/edit-machine/$machineId', extra: machine);
                                  },
                                  tooltip: tr('editMachine'),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.archive_outlined, color: AppColors.danger),
                                  onPressed: () => _showArchiveConfirm(machineId),
                                  tooltip: tr('archiveMachine'),
                                ),
                              ],
                            )
                          ],
                        ),
                      );
                    },
                  ),
                )
            ],
          ),
        ),
      ),
    );
  }
}
