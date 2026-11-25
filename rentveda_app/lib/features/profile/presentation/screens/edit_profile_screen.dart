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
  final String? focusSection; // 'qr', 'password', 'profile'

  const EditProfileScreen({super.key, this.focusSection});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _profileKey = GlobalKey();
  final GlobalKey _qrKey = GlobalKey();
  final GlobalKey _passwordKey = GlobalKey();

  final FocusNode _nameFocusNode = FocusNode();
  final FocusNode _passwordFocusNode = FocusNode();

  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _mobileController = TextEditingController();
  final TextEditingController _companyController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  String? _highlightedSection;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

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

    if (widget.focusSection != null) {
      _highlightedSection = widget.focusSection;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _handleInitialFocus(widget.focusSection!);
      });
    }
  }

  void _handleInitialFocus(String section) {
    Future.delayed(const Duration(milliseconds: 350), () {
      if (!mounted) return;
      if (section == 'qr' && _qrKey.currentContext != null) {
        Scrollable.ensureVisible(
          _qrKey.currentContext!,
          duration: const Duration(milliseconds: 650),
          curve: Curves.easeInOutCubic,
          alignment: 0.15,
        );
      } else if (section == 'password' && _passwordKey.currentContext != null) {
        Scrollable.ensureVisible(
          _passwordKey.currentContext!,
          duration: const Duration(milliseconds: 650),
          curve: Curves.easeInOutCubic,
          alignment: 0.15,
        );
        Future.delayed(const Duration(milliseconds: 700), () {
          if (mounted) _passwordFocusNode.requestFocus();
        });
      } else if (section == 'profile') {
        _nameFocusNode.requestFocus();
      }

      // Automatically fade highlight after 3.5 seconds
      Future.delayed(const Duration(milliseconds: 3500), () {
        if (mounted) {
          setState(() {
            _highlightedSection = null;
          });
        }
      });
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _nameFocusNode.dispose();
    _passwordFocusNode.dispose();
    _usernameController.dispose();
    _mobileController.dispose();
    _companyController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
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
    final password = _passwordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (password.isNotEmpty) {
      if (password.length < 4) {
        Fluttertoast.showToast(msg: tr('passwordTooShort'), backgroundColor: AppColors.danger);
        return;
      }
      if (password != confirmPassword) {
        Fluttertoast.showToast(msg: tr('passwordMismatch'), backgroundColor: AppColors.danger);
        return;
      }
    }

    await ref.read(profileProvider.notifier).updateProfile(
      username: _usernameController.text.trim(),
      mobileNo: _mobileController.text.trim(),
      companyName: _companyController.text.trim(),
      qrImage: _qrImage,
      password: password.isNotEmpty ? password : null,
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
          backgroundColor: AppColors.bgMain,
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

    final isQrFocused = _highlightedSection == 'qr';
    final isPasswordFocused = _highlightedSection == 'password';

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      appBar: const RentVedaAppBar(showBackButton: true),
      body: SafeArea(
        child: SingleChildScrollView(
          controller: _scrollController,
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
                // 1. Personal Details Section
                Container(
                  key: _profileKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildInputLabel(tr('nameLabel')),
                      _buildTextField(_usernameController, Icons.person, tr('enterFullName'), focusNode: _nameFocusNode),
                      const SizedBox(height: 20),

                      _buildInputLabel(tr('mobileLabel')),
                      _buildTextField(_mobileController, Icons.phone, tr('enterMobileNumber'), keyboardType: TextInputType.phone),
                      const SizedBox(height: 20),

                      _buildInputLabel(tr('companyNameLabel')),
                      _buildTextField(_companyController, Icons.business, tr('enterCompanyName')),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                const Divider(color: AppColors.border),
                const SizedBox(height: 16),

                // 2. QR Code Upload Section
                AnimatedContainer(
                  key: _qrKey,
                  duration: const Duration(milliseconds: 350),
                  padding: EdgeInsets.all(isQrFocused ? 12 : 0),
                  decoration: BoxDecoration(
                    color: isQrFocused ? const Color(0xFFFEF3C7).withValues(alpha: 0.35) : Colors.transparent,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isQrFocused ? const Color(0xFFF59E0B) : Colors.transparent,
                      width: isQrFocused ? 2 : 0,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.qr_code, color: AppColors.primary, size: 18),
                              const SizedBox(width: 8),
                              _buildInputLabel(tr('paymentQrTitle'), padBottom: false),
                            ],
                          ),
                          if (isQrFocused)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.touch_app, size: 12, color: Colors.white),
                                  const SizedBox(width: 4),
                                  Text(
                                    tr('tapToUploadQr'),
                                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      GestureDetector(
                        onTap: _pickQrCode,
                        child: DottedBorder(
                          options: RoundedRectDottedBorderOptions(
                            color: isQrFocused ? const Color(0xFFF59E0B) : AppColors.border,
                            strokeWidth: 2,
                            dashPattern: const [8, 4],
                            radius: const Radius.circular(16),
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
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                const Divider(color: AppColors.border),
                const SizedBox(height: 16),

                // 3. Password & Security Section
                AnimatedContainer(
                  key: _passwordKey,
                  duration: const Duration(milliseconds: 350),
                  padding: EdgeInsets.all(isPasswordFocused ? 12 : 0),
                  decoration: BoxDecoration(
                    color: isPasswordFocused ? const Color(0xFFFEF3C7).withValues(alpha: 0.35) : Colors.transparent,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isPasswordFocused ? const Color(0xFFF59E0B) : Colors.transparent,
                      width: isPasswordFocused ? 2 : 0,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.shield_outlined, color: AppColors.primary, size: 18),
                              const SizedBox(width: 8),
                              Text(
                                user != null && user['hasPassword'] == true
                                    ? tr('changePassword')
                                    : '${tr('setPassword')} ${tr('optional')}',
                                style: AppTypography.cardHeader.copyWith(fontSize: 14),
                              ),
                            ],
                          ),
                          if (isPasswordFocused)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.edit, size: 12, color: Colors.white),
                                  const SizedBox(width: 4),
                                  Text(
                                    user != null && user['hasPassword'] == true ? tr('changePassword') : tr('setPassword'),
                                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        tr('setPasswordHint'),
                        style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 11),
                      ),
                      const SizedBox(height: 16),

                      _buildInputLabel(user != null && user['hasPassword'] == true ? tr('newPassword') : tr('password')),
                      _buildPasswordField(
                        _passwordController,
                        tr('newPasswordPlaceholder'),
                        _obscurePassword,
                        () => setState(() => _obscurePassword = !_obscurePassword),
                        focusNode: _passwordFocusNode,
                      ),
                      const SizedBox(height: 14),

                      _buildInputLabel(tr('confirm_password')),
                      _buildPasswordField(
                        _confirmPasswordController,
                        tr('confirmPasswordPlaceholder'),
                        _obscureConfirmPassword,
                        () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                      ),
                    ],
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

  Widget _buildTextField(TextEditingController controller, IconData icon, String hint, {TextInputType keyboardType = TextInputType.text, FocusNode? focusNode}) {
    return TextField(
      controller: controller,
      focusNode: focusNode,
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

  Widget _buildPasswordField(TextEditingController controller, String hint, bool obscureText, VoidCallback onToggle, {FocusNode? focusNode}) {
    return TextField(
      controller: controller,
      focusNode: focusNode,
      obscureText: obscureText,
      style: AppTypography.bodyMain.copyWith(fontSize: 13, fontWeight: FontWeight.w600),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: AppTypography.bodySecondary,
        prefixIcon: const Icon(Icons.lock_outline, color: AppColors.textSubtle, size: 16),
        suffixIcon: GestureDetector(
          onTap: onToggle,
          child: Icon(
            obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
            color: AppColors.textSubtle,
            size: 18,
          ),
        ),
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
