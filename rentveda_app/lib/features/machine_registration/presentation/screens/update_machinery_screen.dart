import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/top_app_bar.dart';
import '../../machine_maintenance/providers/machine_maintenance_provider.dart';
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

  void _showArchiveDialog(String machineId, String machineName) {
    String transactionType = 'income'; // 'income' (sale/scrap) or 'expense'
    final TextEditingController amountController = TextEditingController();
    final TextEditingController descController = TextEditingController(text: tr('soldMachineDefault'));
    bool addSettlement = false;
    bool isSubmitting = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              contentPadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF7ED),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFFED7AA)),
                    ),
                    child: const Icon(Icons.archive_outlined, color: Color(0xFFC2410C), size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          tr('archiveDialogTitle'),
                          style: AppTypography.cardHeader.copyWith(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          machineName,
                          style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 12),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),
                    Text(
                      tr('archiveSettlementQuestion'),
                      style: AppTypography.bodySecondary.copyWith(
                        fontSize: 13,
                        color: AppColors.textMain,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Settlement Toggle Option
                    InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () {
                        setDialogState(() {
                          addSettlement = !addSettlement;
                          if (addSettlement && descController.text.isEmpty) {
                            descController.text = transactionType == 'income'
                                ? tr('soldMachineDefault')
                                : tr('finalExpenseDefault');
                          }
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: addSettlement ? const Color(0xFFFEFCE8) : const Color(0xFFF9FAFB),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: addSettlement ? const Color(0xFFFACC15) : AppColors.border,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              addSettlement ? Icons.check_box : Icons.check_box_outline_blank,
                              size: 20,
                              color: addSettlement ? const Color(0xFFA16207) : AppColors.textSubtle,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                tr('archiveAddSettlementCheckbox'),
                                style: AppTypography.bodyMain.copyWith(
                                  fontSize: 13,
                                  fontWeight: addSettlement ? FontWeight.bold : FontWeight.normal,
                                  color: addSettlement ? const Color(0xFFA16207) : AppColors.textMain,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    if (addSettlement) ...[
                      const SizedBox(height: 14),
                      // Type Switcher: Income / Expense
                      Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                setDialogState(() {
                                  transactionType = 'income';
                                  descController.text = tr('soldMachineDefault');
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                decoration: BoxDecoration(
                                  color: transactionType == 'income' ? const Color(0xFFDCFCE7) : const Color(0xFFF3F4F6),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: transactionType == 'income' ? const Color(0xFF22C55E) : Colors.transparent,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    tr('archiveSaleIncomeOption'),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: transactionType == 'income' ? const Color(0xFF15803D) : AppColors.textSubtle,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: GestureDetector(
                              onTap: () {
                                setDialogState(() {
                                  transactionType = 'expense';
                                  descController.text = tr('finalExpenseDefault');
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                decoration: BoxDecoration(
                                  color: transactionType == 'expense' ? const Color(0xFFFEE2E2) : const Color(0xFFF3F4F6),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: transactionType == 'expense' ? const Color(0xFFEF4444) : Colors.transparent,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    tr('archiveFinalExpenseOption'),
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: transactionType == 'expense' ? const Color(0xFFB91C1C) : AppColors.textSubtle,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Amount Input
                      TextField(
                        controller: amountController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.currency_rupee, size: 18),
                          labelText: tr('archiveAmountLabel'),
                          hintText: '50000',
                          isDense: true,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Description Input
                      TextField(
                        controller: descController,
                        decoration: InputDecoration(
                          prefixIcon: const Icon(Icons.notes, size: 18),
                          labelText: tr('archiveDescLabel'),
                          isDense: true,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ],

                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFFBEB),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                      ),
                      child: Text(
                        '💡 ${tr('archiveNotice')}',
                        style: AppTypography.caption.copyWith(color: const Color(0xFF92400E), fontSize: 11),
                      ),
                    ),
                  ],
                ),
              ),
              actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              actions: [
                if (isSubmitting)
                  const Center(child: Padding(padding: EdgeInsets.all(8.0), child: CircularProgressIndicator()))
                else ...[
                  Row(
                    children: [
                      Expanded(
                        child: TextButton(
                          onPressed: () => Navigator.pop(dialogContext),
                          child: Text(
                            tr('cancelButton'),
                            style: AppTypography.buttonText.copyWith(color: AppColors.textSubtle),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: () async {
                            final double? amount = double.tryParse(amountController.text.trim());
                            if (addSettlement && (amount == null || amount <= 0)) {
                              Fluttertoast.showToast(
                                msg: tr('enterValidAmountError'),
                                backgroundColor: AppColors.danger,
                              );
                              return;
                            }

                            setDialogState(() => isSubmitting = true);

                            // If settlement is requested, record maintenance entry first
                            if (addSettlement && amount != null && amount > 0) {
                              try {
                                final desc = descController.text.trim().isEmpty
                                    ? (transactionType == 'income' ? tr('soldMachineDefault') : tr('finalExpenseDefault'))
                                    : descController.text.trim();
                                final today = DateTime.now().toIso8601String();
                                await ref.read(machineMaintenanceProvider.notifier).addMaintenance(
                                      type: transactionType,
                                      amount: amount,
                                      description: desc,
                                      date: today,
                                      machineId: machineId,
                                    );
                              } catch (_) {}
                            }

                            // Archive machine
                            final success = await ref.read(updateMachineryProvider.notifier).archiveMachine(machineId);
                            if (dialogContext.mounted) {
                              Navigator.pop(dialogContext);
                            }

                            if (success) {
                              Fluttertoast.showToast(
                                msg: tr('archiveSuccessToast'),
                                backgroundColor: AppColors.successDark,
                              );
                              ref.read(machineMaintenanceProvider.notifier).fetchMachineSummary();
                            } else {
                              final error = ref.read(updateMachineryProvider).error ?? tr('archiveErrorToast');
                              Fluttertoast.showToast(msg: error, backgroundColor: AppColors.danger);
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFC2410C),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: Text(
                            addSettlement ? tr('archiveAndSaveButton') : tr('archiveOnlyButton'),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            );
          },
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

                              // Rent Type Badge (Top Left)
                              Positioned(
                                top: 12,
                                left: 12,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: Colors.white.withValues(alpha: 0.25), width: 1),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.25),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.handyman_outlined, size: 12, color: Color(0xFFFBBF24)),
                                      const SizedBox(width: 5),
                                      Text(
                                        '${tr('rentType')}: ',
                                        style: TextStyle(
                                          color: Colors.white.withValues(alpha: 0.75),
                                          fontSize: 11,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      Text(
                                        rentType,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
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
                                      onTap: () => _showArchiveDialog(machineId, machineName),
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
