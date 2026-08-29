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
      Fluttertoast.showToast(msg: tr('failedToPickImage'), backgroundColor: AppColors.danger);
    }
  }

  void _saveProfile() async {
    await ref.read(profileProvider.notifier).updateProfile(
      username: _usernameController.text.trim(),
      mobileNo: _mobileController.text.trim(),
      companyName: _companyController.text.trim(),
      qrImage: _qrImage,
    );

    if (!mounted) return;
    final state = ref.read(profileProvider);
    if (state.isSuccess) {
      Fluttertoast.showToast(msg: tr('profileUpdateSuccess'), backgroundColor: AppColors.successDark);
      context.pop();
    } else if (state.error != null) {
      Fluttertoast.showToast(msg: state.error!, backgroundColor: AppColors.danger);
    }
  }

  void _showDeleteConfirm() {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.bgMain, // equivalent to bg-[var(--bg-main)]
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(tr('deleteAccountButton'), style: AppTypography.cardHeader),
          content: Text(tr('confirmDelete'), style: AppTypography.bodyMain.copyWith(color: AppColors.textSubtle, fontSize: 13)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(tr('cancelButton'), style: AppTypography.buttonText.copyWith(color: AppColors.textMain)),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(dialogContext);
                final success = await ref.read(profileProvider.notifier).deleteAccount();
                if (!mounted) return;
                if (success) {
                  Fluttertoast.showToast(msg: tr('accountDeletedSuccess'), backgroundColor: AppColors.successDark);
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
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
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
                // Input Fields
                _buildInputLabel(tr('nameLabel')),
                _buildTextField(_usernameController, Icons.person, tr('enterFullName')),
                const SizedBox(height: 20),

                _buildInputLabel(tr('mobileLabel')),
                _buildTextField(_mobileController, Icons.phone, tr('enterMobileNumber'), keyboardType: TextInputType.phone),
                const SizedBox(height: 20),

                _buildInputLabel(tr('companyNameLabel')),
                _buildTextField(_companyController, Icons.business, tr('enterCompanyName')),
                const SizedBox(height: 24),
                
                const Divider(color: AppColors.border),
                const SizedBox(height: 16),

                // QR Code Upload
                Row(
                  children: [
                    const Icon(Icons.qr_code, color: AppColors.primary, size: 16),
                    const SizedBox(width: 8),
                    _buildInputLabel(tr('paymentQrTitle'), padBottom: false),
                  ],
                ),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: _pickQrCode,
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
                      child: _qrImage != null
                          ? Stack(
                              fit: StackFit.expand,
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(14),
                                  child: Image.file(_qrImage!, fit: BoxFit.contain, width: double.infinity),
                                ),
                                Container(
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  alignment: Alignment.center,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withValues(alpha: 0.8),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.edit, color: Colors.white, size: 12),
                                        const SizedBox(width: 8),
                                        Text(tr('changeQr'), style: AppTypography.caption.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            )
                          : (user != null && user['qrCodeUrl'] != null && user['qrCodeUrl'].isNotEmpty)
                              ? Stack(
                                  fit: StackFit.expand,
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(14),
                                      child: Image.network(user['qrCodeUrl'], fit: BoxFit.contain, width: double.infinity),
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
                                        shape: BoxShape.circle,
                                        border: Border.all(color: AppColors.border),
                                        boxShadow: [
                                          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 2), blurStyle: BlurStyle.inner),
                                        ],
                                      ),
                                      child: const Icon(Icons.cloud_upload_outlined, color: AppColors.textSubtle, size: 24),
                                    ),
                                    const SizedBox(height: 12),
                                    Text(tr('tapToUploadQr'), style: AppTypography.bodySecondary.copyWith(fontWeight: FontWeight.bold, color: AppColors.textMain, fontSize: 13)),
                                    const SizedBox(height: 4),
                                    Text(tr('imageFormatHint'), style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 10)),
                                  ],
                                ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Save Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: state.isLoading ? null : _saveProfile,
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
                            tr('editProfileTitle'),
                            style: AppTypography.buttonText,
                          ),
                  ),
                ),
                const SizedBox(height: 16),

                // Delete Account Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _showDeleteConfirm,
                    icon: const Icon(Icons.delete_outline, size: 16),
                    label: Text(tr('deleteAccountButton'), style: AppTypography.buttonText),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.danger,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 4,
                      shadowColor: AppColors.danger.withValues(alpha: 0.4),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInputLabel(String label, {bool padBottom = true}) {
    return Padding(
      padding: EdgeInsets.only(bottom: padBottom ? 8.0 : 0, left: 4),
      child: Text(label, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.textSubtle)),
    );
  }

  Widget _buildTextField(TextEditingController controller, IconData icon, String hint, {TextInputType keyboardType = TextInputType.text}) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
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
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
      ),
    );
  }
}
