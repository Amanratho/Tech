import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:image_picker/image_picker.dart';
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
  final TextEditingController _rentTypeController = TextEditingController();
  
  File? _imageFile;
  String? _existingImageUrl;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    // Load existing data if available
    if (widget.extraMachineData != null) {
      _machineNameController.text = widget.extraMachineData!['Machine_name'] ?? '';
      _rentTypeController.text = widget.extraMachineData!['RentType'] ?? '';
      _existingImageUrl = widget.extraMachineData!['image'];
    } else {
      // If no extra data, find from provider state
      final machines = ref.read(updateMachineryProvider).machines;
      final existingMachine = machines.cast<Map<String, dynamic>>().firstWhere(
        (m) => m['Machine_id'].toString() == widget.machineId, 
        orElse: () => {},
      );
      
      _machineNameController.text = existingMachine['Machine_name'] ?? '';
      _rentTypeController.text = existingMachine['RentType'] ?? '';
      _existingImageUrl = existingMachine['image'];
    }
  }

  @override
  void dispose() {
    _machineNameController.dispose();
    _rentTypeController.dispose();
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
      Fluttertoast.showToast(msg: "Failed to pick image", backgroundColor: AppColors.danger);
    }
  }

  void _submitForm() async {
    final name = _machineNameController.text.trim();
    final rentType = _rentTypeController.text.trim();

    if (name.isEmpty || rentType.isEmpty) {
      Fluttertoast.showToast(msg: "Please fill required fields", backgroundColor: AppColors.danger);
      return;
    }

    final success = await ref.read(updateMachineryProvider.notifier).updateMachine(
      machineId: widget.machineId,
      machineName: name,
      rentType: rentType,
      image: _imageFile,
    );

    if (success) {
      Fluttertoast.showToast(msg: "Machine updated successfully!", backgroundColor: AppColors.successDark);
      if (mounted) context.pop();
    } else {
      final error = ref.read(updateMachineryProvider).error ?? "Failed to update machine";
      Fluttertoast.showToast(msg: error, backgroundColor: AppColors.danger);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(updateMachineryProvider);

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      appBar: const RentVedaAppBar(showBackButton: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                tr('editMachine'),
                style: AppTypography.screenHeader,
              ),
              const SizedBox(height: 32),

              // Image Upload
              Center(
                child: GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    width: double.infinity,
                    height: 200,
                    decoration: BoxDecoration(
                      color: AppColors.bgSurface,
                      border: Border.all(color: AppColors.border, width: 2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: _imageFile != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(14),
                            child: Image.file(_imageFile!, fit: BoxFit.cover, width: double.infinity),
                          )
                        : (_existingImageUrl != null && _existingImageUrl!.isNotEmpty)
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(14),
                                child: Image.network(_existingImageUrl!, fit: BoxFit.cover, width: double.infinity),
                              )
                            : Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.add_a_photo, size: 48, color: AppColors.textSubtle),
                                  const SizedBox(height: 12),
                                  Text("Tap to upload new image", style: AppTypography.bodySecondary),
                                ],
                              ),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Form
              _buildInputLabel("Machine Name"),
              _buildTextField(_machineNameController, Icons.precision_manufacturing, "Enter machine name"),
              const SizedBox(height: 16),

              _buildInputLabel("Rent Type"),
              _buildTextField(_rentTypeController, Icons.category, "e.g. Per Hour, Per Day"),
              const SizedBox(height: 40),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: state.isLoading ? null : _submitForm,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGold,
                    foregroundColor: AppColors.textMain,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: state.isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.textMain),
                        )
                      : Text(
                          "Save Changes",
                          style: AppTypography.buttonText,
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 4),
      child: Text(label, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
    );
  }

  Widget _buildTextField(TextEditingController controller, IconData icon, String hint) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: AppTypography.bodySecondary,
        prefixIcon: Icon(icon, color: AppColors.textSubtle, size: 20),
        filled: true,
        fillColor: AppColors.bgSurface,
        contentPadding: const EdgeInsets.symmetric(vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryGold, width: 2)),
      ),
    );
  }
}
