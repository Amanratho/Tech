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
import '../../providers/profile_provider.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _companyController = TextEditingController();
  
  File? _qrImage;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    final user = ref.read(profileProvider).userData;
    if (user != null) {
      _usernameController.text = user['username'] ?? '';
      _mobileController.text = user['mobileNo']?.toString() ?? '';
      _companyController.text = user['companyName'] ?? '';
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _mobileController.dispose();
    _companyController.dispose();
    super.dispose();
  }

  Future<void> _pickQrCode() async {
    try {
      final XFile? pickedFile = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
      if (pickedFile != null) {
        setState(() {
          _qrImage = File(pickedFile.path);
        });
      }
    } catch (e) {
      Fluttertoast.showToast(msg: "Failed to pick image", backgroundColor: AppColors.danger);
    }
  }

  void _saveProfile() async {
    await ref.read(profileProvider.notifier).updateProfile(
      username: _usernameController.text.trim(),
      mobileNo: _mobileController.text.trim(),
      companyName: _companyController.text.trim(),
      qrImage: _qrImage,
    );

    final state = ref.read(profileProvider);
    if (state.isSuccess) {
      Fluttertoast.showToast(msg: tr('profileUpdateSuccess'), backgroundColor: AppColors.successDark);
      if (mounted) {
        context.pop();
      }
    } else if (state.error != null) {
      Fluttertoast.showToast(msg: state.error!, backgroundColor: AppColors.danger);
    }
  }

  void _showDeleteConfirm() {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.bgSurface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(tr('deleteAccountButton'), style: AppTypography.cardHeader),
          content: Text(tr('confirmDelete'), style: AppTypography.bodyMain),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(tr('cancelButton'), style: AppTypography.buttonText.copyWith(color: AppColors.textSubtle)),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(dialogContext);
                final success = await ref.read(profileProvider.notifier).deleteAccount();
                if (success) {
                  Fluttertoast.showToast(msg: tr('accountDeletedSuccess'), backgroundColor: AppColors.successDark);
                  if (!mounted) return;
                  context.go('/login');
                } else {
                  final error = ref.read(profileProvider).error ?? tr('accountDeleteFailed');
                  Fluttertoast.showToast(msg: error, backgroundColor: AppColors.danger);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.danger,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text(tr('deleteAccountButton')),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(profileProvider);
    final user = state.userData;

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
                tr('editProfileTitle'),
                style: AppTypography.screenHeader,
              ),
              const SizedBox(height: 24),

              // Username
              _buildInputLabel("Name"),
              _buildTextField(_usernameController, Icons.person, "Enter your name"),
              const SizedBox(height: 16),

              // Mobile
              _buildInputLabel(tr('mobile')),
              _buildTextField(_mobileController, Icons.phone, "Enter mobile number", keyboardType: TextInputType.phone),
              const SizedBox(height: 16),

              // Company
              _buildInputLabel(tr('company')),
              _buildTextField(_companyController, Icons.business, "Enter company name"),
              const SizedBox(height: 24),

              // QR Code Upload
              _buildInputLabel(tr('paymentQrTitle')),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: _pickQrCode,
                child: Container(
                  width: double.infinity,
                  height: 180,
                  decoration: BoxDecoration(
                    color: AppColors.bgSurface,
                    border: Border.all(color: AppColors.border, width: 2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: _qrImage != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: Image.file(_qrImage!, fit: BoxFit.cover, width: double.infinity),
                        )
                      : (user != null && user['qrCodeUrl'] != null && user['qrCodeUrl'].isNotEmpty)
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(14),
                              child: Image.network(user['qrCodeUrl'], fit: BoxFit.cover, width: double.infinity),
                            )
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.qr_code_scanner, size: 48, color: AppColors.textSubtle),
                                const SizedBox(height: 12),
                                Text(tr('tapToUploadQr'), style: AppTypography.bodySecondary),
                              ],
                            ),
                ),
              ),
              const SizedBox(height: 40),

              // Save Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: state.isLoading ? null : _saveProfile,
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
                          "Save Profile",
                          style: AppTypography.buttonText,
                        ),
                ),
              ),
              const SizedBox(height: 40),

              // Danger Zone
              const Divider(color: AppColors.border),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _showDeleteConfirm,
                  icon: const Icon(Icons.delete_outline, size: 18),
                  label: Text(tr('deleteAccountButton'), style: AppTypography.buttonText.copyWith(color: AppColors.danger)),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.danger,
                    side: const BorderSide(color: AppColors.danger),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 24),
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

  Widget _buildTextField(TextEditingController controller, IconData icon, String hint, {TextInputType keyboardType = TextInputType.text}) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
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
