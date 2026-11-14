import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/machine_maintenance_provider.dart';

class AddTransactionSheet extends ConsumerStatefulWidget {
  final String machineId;
  final String type; // 'expense' or 'income'

  const AddTransactionSheet({
    super.key,
    required this.machineId,
    required this.type,
  });

  @override
  ConsumerState<AddTransactionSheet> createState() => _AddTransactionSheetState();
}

class _AddTransactionSheetState extends ConsumerState<AddTransactionSheet> {
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  DateTime _selectedDate = DateTime.now();
  bool _isSaving = false;

  final List<String> _expenseChips = [
    'chipFuel', 'chipRepair', 'chipOilLubricant', 'chipSpareParts', 
    'chipTransport', 'chipLabour', 'chipInsurance', 'chipOther'
  ];

  final List<String> _incomeChips = [
    'chipScrapSale', 'chipRentalBonus', 'chipOvertime', 'chipLateFee', 'chipOther'
  ];

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _handleSave() async {
    if (_amountController.text.isEmpty || double.tryParse(_amountController.text) == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(tr('enterValidAmount'))),
      );
      return;
    }

    if (_descriptionController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(tr('fillAllFields'))),
      );
      return;
    }

    setState(() {
      _isSaving = true;
    });

    final notifier = ref.read(machineMaintenanceProvider.notifier);
    final success = await notifier.addMaintenance(
      type: widget.type,
      amount: double.parse(_amountController.text),
      description: _descriptionController.text,
      date: _selectedDate.toIso8601String().split('T')[0],
      machineId: widget.machineId,
    );

    setState(() {
      _isSaving = false;
    });

    if (success && mounted) {
      Navigator.pop(context, true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(tr('entryAddedSuccess')),
          backgroundColor: AppColors.successDark,
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(tr('entryAddFailed')),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  Future<void> _pickDate() async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2000),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (pickedDate != null) {
      setState(() {
        _selectedDate = pickedDate;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isExpense = widget.type == 'expense';
    final chips = isExpense ? _expenseChips : _incomeChips;
    final color = isExpense ? AppColors.danger : AppColors.successDark;

    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: const BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  tr('addEntryTitle'),
                  style: AppTypography.screenHeader.copyWith(color: AppColors.textMain),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 10),
            
            // Amount
            Text(tr('amountLabel'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(
                hintText: tr('enterAmount'),
                prefixIcon: const Icon(Icons.currency_rupee, size: 18),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),

            // Chips
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: chips.map((chipKey) {
                final isSelected = _descriptionController.text == tr(chipKey);
                return ChoiceChip(
                  label: Text(tr(chipKey)),
                  selected: isSelected,
                  selectedColor: color.withValues(alpha: 0.2),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _descriptionController.text = tr(chipKey);
                      });
                    }
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Description
            Text(tr('descriptionLabel'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _descriptionController,
              decoration: InputDecoration(
                hintText: tr('enterDescription'),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 16),

            // Date
            Text(tr('dateLabel'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: _pickDate,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade400),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      DateFormat('yyyy-MM-dd').format(_selectedDate),
                      style: AppTypography.bodySecondary,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Save Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: color,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: _isSaving ? null : _handleSave,
                child: _isSaving
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : Text(
                        tr('saveButton'),
                        style: AppTypography.cardHeader.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
