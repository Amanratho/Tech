import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dotted_border/dotted_border.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/top_app_bar.dart';
import '../../providers/update_machinery_provider.dart';

class EditMachineScreen extends ConsumerStatefulWidget {
  final String machineId;
  final Map<String, dynamic>? extraMachineData;

  const EditMachineScreen({
    super.key,
    required this.machineId,
    this.extraMachineData,
  });

  @override
  ConsumerState<EditMachineScreen> createState() => _EditMachineScreenState();
}

class _EditMachineScreenState extends ConsumerState<EditMachineScreen> {
  final TextEditingController _machineNameController = TextEditingController();
  String _rentType = '';

  final List<String> _rentTypes = [
    'Acre',
    'Hour',
    'Quantity',
    'Days',
    'Contract',
    'Kilometers',
    'Foot',
  ];
  
  File? _imageFile;
  String? _existingImageUrl;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    // Load existing data if available
    if (widget.extraMachineData != null) {
      _machineNameController.text = widget.extraMachineData!['Machine_name'] ?? '';
      _rentType = widget.extraMachineData!['RentType'] ?? '';
      _existingImageUrl = widget.extraMachineData!['image'];
    } else {
      // If no extra data, find from provider state
      final machines = ref.read(updateMachineryProvider).machines;
      final existingMachine = machines.cast<Map<String, dynamic>>().firstWhere(
        (m) => m['Machine_id'].toString() == widget.machineId, 
        orElse: () => {},
      );
      
      _machineNameController.text = existingMachine['Machine_name'] ?? '';
      _rentType = existingMachine['RentType'] ?? '';
      _existingImageUrl = existingMachine['image'];
    }
  }

  @override
  void dispose() {
    _machineNameController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final XFile? pickedFile = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
      if (pickedFile != null) {
        setState(() {
          _imageFile = File(pickedFile.path);
        });
      }
    } catch (e) {
      Fluttertoast.showToast(msg: tr('failedToPickImage'), backgroundColor: AppColors.danger);
    }
  }

  void _submitForm() async {
    final name = _machineNameController.text.trim();
    final rentType = _rentType;

    if (name.isEmpty || rentType.isEmpty) {
      Fluttertoast.showToast(msg: tr('fillAllFieldsErr'), backgroundColor: AppColors.danger);
      return;
    }

    final success = await ref.read(updateMachineryProvider.notifier).updateMachine(
      machineId: widget.machineId,
      machineName: name,
      rentType: rentType,
      image: _imageFile,
    );

    if (success) {
      Fluttertoast.showToast(msg: tr('machineUpdateSuccess'), backgroundColor: AppColors.successDark);
      if (mounted) context.pop();
    } else {
      Fluttertoast.showToast(msg: tr('machineUpdateFailed'), backgroundColor: AppColors.danger);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(updateMachineryProvider);

    return Scaffold(
      backgroundColor: AppColors.bgMain, // bg-[#f9f9f9]
      appBar: const RentVedaAppBar(showBackButton: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                )
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header inside Card
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tr('editMachineDetails'), style: AppTypography.screenHeader.copyWith(fontSize: 18)),
                    const SizedBox(height: 4),
                    Text(tr('editMachineSubtitle'), style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    const Divider(color: AppColors.border),
                    const SizedBox(height: 20),
                  ],
                ),

                // Form
                _buildInputLabel(tr('machineName')),
                _buildTextField(_machineNameController, Icons.precision_manufacturing, tr('enterMachineName')),
                const SizedBox(height: 20),

                _buildInputLabel(tr('rentType')),
                InputDecorator(
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.settings, color: AppColors.textSubtle, size: 16),
                    filled: true,
                    fillColor: AppColors.bgMain,
                    contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.border)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.border)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.primaryGold, width: 2)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: _rentType.isEmpty || !_rentTypes.contains(_rentType) ? null : _rentType,
                      hint: Text(tr('selectRentType'), style: AppTypography.bodySecondary),
                      icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.textSubtle, size: 20),
                      dropdownColor: AppColors.bgSurface,
                      borderRadius: BorderRadius.circular(16),
                      items: _rentTypes.map((type) {
                        return DropdownMenuItem(
                          value: type,
                          child: Text(type, style: AppTypography.bodyMain.copyWith(fontSize: 13, fontWeight: FontWeight.w600)),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _rentType = value ?? '';
                        });
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Image Upload Area
                _buildInputLabel(tr('uploadMachineImage')),
                GestureDetector(
                  onTap: _pickImage,
                  child: DottedBorder(
                    options: const RoundedRectDottedBorderOptions(
                      color: AppColors.border,
                      strokeWidth: 2,
                      dashPattern: [8, 4],
                      radius: Radius.circular(16),
                    ),
                    child: Container(
                      width: double.infinity,
                      height: 160,
                      decoration: BoxDecoration(
                        color: AppColors.bgMain,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: _imageFile != null
                          ? Stack(
                              fit: StackFit.expand,
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(14),
                                  child: Image.file(_imageFile!, fit: BoxFit.cover),
                                ),
                                Container(
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.3),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  alignment: Alignment.center,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withValues(alpha: 0.7),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.edit, color: Colors.white, size: 12),
                                        const SizedBox(width: 8),
                                        Text(tr('changeImage'), style: AppTypography.caption.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            )
                          : (_existingImageUrl != null && _existingImageUrl!.isNotEmpty)
                              ? Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(14),
                                      child: Image.network(_existingImageUrl!, fit: BoxFit.cover),
                                    ),
                                    Container(
                                      decoration: BoxDecoration(
                                        color: Colors.black.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                    ),
                                  ],
                                )
                              : Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      width: 48,
                                      height: 48,
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        shape: BoxShape.rectangle,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: AppColors.border),
                                        boxShadow: [
                                          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 2)),
                                        ],
                                      ),
                                      child: const Icon(Icons.cloud_upload, color: Color(0xFF795900), size: 24),
                                    ),
                                    const SizedBox(height: 12),
                                    Text(tr('tapToUpdatePhoto'), style: AppTypography.bodySecondary.copyWith(fontWeight: FontWeight.bold, color: AppColors.textMain, fontSize: 13)),
                                    const SizedBox(height: 4),
                                    Text(tr('leaveBlankPhoto'), style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 10)),
                                  ],
                                ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => context.pop(),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          side: const BorderSide(color: AppColors.border),
                          foregroundColor: AppColors.textMain,
                        ),
                        child: Text(tr('cancelButton'), style: AppTypography.buttonText.copyWith(color: AppColors.textMain)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: state.isLoading ? null : _submitForm,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.warning,
                          foregroundColor: AppColors.warningDark,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: state.isLoading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.warningDark),
                              )
                            : Text(
                                tr('saveChangesButton'),
                                style: AppTypography.buttonText,
                              ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInputLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 4),
      child: Text(label, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.textSubtle)),
    );
  }

  Widget _buildTextField(TextEditingController controller, IconData icon, String hint) {
    return TextField(
      controller: controller,
      style: AppTypography.bodyMain.copyWith(fontSize: 13, fontWeight: FontWeight.w600),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: AppTypography.bodySecondary,
        prefixIcon: Icon(icon, color: AppColors.textSubtle, size: 16),
        filled: true,
        fillColor: AppColors.bgMain,
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.primaryGold, width: 2)),
      ),
    );
  }
}
