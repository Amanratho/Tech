import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:phone_email_auth/phone_email_auth.dart';
import '../../providers/auth_provider.dart';
import '../../../../core/services/notification_service.dart';

class WelcomeScreen extends ConsumerStatefulWidget {
  const WelcomeScreen({super.key});

  @override
  ConsumerState<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends ConsumerState<WelcomeScreen> {
  // Controllers
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _usernameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _companyController = TextEditingController();
  final _otpController = TextEditingController();

  // State variables
  String _view = 'welcome'; // 'welcome', 'login', 'createAccount', 'emailLogin', 'forgotPassword'
  bool _loginWithOtp = true; // true: OTP login, false: Password login
  bool _otpSent = false;
  bool _obscurePassword = true;
  bool _isEmailSent = false; // for forgot password success view

  // Colors matching App theme
  static const Color primaryColor = Color(0xFFFFCC00);
  static const Color primaryDark = Color(0xFFE6B800);
  static const Color bgMain = Color(0xFFF8F9FA);
  static const Color textMain = Color(0xFF1E1E1E);
  static const Color textMuted = Color(0xFF6B7280); // higher contrast for readability
  static const Color borderColor = Color(0xFFE5E7EB);

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _usernameController.dispose();
    _mobileController.dispose();
    _companyController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _showToast(String message, {bool isError = false}) {
    Fluttertoast.showToast(
      msg: message,
      backgroundColor: isError ? Colors.red : Colors.green,
      textColor: Colors.white,
      toastLength: Toast.LENGTH_LONG,
    );
  }

  void _navigateAfterAuth() {
    final pending = NotificationService.consumePendingRoute();
    if (pending != null && pending.isNotEmpty) {
      context.go(pending);
    } else {
      context.go('/home');
    }
  }

  // ─── Labeled Input field builder with clear title above box ───
  Widget _buildLabeledInput({
    required String label,
    required TextEditingController controller,
    required String placeholder,
    required IconData icon,
    bool isPhone = false,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    Widget? suffixIcon,
    bool enabled = true,
    int? maxLength,
    bool centerText = false,
    double letterSpacing = 0,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: textMain,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: bgMain,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: borderColor),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            obscureText: obscureText,
            enabled: enabled,
            maxLength: maxLength,
            textAlign: centerText ? TextAlign.center : TextAlign.start,
            style: GoogleFonts.inter(
              fontSize: 14,
              color: textMain,
              letterSpacing: letterSpacing,
              fontWeight: FontWeight.w600,
            ),
            decoration: InputDecoration(
              hintText: placeholder,
              hintStyle: GoogleFonts.inter(
                fontSize: 13,
                color: textMuted.withValues(alpha: 0.7),
                fontWeight: FontWeight.normal,
                letterSpacing: 0,
              ),
              prefixIcon: isPhone
                  ? Container(
                      padding: const EdgeInsets.only(left: 14, right: 10),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(icon, size: 18, color: textMuted),
                          const SizedBox(width: 8),
                          Text(
                            '+91',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: textMain,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(height: 18, width: 1, color: borderColor),
                        ],
                      ),
                    )
                  : Icon(icon, size: 18, color: textMuted),
              prefixIconConstraints: isPhone ? const BoxConstraints(minWidth: 0, minHeight: 0) : null,
              suffixIcon: suffixIcon,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              counterText: '',
            ),
          ),
        ),
      ],
    );
  }

  // ─── Primary button ───
  Widget _buildPrimaryButton({
    required String text,
    required VoidCallback? onPressed,
    bool isLoading = false,
  }) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.black,
          elevation: 3,
          shadowColor: primaryColor.withValues(alpha: 0.3),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
              )
            : Text(text, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700)),
      ),
    );
  }

  // ─── Outlined button ───
  Widget _buildOutlinedButton({
    required String text,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: textMain,
          side: const BorderSide(color: borderColor),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: Text(text, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700)),
      ),
    );
  }

  // ─── Header with back arrow ───
  Widget _buildHeader(String title, VoidCallback onBack) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
        children: [
          GestureDetector(
            onTap: onBack,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: bgMain,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: borderColor),
              ),
              child: const Icon(Icons.arrow_back, size: 18, color: textMain),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: textMain),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Phone.Email (Sign in with Phone) Button ───
  Widget _buildPhoneEmailButton(AuthNotifier authNotifier) {
    return Column(
      children: [
        Row(
          children: [
            const Expanded(child: Divider(color: borderColor)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(
                'OR',
                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: textMuted),
              ),
            ),
            const Expanded(child: Divider(color: borderColor)),
          ],
        ),
        const SizedBox(height: 14),
        PhoneLoginButton(
          borderRadius: 12,
          buttonColor: const Color(0xFF0F9D58),
          label: 'Sign in with Phone (Free OTP)',
          onSuccess: (String accessToken, String jwtToken) async {
            if (accessToken.isNotEmpty) {
              final success = await authNotifier.loginWithPhoneEmail(accessToken: accessToken);
              if (success && mounted) {
                _showToast(tr('successMessage'));
                _navigateAfterAuth();
              }
            }
          },
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  VIEW: WELCOME SCREEN
  // ═══════════════════════════════════════════════════════════════
  Widget _buildWelcomeView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // App Logo
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            image: const DecorationImage(
              image: AssetImage('assets/images/rentVedaIcon.png'),
              fit: BoxFit.cover,
            ),
            boxShadow: [
              BoxShadow(
                color: primaryColor.withValues(alpha: 0.3),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Text(
          tr('welcomeTitle'),
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(fontSize: 26, fontWeight: FontWeight.w800, color: textMain),
        ),
        const SizedBox(height: 8),
        Text(
          tr('manageMachinery'),
          style: GoogleFonts.inter(fontSize: 14, color: textMuted),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 36),
        _buildPrimaryButton(
          text: tr('login'),
          onPressed: () => setState(() {
            _view = 'login';
            _otpSent = false;
          }),
        ),
        const SizedBox(height: 12),
        _buildOutlinedButton(
          text: tr('create_account'),
          onPressed: () => setState(() {
            _view = 'createAccount';
            _otpSent = false;
          }),
        ),
        const SizedBox(height: 20),
        _buildPhoneEmailButton(ref.read(authProvider.notifier)),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  VIEW: MOBILE LOGIN (OTP or Password)
  // ═══════════════════════════════════════════════════════════════
  Widget _buildLoginView(AuthState authState) {
    final authNotifier = ref.read(authProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildHeader(tr('login'), () {
          setState(() {
            _view = 'welcome';
            _otpSent = false;
          });
        }),

        Text(
          _loginWithOtp ? tr('loginWithOtpTitle') : tr('loginWithPasswordTitle'),
          style: GoogleFonts.inter(fontSize: 13, color: textMuted),
        ),
        const SizedBox(height: 16),

        // Mobile Number Field with clear label
        _buildLabeledInput(
          label: tr('mobileLabel'),
          controller: _mobileController,
          placeholder: tr('mobilePlaceholder'),
          icon: Icons.phone_outlined,
          isPhone: true,
          keyboardType: TextInputType.phone,
          maxLength: 10,
          enabled: !_otpSent,
        ),
        const SizedBox(height: 16),

        // OTP Flow vs Password Flow
        if (_loginWithOtp) ...[
          if (_otpSent) ...[
            // Helper message
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.sms_outlined, size: 18, color: Colors.orange),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${tr('otpSentTo')} +91 ${_mobileController.text.trim()}',
                      style: GoogleFonts.inter(fontSize: 12, color: Colors.black87),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // OTP Input
            _buildLabeledInput(
              label: tr('verify_otp'),
              controller: _otpController,
              placeholder: tr('enter4DigitOtp'),
              icon: Icons.lock_clock_outlined,
              keyboardType: TextInputType.number,
              maxLength: 6,
              centerText: true,
              letterSpacing: 6,
            ),
            const SizedBox(height: 16),

            // Verify & Login Button
            _buildPrimaryButton(
              text: tr('verifyAndLogin'),
              isLoading: authState.isLoading,
              onPressed: () async {
                final otp = _otpController.text.trim();
                final mobile = _mobileController.text.trim();
                if (otp.isEmpty) {
                  _showToast(tr('pleaseEnterOtp'), isError: true);
                  return;
                }

                // Verify OTP first
                final isOtpValid = await authNotifier.verifyOtp(mobile, otp);
                if (!isOtpValid) {
                  _showToast(tr('invalid_otp'), isError: true);
                  return;
                }

                // Perform Login
                final success = await authNotifier.loginWithPhone(mobileNo: mobile, otp: otp);
                if (success && mounted) {
                  _showToast(tr('successMessage'));
                  _navigateAfterAuth();
                }
              },
            ),
            const SizedBox(height: 12),

            // Resend / Change Number
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                  onTap: () => setState(() {
                    _otpSent = false;
                    _otpController.clear();
                  }),
                  child: Text(
                    tr('changeNumber'),
                    style: GoogleFonts.inter(fontSize: 12, color: primaryDark, fontWeight: FontWeight.w700),
                  ),
                ),
                GestureDetector(
                  onTap: () async {
                    final mobile = _mobileController.text.trim();
                    await authNotifier.sendOtp(mobile);
                    _showToast(tr('otpSentSuccess'));
                  },
                  child: Text(
                    tr('resendOtp'),
                    style: GoogleFonts.inter(fontSize: 12, color: textMuted, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ] else ...[
            // Get OTP Button
            _buildPrimaryButton(
              text: tr('getOtp'),
              isLoading: authState.isLoading,
              onPressed: () async {
                final mobile = _mobileController.text.trim();
                if (mobile.length != 10) {
                  _showToast(tr('pleaseEnterMobile'), isError: true);
                  return;
                }
                final success = await authNotifier.sendOtp(mobile);
                if (success && mounted) {
                  setState(() => _otpSent = true);
                  _showToast(tr('otpSentSuccess'));
                }
              },
            ),
          ],

          const SizedBox(height: 16),
          // Switch to Password login
          Center(
            child: GestureDetector(
              onTap: () => setState(() => _loginWithOtp = false),
              child: Text(
                tr('loginWithPasswordInstead'),
                style: GoogleFonts.inter(fontSize: 13, color: primaryDark, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ] else ...[
          // Password Input Field
          _buildLabeledInput(
            label: tr('password'),
            controller: _passwordController,
            placeholder: tr('passwordPlaceholder'),
            icon: Icons.lock_outline,
            obscureText: _obscurePassword,
            suffixIcon: GestureDetector(
              onTap: () => setState(() => _obscurePassword = !_obscurePassword),
              child: Icon(
                _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                size: 18,
                color: textMuted,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Login with Password Button
          _buildPrimaryButton(
            text: tr('login'),
            isLoading: authState.isLoading,
            onPressed: () async {
              final mobile = _mobileController.text.trim();
              final password = _passwordController.text;
              if (mobile.length != 10) {
                _showToast(tr('pleaseEnterMobile'), isError: true);
                return;
              }
              if (password.isEmpty) {
                _showToast(tr('passwordPlaceholder'), isError: true);
                return;
              }
              final success = await authNotifier.loginWithPhone(
                mobileNo: mobile,
                password: password,
              );
              if (success && mounted) {
                _showToast(tr('successMessage'));
                _navigateAfterAuth();
              }
            },
          ),
          const SizedBox(height: 16),

          // Switch back to OTP
          Center(
            child: GestureDetector(
              onTap: () => setState(() => _loginWithOtp = true),
              child: Text(
                tr('loginWithOtpInstead'),
                style: GoogleFonts.inter(fontSize: 13, color: primaryDark, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],

        const SizedBox(height: 16),
        _buildPhoneEmailButton(authNotifier),

        const SizedBox(height: 20),
        const Divider(color: borderColor),
        const SizedBox(height: 12),

        // Bottom alternatives: Email login & Create Account
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            GestureDetector(
              onTap: () => setState(() {
                _view = 'emailLogin';
                _otpSent = false;
              }),
              child: Text(
                tr('loginWithEmail'),
                style: GoogleFonts.inter(fontSize: 12, color: textMuted),
              ),
            ),
            GestureDetector(
              onTap: () => setState(() {
                _view = 'createAccount';
                _otpSent = false;
              }),
              child: Text(
                tr('dontHaveAccount'),
                style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: primaryDark),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  VIEW: CREATE ACCOUNT (Mobile First + 90 Days Free Trial)
  // ═══════════════════════════════════════════════════════════════
  Widget _buildCreateAccountView(AuthState authState) {
    final authNotifier = ref.read(authProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildHeader(tr('create_account'), () => setState(() {
          _view = 'welcome';
          _otpSent = false;
        })),

        // Free trial banner
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.green.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.green.withValues(alpha: 0.2)),
          ),
          child: Row(
            children: [
              const Icon(Icons.card_giftcard, size: 16, color: Colors.green),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  tr('freeTrialBanner'),
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.green[800]),
                ),
              ),
            ],
          ),
        ),

        // Name
        _buildLabeledInput(
          label: tr('nameLabel'),
          controller: _usernameController,
          placeholder: tr('namePlaceholder'),
          icon: Icons.person_outline,
          enabled: !_otpSent,
        ),
        const SizedBox(height: 12),

        // Mobile No.
        _buildLabeledInput(
          label: tr('mobileLabel'),
          controller: _mobileController,
          placeholder: tr('mobilePlaceholder'),
          icon: Icons.phone_outlined,
          isPhone: true,
          keyboardType: TextInputType.phone,
          maxLength: 10,
          enabled: !_otpSent,
        ),
        const SizedBox(height: 12),

        // Company Name (Optional)
        _buildLabeledInput(
          label: '${tr('companyNameLabel')} ${tr('optional')}',
          controller: _companyController,
          placeholder: tr('companyPlaceholder'),
          icon: Icons.business_outlined,
          enabled: !_otpSent,
        ),
        const SizedBox(height: 16),

        if (_otpSent) ...[
          // Helper message
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.amber.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.sms_outlined, size: 18, color: Colors.orange),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${tr('otpSentTo')} +91 ${_mobileController.text.trim()}',
                    style: GoogleFonts.inter(fontSize: 12, color: Colors.black87),
                  ),
                ),
              ],
            ),
          ),

          // OTP input
          _buildLabeledInput(
            label: tr('verify_otp'),
            controller: _otpController,
            placeholder: tr('enter4DigitOtp'),
            icon: Icons.lock_clock_outlined,
            keyboardType: TextInputType.number,
            maxLength: 6,
            centerText: true,
            letterSpacing: 6,
          ),
          const SizedBox(height: 16),

          // Submit & Register
          _buildPrimaryButton(
            text: tr('verifyAndActivate'),
            isLoading: authState.isLoading,
            onPressed: () async {
              final otp = _otpController.text.trim();
              final mobile = _mobileController.text.trim();
              final name = _usernameController.text.trim();

              if (otp.isEmpty) {
                _showToast(tr('pleaseEnterOtp'), isError: true);
                return;
              }

              // Verify OTP
              final isOtpValid = await authNotifier.verifyOtp(mobile, otp);
              if (!isOtpValid) {
                _showToast(tr('invalid_otp'), isError: true);
                return;
              }

              // Complete signup
              final success = await authNotifier.signupWithPhone(
                mobileNo: mobile,
                username: name,
                companyName: _companyController.text.trim(),
                password: '',
                otp: otp,
              );

              if (success && mounted) {
                _showToast(tr('accountCreatedSuccess'));
                _navigateAfterAuth();
              }
            },
          ),
          const SizedBox(height: 12),
          Center(
            child: GestureDetector(
              onTap: () => setState(() => _otpSent = false),
              child: Text(
                tr('changeNumber'),
                style: GoogleFonts.inter(fontSize: 12, color: primaryDark, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ] else ...[
          _buildPrimaryButton(
            text: tr('getOtpAndRegister'),
            isLoading: authState.isLoading,
            onPressed: () async {
              final name = _usernameController.text.trim();
              final mobile = _mobileController.text.trim();

              if (name.isEmpty) {
                _showToast(tr('pleaseEnterName'), isError: true);
                return;
              }
              if (mobile.length != 10) {
                _showToast(tr('pleaseEnterMobile'), isError: true);
                return;
              }

              final success = await authNotifier.sendOtp(mobile);
              if (success && mounted) {
                setState(() => _otpSent = true);
                _showToast(tr('otpSentSuccess'));
              }
            },
          ),
        ],

        if (!_otpSent) ...[
          const SizedBox(height: 16),
          _buildPhoneEmailButton(authNotifier),
        ],

        const SizedBox(height: 20),
        Center(
          child: GestureDetector(
            onTap: () => setState(() {
              _view = 'login';
              _otpSent = false;
            }),
            child: Text(
              tr('alreadyHaveAccount'),
              style: GoogleFonts.inter(fontSize: 13, color: textMuted, fontWeight: FontWeight.w600),
            ),
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  VIEW: EMAIL LOGIN (Legacy Fallback)
  // ═══════════════════════════════════════════════════════════════
  Widget _buildEmailLoginView(AuthState authState) {
    final authNotifier = ref.read(authProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildHeader(tr('loginWithEmail'), () => setState(() => _view = 'login')),

        _buildLabeledInput(
          label: tr('email'),
          controller: _emailController,
          placeholder: tr('email'),
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),

        _buildLabeledInput(
          label: tr('password'),
          controller: _passwordController,
          placeholder: tr('passwordPlaceholder'),
          icon: Icons.lock_outline,
          obscureText: _obscurePassword,
          suffixIcon: GestureDetector(
            onTap: () => setState(() => _obscurePassword = !_obscurePassword),
            child: Icon(
              _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              size: 18,
              color: textMuted,
            ),
          ),
        ),
        const SizedBox(height: 8),

        Align(
          alignment: Alignment.centerRight,
          child: GestureDetector(
            onTap: () => setState(() {
              _view = 'forgotPassword';
              _isEmailSent = false;
            }),
            child: Text(
              tr('forgot_password'),
              style: GoogleFonts.inter(fontSize: 12, color: textMuted),
            ),
          ),
        ),
        const SizedBox(height: 16),

        _buildPrimaryButton(
          text: tr('login'),
          isLoading: authState.isLoading,
          onPressed: () async {
            if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
              _showToast(tr('fillAllFields'), isError: true);
              return;
            }
            final success = await authNotifier.login(
              _emailController.text,
              _passwordController.text,
            );
            if (success && mounted) {
              _showToast(tr('successMessage'));
              _navigateAfterAuth();
            }
          },
        ),

        const SizedBox(height: 16),
        Center(
          child: GestureDetector(
            onTap: () => setState(() => _view = 'login'),
            child: Text(
              tr('backToMobileLogin'),
              style: GoogleFonts.inter(fontSize: 13, color: primaryDark, fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  VIEW: FORGOT PASSWORD
  // ═══════════════════════════════════════════════════════════════
  Widget _buildForgotPasswordView(AuthState authState) {
    final authNotifier = ref.read(authProvider.notifier);

    if (_isEmailSent) {
      return Column(
        children: [
          _buildHeader(tr('Check Inbox'), () {
            setState(() {
              _view = 'login';
              _isEmailSent = false;
            });
          }),
          const SizedBox(height: 16),
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: Colors.green.withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.green.withValues(alpha: 0.2)),
            ),
            child: const Icon(Icons.check_circle, size: 32, color: Colors.green),
          ),
          const SizedBox(height: 16),
          Text(
            tr('Check Inbox'),
            style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800, color: textMain),
          ),
          const SizedBox(height: 12),
          RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              style: GoogleFonts.inter(fontSize: 14, color: textMuted, height: 1.5),
              children: [
                TextSpan(text: '${tr('emailSentMsg1')}\n'),
                TextSpan(
                  text: _emailController.text,
                  style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: textMain),
                ),
                TextSpan(text: '\n${tr('emailSentMsg2')}'),
              ],
            ),
          ),
          const SizedBox(height: 32),
          _buildPrimaryButton(
            text: tr('backToLogin'),
            onPressed: () => setState(() {
              _view = 'login';
              _isEmailSent = false;
            }),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildHeader(
          tr('resetPassword'),
          () => setState(() {
            _view = 'login';
            _isEmailSent = false;
          }),
        ),
        Text(
          tr('forgotPasswordDesc'),
          style: GoogleFonts.inter(fontSize: 12, color: textMuted, height: 1.5),
        ),
        const SizedBox(height: 20),
        _buildLabeledInput(
          label: tr('email'),
          controller: _emailController,
          placeholder: tr('enterYourEmail'),
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 20),
        _buildOutlinedButton(
          text: tr('sendResetLink'),
          onPressed: () async {
            if (_emailController.text.isEmpty) {
              _showToast(tr('enterYourEmail'), isError: true);
              return;
            }
            final success = await authNotifier.forgotPassword(_emailController.text);
            if (!mounted) return;
            if (success) {
              setState(() => _isEmailSent = true);
              _showToast(tr('linkSentSuccess'));
            }
          },
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MAIN BUILD
  // ═══════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    // Listen for errors from provider
    ref.listen<AuthState>(authProvider, (previous, next) {
      if (next.error != null && next.error != previous?.error) {
        _showToast(next.error!, isError: true);
      }
    });

    Widget currentView;
    if (_view == 'welcome') {
      currentView = _buildWelcomeView();
    } else if (_view == 'login') {
      currentView = _buildLoginView(authState);
    } else if (_view == 'createAccount') {
      currentView = _buildCreateAccountView(authState);
    } else if (_view == 'emailLogin') {
      currentView = _buildEmailLoginView(authState);
    } else if (_view == 'forgotPassword') {
      currentView = _buildForgotPasswordView(authState);
    } else {
      currentView = _buildWelcomeView();
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Background decor circles
            Positioned(
              top: MediaQuery.of(context).size.height * 0.25,
              left: MediaQuery.of(context).size.width * 0.1,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: primaryColor.withValues(alpha: 0.08),
                ),
              ),
            ),
            Positioned(
              bottom: MediaQuery.of(context).size.height * 0.2,
              right: MediaQuery.of(context).size.width * 0.1,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.blue.withValues(alpha: 0.06),
                ),
              ),
            ),

            // Main content box
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 400),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: borderColor),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 32,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 250),
                    child: currentView,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
