import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../providers/profile_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(profileProvider.notifier).fetchProfile();
    });
  }

  void _showLogoutConfirm() {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.bgSurface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(tr('logoutButton'), style: AppTypography.cardHeader),
          content: Text(tr('confirmLogout'), style: AppTypography.bodyMain),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(tr('cancelButton'), style: AppTypography.buttonText.copyWith(color: AppColors.textSubtle)),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(dialogContext);
                await ref.read(profileProvider.notifier).logout();
                if (!mounted) return;
                context.go('/login');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.danger,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text(tr('logoutButton')),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    final user = profileState.userData;

    if (profileState.isLoading && user == null) {
      return const Scaffold(
        backgroundColor: AppColors.bgMain,
        body: Center(child: CircularProgressIndicator(color: AppColors.primaryGold)),
      );
    }

    if (user == null) {
      return Scaffold(
        backgroundColor: AppColors.bgMain,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(tr('fetchProfileFailed'), style: AppTypography.bodyMain),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.read(profileProvider.notifier).fetchProfile(),
                child: const Text("Retry"),
              )
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // HEADER
              Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                width: double.infinity,
                child: Text(
                  tr('profileTitle'),
                  textAlign: TextAlign.center,
                  style: AppTypography.caption.copyWith(
                    fontWeight: FontWeight.w800,
                    letterSpacing: 2.0,
                  ),
                ),
              ),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  children: [
                    // HERO SECTION
                    const SizedBox(height: 24),
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primaryGold.withValues(alpha: 0.1),
                          ),
                        ),
                        Container(
                          width: 110,
                          height: 110,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: [Color(0xFFF5F5F5), Color(0xFFE0E0E0)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            border: Border.all(color: AppColors.bgMain, width: 4),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primaryGold.withValues(alpha: 0.2),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.person, size: 70, color: AppColors.primaryGold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user['username'] ?? 'User',
                      style: AppTypography.screenHeader.copyWith(fontSize: 24),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGold,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primaryGold.withValues(alpha: 0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Text(
                        tr('businessOwner'),
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textMain,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),

                    // USER DETAILS
                    _buildDetailRow(Icons.phone, tr('mobile'), "+91 ${user['mobileNo'] ?? ''}"),
                    const SizedBox(height: 24),
                    _buildDetailRow(Icons.email, tr('email'), user['email'] ?? ''),
                    const SizedBox(height: 24),
                    _buildDetailRow(Icons.business, tr('company'), user['companyName'] ?? ''),
                    const SizedBox(height: 32),

                    // SETTINGS MENU
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.bgSurface,
                        borderRadius: BorderRadius.circular(32),
                        border: Border.all(color: AppColors.border),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        children: [
                          // QR Code Card
                          GestureDetector(
                            onTap: () => context.push('/edit-profile'),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFFDF0),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppColors.primaryGold.withValues(alpha: 0.4)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: AppColors.border),
                                    ),
                                    child: const Icon(Icons.qr_code_2, color: Color(0xFF795900)),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Text(
                                              tr('paymentQrTitle'),
                                              style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF1A1C1C)),
                                            ),
                                            const SizedBox(width: 8),
                                            if (user['qrCodeUrl'] == null || user['qrCodeUrl'].isEmpty)
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: Colors.amber.shade100,
                                                  borderRadius: BorderRadius.circular(12),
                                                  border: Border.all(color: Colors.amber.shade300),
                                                ),
                                                child: Text(
                                                  tr('missingQrBadge'),
                                                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.amber, height: 1.1),
                                                ),
                                              )
                                          ],
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          user['qrCodeUrl'] != null && user['qrCodeUrl'].isNotEmpty
                                              ? tr('tapToUpdateQr')
                                              : tr('tapToUploadQr'),
                                          style: const TextStyle(fontSize: 10, color: Color(0xFF4F4633), fontWeight: FontWeight.w500),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    width: 48,
                                    height: 48,
                                    padding: const EdgeInsets.all(2),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: AppColors.border),
                                    ),
                                    child: user['qrCodeUrl'] != null && user['qrCodeUrl'].isNotEmpty
                                        ? ClipRRect(
                                            borderRadius: BorderRadius.circular(10),
                                            child: Image.network(user['qrCodeUrl'], fit: BoxFit.cover),
                                          )
                                        : const Center(
                                            child: Text("ADD", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF795900))),
                                          ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          _buildMenuItem(Icons.settings, tr('editProfileButton'), () => context.push('/edit-profile')),
                          _buildMenuItem(Icons.edit_note, tr('updateMachineryButton'), () {
                            context.push('/update-machinery');
                          }),
                          _buildMenuItem(Icons.support_agent, tr('contactSupport'), () {
                            context.push('/contact');
                          }, iconColor: Colors.green),
                          _buildMenuItem(Icons.info_outline, tr('aboutUs'), () {
                            context.push('/about');
                          }, iconColor: Colors.purple),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // LOGOUT
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _showLogoutConfirm,
                        icon: const Icon(Icons.logout, size: 18),
                        label: Text(tr('logoutButton'), style: AppTypography.buttonText.copyWith(fontSize: 14)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red.shade50,
                          foregroundColor: AppColors.danger,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(color: Colors.red.shade100),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textSubtle),
        const SizedBox(width: 20),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label.toUpperCase(), style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(value, style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildMenuItem(IconData icon, String label, VoidCallback onTap, {Color iconColor = AppColors.textSubtle}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Icon(icon, size: 20, color: iconColor),
            const SizedBox(width: 16),
            Expanded(
              child: Text(label, style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold)),
            ),
            const Icon(Icons.chevron_right, size: 16, color: AppColors.textSubtle),
          ],
        ),
      ),
    );
  }
}
