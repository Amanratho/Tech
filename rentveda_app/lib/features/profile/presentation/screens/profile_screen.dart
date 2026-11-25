import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/services/notification_service.dart';
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
      if (mounted) {
        ref.read(profileProvider.notifier).fetchProfile();
      }
    });
  }

  void _showLanguageBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: AppColors.bgSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (bottomSheetContext) {
        return Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.75,
          ),
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                tr('changeLanguage'),
                style: AppTypography.cardHeader.copyWith(fontSize: 20),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Flexible(
                child: SingleChildScrollView(
                  child: Wrap(
                    spacing: 16,
                    runSpacing: 16,
                    children: [
                      _buildLangBox(context, bottomSheetContext, 'english', 'ENG', 'en'),
                      _buildLangBox(context, bottomSheetContext, 'hindi', 'HI', 'hi'),
                      _buildLangBox(context, bottomSheetContext, 'marathi', 'MR', 'mr'),
                      _buildLangBox(context, bottomSheetContext, 'gujarati', 'GU', 'gu'),
                      _buildLangBox(context, bottomSheetContext, 'punjabi', 'PA', 'pa'),
                      _buildLangBox(context, bottomSheetContext, 'tamil', 'TA', 'ta'),
                      _buildLangBox(context, bottomSheetContext, 'telugu', 'TE', 'te'),
                      _buildLangBox(context, bottomSheetContext, 'kannada', 'KN', 'kn'),
                      _buildLangBox(context, bottomSheetContext, 'bengali', 'BN', 'bn'),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }


  Widget _buildLangBox(BuildContext context, BuildContext bottomSheetContext, String key, String subtitle, String code) {
    return SizedBox(
      width: (MediaQuery.of(context).size.width - 48 - 32) / 3,
      child: _LanguageBox(
        title: tr(key),
        subtitle: subtitle,
        isSelected: context.locale.languageCode == code,
        onTap: () {
          context.setLocale(Locale(code));
          NotificationService().syncLanguage(code);
          Navigator.pop(bottomSheetContext);
        },
      ),
    );
  }

  void _showLogoutConfirm() {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return Dialog(
          backgroundColor: AppColors.bgSurface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.logout, color: AppColors.danger, size: 32),
                ),
                const SizedBox(height: 20),
                Text(
                  tr('logoutButton'),
                  style: AppTypography.cardHeader.copyWith(fontSize: 20),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  tr('confirmLogout'),
                  style: AppTypography.bodyMain.copyWith(color: AppColors.textSubtle),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    ElevatedButton(
                      onPressed: () async {
                        Navigator.pop(dialogContext);
                        await ref.read(profileProvider.notifier).logout();
                        if (!mounted) return;
                        context.go('/login');
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: AppColors.danger,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(tr('logoutButton'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => Navigator.pop(dialogContext),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(tr('cancelButton'), style: TextStyle(color: AppColors.textSubtle, fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ],
                ),
              ],
            ),
          ),
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
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
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
                child: Text(tr('retryBtn')),
              )
            ],
          ),
        ),
      );
    }

    final mobileNo = (user['mobileNo'] ?? '').toString().trim();
    final email = (user['email'] ?? '').toString().toLowerCase().trim();
    final isAdmin = user['isAdmin'] == true ||
        user['role'] == 'admin' ||
        mobileNo == '9109124564' ||
        mobileNo == '9876543210' ||
        email == 'amanrathod407@gmail.com';

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // HEADER
              Container(
                color: Colors.white.withValues(alpha: 0.8),
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
                        // Glow Effect
                        Container(
                          width: 160,
                          height: 160,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primary.withValues(alpha: 0.1),
                            boxShadow: [
                              BoxShadow(color: AppColors.primary.withValues(alpha: 0.2), blurRadius: 40, spreadRadius: 10),
                            ],
                          ),
                        ),
                        // Avatar Circle
                        Container(
                          width: 112, // w-28
                          height: 112, // h-28
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: [Color(0xFFF3F4F6), Color(0xFFE5E7EB)], // gray-100 to gray-200
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            border: Border.all(color: AppColors.bgMain, width: 4), // ring-4 ring-[var(--bg-main)]
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.account_circle, size: 80, color: AppColors.primary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Text(
                      user['username'] ?? 'User',
                      style: AppTypography.screenHeader.copyWith(fontSize: 24, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Text(
                        tr('businessOwner').toUpperCase(),
                        style: AppTypography.caption.copyWith(
                          color: Colors.black,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                          fontSize: 10,
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),

                    // USER DETAILS
                    _buildDetailRow(Icons.phone, tr('mobileLabel'), "+91 ${user['mobileNo'] ?? ''}"),
                    if (user['email'] != null &&
                        user['email'].toString().isNotEmpty &&
                        !user['email'].toString().endsWith('@rentveda.app')) ...[
                      const SizedBox(height: 24),
                      _buildDetailRow(Icons.email, tr('email'), user['email'] ?? ''),
                    ],
                    if (user['companyName'] != null &&
                        user['companyName'].toString().isNotEmpty) ...[
                      const SizedBox(height: 24),
                      _buildDetailRow(Icons.business, tr('companyNameLabel'), user['companyName'] ?? ''),
                    ],
                    const SizedBox(height: 40),

                    // SETTINGS MENU
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(32),
                        border: Border.all(color: AppColors.border),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 16,
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
                                border: Border.all(color: const Color(0xFFFBC02D).withValues(alpha: 0.4)),
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
                                      boxShadow: [
                                        BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4),
                                      ],
                                    ),
                                    child: const Icon(Icons.qr_code_2, color: Color(0xFF795900), size: 22),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Wrap(
                                          crossAxisAlignment: WrapCrossAlignment.center,
                                          spacing: 6,
                                          runSpacing: 2,
                                          children: [
                                            Text(
                                              tr('paymentQrTitle'),
                                              style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold, color: const Color(0xFF1A1C1C), fontSize: 13),
                                            ),
                                            if (user['qrCodeUrl'] == null || user['qrCodeUrl'].isEmpty)
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: Colors.amber.shade100,
                                                  borderRadius: BorderRadius.circular(8),
                                                  border: Border.all(color: Colors.amber.shade300),
                                                ),
                                                child: Text(
                                                  tr('missingQrBadge'),
                                                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.amber, height: 1.1),
                                                ),
                                              ),
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
                                      boxShadow: [
                                        BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4),
                                      ],
                                    ),
                                    child: user['qrCodeUrl'] != null && user['qrCodeUrl'].isNotEmpty
                                        ? ClipRRect(
                                            borderRadius: BorderRadius.circular(10),
                                            child: Image.network(user['qrCodeUrl'], fit: BoxFit.cover),
                                          )
                                        : Center(
                                            child: Text(tr('addBtn'), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF795900))),
                                          ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          if (isAdmin) ...[
                            _buildAdminConsoleCard(context),
                            const SizedBox(height: 12),
                          ],
                          _buildMenuItem(Icons.settings, tr('editProfileButton'), () => context.push('/edit-profile'), iconColor: AppColors.textSubtle),
                          _buildMenuItem(
                            Icons.lock_outline,
                            user['hasPassword'] == true ? tr('changePassword') : tr('setPassword'),
                            () => context.push('/edit-profile'),
                            iconColor: Colors.teal.shade600,
                          ),
                          _buildMenuItem(Icons.edit_note, tr('updateMachineryButton'), () => context.push('/update-machinery'), iconColor: Colors.blue.shade500),
                          _buildMenuItem(Icons.language, tr('changeLanguage'), _showLanguageBottomSheet, iconColor: Colors.orange.shade500),
                          _buildMenuItem(Icons.support_agent, tr('contactSupport'), () => context.push('/contact'), iconColor: Colors.green.shade500),
                          _buildMenuItem(Icons.info_outline, tr('aboutUs'), () => context.push('/about'), iconColor: Colors.purple.shade500),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // LOGOUT
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                         onPressed: _showLogoutConfirm,
                        icon: const Icon(Icons.logout, size: 14),
                        label: Text(tr('logoutButton'), style: AppTypography.buttonText.copyWith(fontSize: 12, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFEF2F2), // red-50
                          foregroundColor: const Color(0xFFDC2626), // red-600
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: const BorderSide(color: Color(0xFFFECACA)), // red-200
                          ),
                          shadowColor: Colors.transparent,
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
        Icon(icon, size: 16, color: AppColors.textSubtle),
        const SizedBox(width: 20),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label.toUpperCase(), style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, fontSize: 10, letterSpacing: 1.0)),
              const SizedBox(height: 2),
              Text(value, style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600, fontSize: 16, letterSpacing: 0.5), maxLines: 1, overflow: TextOverflow.ellipsis),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildAdminConsoleCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.push('/admin-dashboard'),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
                  ),
                  child: const Center(
                    child: Text('👑', style: TextStyle(fontSize: 20)),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'Admin Console',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'OWNER',
                              style: TextStyle(
                                color: Colors.black,
                                fontSize: 9,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'यूज़र्स, मशीनें और सब्सक्रिप्शन कंट्रोल',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.primary),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String label, VoidCallback onTap, {Color iconColor = AppColors.textSubtle}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
        child: Row(
          children: [
            Icon(icon, size: 18, color: iconColor),
            const SizedBox(width: 16),
            Expanded(
              child: Text(label, style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.bold, fontSize: 14, letterSpacing: 0.5)),
            ),
            const Icon(Icons.chevron_right, size: 12, color: AppColors.textSubtle),
          ],
        ),
      ),
    );
  }
}

class _LanguageBox extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  const _LanguageBox({
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withValues(alpha: 0.1) : AppColors.bgSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.1),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
          ],
        ),
        child: Column(
          children: [
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: isSelected ? AppColors.primary : AppColors.textSubtle,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: AppColors.textMain,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
