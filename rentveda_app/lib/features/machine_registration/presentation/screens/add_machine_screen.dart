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
import '../../providers/add_machine_provider.dart';

class AddMachineScreen extends ConsumerStatefulWidget {
  const AddMachineScreen({super.key});

  @override
  ConsumerState<AddMachineScreen> createState() => _AddMachineScreenState();
}

class _AddMachineScreenState extends ConsumerState<AddMachineScreen> {
  final TextEditingController _machineNameController = TextEditingController();
  String _rentType = '';
  File? _image;
  final ImagePicker _picker = ImagePicker();

  final List<String> _rentTypes = [
    'Acre',
    'Hour',
    'Quantity',
    'Days',
    'Contract',
    'Kilometers',
    'Foot',
  ];

  Future<void> _pickImage() async {
    try {
      final XFile? pickedFile = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
      if (pickedFile != null) {
        setState(() {
          _image = File(pickedFile.path);
        });
      }
    } catch (e) {
      Fluttertoast.showToast(msg: tr('failedToPickImage'), backgroundColor: AppColors.danger);
    }
  }

  void _submit() async {
    if (_machineNameController.text.trim().isEmpty) {
      Fluttertoast.showToast(msg: tr('enterMachineName'), backgroundColor: AppColors.danger);
      return;
    }
    if (_rentType.isEmpty) {
      Fluttertoast.showToast(msg: tr('selectRentTypeErr'), backgroundColor: AppColors.danger);
      return;
    }
    if (_image == null) {
      Fluttertoast.showToast(msg: tr('uploadImageErr'), backgroundColor: AppColors.danger);
      return;
    }

    await ref.read(addMachineProvider.notifier).submitMachine(
      machineName: _machineNameController.text.trim(),
      rentType: _rentType,
      imageFile: _image!,
    );

    final state = ref.read(addMachineProvider);
    if (state.isSuccess) {
      Fluttertoast.showToast(msg: tr('successMessage'), backgroundColor: AppColors.successDark);
      if (mounted) {
        context.pop();
      }
    } else if (state.error != null) {
      Fluttertoast.showToast(msg: state.error!, backgroundColor: AppColors.danger);
    }
  }

  @override
  void dispose() {
    _machineNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(addMachineProvider).isLoading;

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      appBar: const RentVedaAppBar(showBackButton: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                tr('addMachine'),
                style: AppTypography.screenHeader,
              ),
              const SizedBox(height: 8),
              Text(
                tr('registerMachineDesc'),
                style: AppTypography.bodySecondary,
              ),
              const SizedBox(height: 24),
              
              // Image Upload
              GestureDetector(
                onTap: _pickImage,
                child: Container(
                  width: double.infinity,
                  height: 180,
                  decoration: BoxDecoration(
                    color: AppColors.bgSurface,
                    border: Border.all(color: AppColors.border, width: 2, style: BorderStyle.solid),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: _image != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.file(_image!, fit: BoxFit.cover, width: double.infinity),
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.cloud_upload_outlined, size: 48, color: AppColors.textSubtle),
                            const SizedBox(height: 12),
                            Text(tr('tapToUploadPhoto'), style: AppTypography.bodySecondary),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 24),

              // Machine Name
              Text(tr('machineNameLabel'), style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              TextField(
                controller: _machineNameController,
                decoration: InputDecoration(
                  hintText: tr('machineNameHint'),
                  hintStyle: AppTypography.bodySecondary,
                  prefixIcon: const Icon(Icons.agriculture, color: AppColors.primaryGold),
                  filled: true,
                  fillColor: AppColors.bgSurface,
                  contentPadding: const EdgeInsets.symmetric(vertical: 16),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryGold, width: 2)),
                ),
              ),
              const SizedBox(height: 24),

              // Rent Type
              Text(tr('rentTypeLabel'), style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              InputDecorator(
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.category, color: AppColors.textSubtle, size: 20),
                  filled: true,
                  fillColor: AppColors.bgSurface,
                  contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primaryGold, width: 2)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _rentType.isEmpty || !_rentTypes.contains(_rentType) ? null : _rentType,
                    hint: Text(tr('selectRentTypeHint'), style: AppTypography.bodySecondary),
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.textSubtle),
                    dropdownColor: AppColors.bgSurface,
                    borderRadius: BorderRadius.circular(16),
                    items: _rentTypes.map((type) {
                      return DropdownMenuItem(
                        value: type,
                        child: Text(tr('${type.toLowerCase()}RentType'), style: AppTypography.bodyMain),
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
              const SizedBox(height: 40),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.warning,
                    foregroundColor: AppColors.warningDark,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.warningDark),
                        )
                      : Text(
                          tr('registerMachineBtn'),
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
}
