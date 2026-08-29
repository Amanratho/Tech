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
    Future.microtask(() {
      if (mounted) {
        ref.read(updateMachineryProvider.notifier).fetchMachines();
      }
    });
  }

  void _showArchiveConfirm(String machineId) {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.bgMain, // bg-[#f9f9f9] equivalent
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(tr('archiveMachine'), style: AppTypography.cardHeader),
          content: Text(tr('archiveConfirmMessage'), style: AppTypography.bodyMain.copyWith(color: AppColors.textSubtle, fontSize: 13)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(tr('cancelButton'), style: AppTypography.buttonText.copyWith(color: AppColors.textMain)),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(dialogContext);
                final success = await ref.read(updateMachineryProvider.notifier).archiveMachine(machineId);
                if (success) {
                  Fluttertoast.showToast(msg: tr('archiveSuccessToast'), backgroundColor: AppColors.successDark);
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
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
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
                        style: AppTypography.screenHeader.copyWith(fontSize: 16),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        "${state.machines.length} ${tr('registeredMachines')}",
                        style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontWeight: FontWeight.bold, fontSize: 10),
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () => context.push('/add-machine'),
                    icon: const Icon(Icons.add, size: 14),
                    label: Text(tr('addNewButton'), style: AppTypography.buttonText.copyWith(fontSize: 12)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.warning,
                      foregroundColor: AppColors.warningDark, // text-[#6c5000]
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      minimumSize: const Size(0, 36),
                    ),
                  )
                ],
              ),
              const SizedBox(height: 16),

              // Content
              if (state.isLoading && state.machines.isEmpty)
                Expanded(
                  child: ListView.separated(
                    itemCount: 3,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      return Container(
                        width: double.infinity,
                        height: 144, // h-36 in tailwind is 144px
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const Center(
                          child: CircularProgressIndicator(color: AppColors.border),
                        ),
                      );
                    },
                  ),
                )
              else if (state.machines.isEmpty)
                Expanded(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(48),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      tr('noMachinesFound'),
                      style: AppTypography.bodySecondary.copyWith(fontWeight: FontWeight.w600, fontSize: 12),
                      textAlign: TextAlign.center,
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
                      final rentType = machine['RentType'] ?? tr('rateLabel');
                      final machineName = machine['Machine_name'] ?? 'Unknown';

                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 2)),
                          ],
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: SizedBox(
                          height: 176, // h-44
                          width: double.infinity,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              // Background Image
                              imageUrl != null && imageUrl.toString().isNotEmpty
                                  ? Image.network(
                                      imageUrl,
                                      fit: BoxFit.cover,
                                      loadingBuilder: (context, child, loadingProgress) {
                                        if (loadingProgress == null) return child;
                                        return Container(color: Colors.grey.shade100, child: const Center(child: CircularProgressIndicator(strokeWidth: 2)));
                                      },
                                      errorBuilder: (context, error, stackTrace) => Container(
                                        color: Colors.grey.shade100,
                                        child: const Center(child: Icon(Icons.precision_manufacturing, size: 48, color: Colors.black26)),
                                      ),
                                    )
                                  : Container(
                                      color: Colors.grey.shade100,
                                      child: const Center(child: Icon(Icons.precision_manufacturing, size: 48, color: Colors.black26)),
                                    ),

                              // Gradient Overlay
                              Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.bottomCenter,
                                    end: Alignment.topCenter,
                                    colors: [
                                      Colors.black.withValues(alpha: 0.8),
                                      Colors.black.withValues(alpha: 0.3),
                                      Colors.transparent,
                                    ],
                                  ),
                                ),
                              ),

                              // Pricing Badge (Top Left)
                              Positioned(
                                top: 12,
                                left: 12,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryGold,
                                    borderRadius: BorderRadius.circular(20),
                                    boxShadow: [
                                      BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 2, offset: const Offset(0, 1)),
                                    ],
                                  ),
                                  child: Text(
                                    rentType.toUpperCase(),
                                    style: const TextStyle(
                                      color: Color(0xFF6C5000),
                                      fontSize: 10,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                              ),

                              // Machine Name (Bottom Left)
                              Positioned(
                                bottom: 12,
                                left: 12,
                                right: 100, // Space for action buttons
                                child: Text(
                                  machineName,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    shadows: [Shadow(color: Colors.black26, offset: Offset(0, 1), blurRadius: 2)],
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),

                              // Action Buttons (Bottom Right)
                              Positioned(
                                bottom: 12,
                                right: 12,
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    // Edit Button
                                    GestureDetector(
                                      onTap: () {
                                        context.push('/edit-machine/$machineId', extra: machine);
                                      },
                                      child: Container(
                                        width: 36,
                                        height: 36,
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius: BorderRadius.circular(12),
                                          boxShadow: [
                                            BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4, offset: const Offset(0, 2)),
                                          ],
                                        ),
                                        child: const Icon(Icons.edit, size: 16, color: Color(0xFF1A1C1C)),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    // Archive Button
                                    GestureDetector(
                                      onTap: () => _showArchiveConfirm(machineId),
                                      child: Container(
                                        width: 36,
                                        height: 36,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFFEF2F2), // red-50
                                          border: Border.all(color: const Color(0xFFFECACA)), // red-200
                                          borderRadius: BorderRadius.circular(12),
                                          boxShadow: [
                                            BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4, offset: const Offset(0, 2)),
                                          ],
                                        ),
                                        child: const Icon(Icons.archive, size: 16, color: Color(0xFFDC2626)),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
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
