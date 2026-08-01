import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../providers/auth_provider.dart';

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

  // State variables matching React's useState
  String _view = 'welcome'; // welcome, createAccount, login, forgotPassword
  bool _obscurePassword = true;
  bool _isEmailSent = false; // for forgot password success view

  // Colors matching React CSS variables
  static const Color primaryColor = Color(0xFFFFCC00);
  static const Color primaryDark = Color(0xFFE6B800);
  static const Color bgMain = Color(0xFFF8F9FA);
  static const Color textMain = Color(0xFF1E1E1E);
  static const Color textMuted = Color(0xFF9CA3AF);
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

  // ─── Input field builder (matching React's rounded-xl style with icon) ───
  Widget _buildInputField({
    required TextEditingController controller,
    required String placeholder,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    Widget? suffixIcon,
    bool enabled = true,
    int? maxLength,
    bool centerText = false,
    double letterSpacing = 0,
  }) {
    return Container(
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
          fontWeight: letterSpacing > 0 ? FontWeight.bold : FontWeight.normal,
        ),
        decoration: InputDecoration(
          hintText: placeholder,
          hintStyle: GoogleFonts.inter(fontSize: 14, color: textMuted),
          prefixIcon: Icon(icon, size: 16, color: textMuted),
          suffixIcon: suffixIcon,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
          counterText: '', // hide maxLength counter
        ),
      ),
    );
  }

  // ─── Primary button (matching React's yellow rounded-xl) ───
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
          elevation: 4,
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

  // ─── Outlined button (matching React's border style) ───
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

  // ─── Header with back arrow (matching React's flex items-center mb-6) ───
  Widget _buildHeader(String title, VoidCallback onBack) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Row(
        children: [
          GestureDetector(
            onTap: onBack,
            child: const Padding(
              padding: EdgeInsets.all(8),
              child: Icon(Icons.arrow_back, size: 18, color: textMuted),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            title,
            style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: textMain),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  VIEW: WELCOME SCREEN
  // ═══════════════════════════════════════════════════════════════
  Widget _buildWelcomeView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const SizedBox(height: 16),
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w800, color: textMain),
            children: [
              const TextSpan(text: 'Welcome to '),
              TextSpan(text: 'RentVeda', style: TextStyle(color: primaryDark)),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Manage your machinery effortlessly',
          style: GoogleFonts.inter(fontSize: 14, color: textMuted),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),
        _buildPrimaryButton(
          text: 'Create Account',
          onPressed: () => setState(() => _view = 'createAccount'),
        ),
        const SizedBox(height: 16),
        _buildOutlinedButton(
          text: 'Login',
          onPressed: () => setState(() => _view = 'login'),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  VIEW: CREATE ACCOUNT
  //  Fields: Username, Email, Mobile No., Company, Password, Confirm Password
  // ═══════════════════════════════════════════════════════════════
  Widget _buildCreateAccountView(AuthState authState) {
    final authNotifier = ref.read(authProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildHeader('Create Account', () => setState(() => _view = 'welcome')),

        // Username
        _buildInputField(
          controller: _usernameController,
          placeholder: 'Username',
          icon: Icons.person_outline,
        ),
        const SizedBox(height: 16),

        // Email
        _buildInputField(
          controller: _emailController,
          placeholder: 'Email',
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),

        // Mobile No.
        _buildInputField(
          controller: _mobileController,
          placeholder: 'Mobile No.',
          icon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
          maxLength: 10,
        ),
        const SizedBox(height: 16),

        // Company Name
        _buildInputField(
          controller: _companyController,
          placeholder: 'Company',
          icon: Icons.business_outlined,
        ),
        const SizedBox(height: 16),

        // Password
        _buildInputField(
          controller: _passwordController,
          placeholder: 'Password',
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

        // Confirm Password
        _buildInputField(
          controller: _confirmPasswordController,
          placeholder: 'Confirm Password',
          icon: Icons.lock_outline,
          obscureText: true,
        ),
        const SizedBox(height: 24),

        // Sign Up Button
        _buildPrimaryButton(
          text: 'Sign Up',
          isLoading: authState.isLoading,
          onPressed: () async {
            // Validation (matching React's handleCreateAccount)
            if (_usernameController.text.isEmpty ||
                _emailController.text.isEmpty ||
                _mobileController.text.isEmpty ||
                _passwordController.text.isEmpty ||
                _confirmPasswordController.text.isEmpty) {
              _showToast('Please fill all required fields', isError: true);
              return;
            }
            if (_passwordController.text.length < 6) {
              _showToast('Password must be at least 6 characters long.', isError: true);
              return;
            }
            if (_passwordController.text != _confirmPasswordController.text) {
              _showToast('Passwords do not match!', isError: true);
              return;
            }
            // Send OTP
            final success = await authNotifier.sendOtp(_emailController.text);
            if (success) {
              _showToast('OTP Sent to your email');
            }
          },
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  VIEW: OTP VERIFICATION
  // ═══════════════════════════════════════════════════════════════
  Widget _buildOtpView(AuthState authState) {
    final authNotifier = ref.read(authProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildHeader('Verify OTP', () {
          authNotifier.resetOtp();
        }),

        // Info text
        Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              style: GoogleFonts.inter(fontSize: 12, color: textMuted),
              children: [
                const TextSpan(text: "We've sent an OTP to "),
                TextSpan(
                  text: _emailController.text,
                  style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: textMain),
                ),
              ],
            ),
          ),
        ),

        // Open Email App button
        Center(
          child: GestureDetector(
            onTap: () {
              // Open email app (on mobile this would use url_launcher)
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: primaryColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.email_outlined, size: 14, color: primaryDark),
                  const SizedBox(width: 6),
                  Text(
                    'Open Email App',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: primaryDark),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),

        // OTP Input (centered, letter-spaced, matching React)
        Container(
          decoration: BoxDecoration(
            color: bgMain,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: borderColor),
          ),
          child: TextField(
            controller: _otpController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: textMain,
              letterSpacing: 8,
            ),
            decoration: InputDecoration(
              hintText: 'Enter OTP',
              hintStyle: GoogleFonts.inter(fontSize: 14, color: textMuted, letterSpacing: 0),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Submit OTP Button
        _buildPrimaryButton(
          text: 'Submit OTP',
          isLoading: authState.isLoading,
          onPressed: () async {
            if (_otpController.text.isEmpty) {
              _showToast('Please enter OTP', isError: true);
              return;
            }
            final success = await authNotifier.verifyOtp(
              _emailController.text,
              _otpController.text,
            );
            if (success) {
              // After OTP verified, immediately create account (matching React flow)
              final created = await authNotifier.createAccount(
                email: _emailController.text,
                password: _passwordController.text,
                username: _usernameController.text,
                mobileNo: _mobileController.text,
                companyName: _companyController.text,
              );
              if (created) {
                _showToast('Account Created Successfully!');
                setState(() => _view = 'login');
              }
            } else {
              _showToast('Invalid OTP', isError: true);
            }
          },
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  VIEW: LOGIN
  //  Fields: Email, Password (show/hide), Forgot Password link
  // ═══════════════════════════════════════════════════════════════
  Widget _buildLoginView(AuthState authState) {
    final authNotifier = ref.read(authProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildHeader('Login', () => setState(() => _view = 'welcome')),

        // Email
        _buildInputField(
          controller: _emailController,
          placeholder: 'Email',
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 16),

        // Password with eye toggle
        _buildInputField(
          controller: _passwordController,
          placeholder: 'Password',
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

        // Forgot Password link (matching React's flex justify-end)
        Align(
          alignment: Alignment.centerRight,
          child: GestureDetector(
            onTap: () => setState(() {
              _view = 'forgotPassword';
              _isEmailSent = false;
            }),
            child: Text(
              'Forgot Password?',
              style: GoogleFonts.inter(fontSize: 12, color: textMuted),
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Login Button
        _buildPrimaryButton(
          text: 'Login',
          isLoading: authState.isLoading,
          onPressed: () async {
            if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
              _showToast('Please enter email and password', isError: true);
              return;
            }
            final success = await authNotifier.login(
              _emailController.text,
              _passwordController.text,
            );
            if (success && mounted) {
              _showToast('Login Successful!');
              context.go('/home');
            }
          },
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  VIEW: FORGOT PASSWORD
  //  Two sub-states: form + success
  // ═══════════════════════════════════════════════════════════════
  Widget _buildForgotPasswordView(AuthState authState) {
    final authNotifier = ref.read(authProvider.notifier);

    if (_isEmailSent) {
      // ─── SUCCESS STATE (matching React's checkmark view) ───
      return Column(
        children: [
          _buildHeader('Check Inbox', () {
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
            'Check Inbox',
            style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800, color: textMain),
          ),
          const SizedBox(height: 12),
          RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              style: GoogleFonts.inter(fontSize: 14, color: textMuted, height: 1.5),
              children: [
                const TextSpan(text: 'We have sent a secure password reset link to\n'),
                TextSpan(
                  text: _emailController.text,
                  style: GoogleFonts.inter(fontWeight: FontWeight.w700, color: textMain),
                ),
                const TextSpan(text: '\nClick the link in the email to set a new password, then return here to log in.'),
              ],
            ),
          ),
          const SizedBox(height: 32),
          _buildPrimaryButton(
            text: 'Back to Login',
            onPressed: () => setState(() {
              _view = 'login';
              _isEmailSent = false;
            }),
          ),
        ],
      );
    }

    // ─── FORM STATE ───
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildHeader(
          'Reset Password',
          () => setState(() {
            _view = 'login';
            _isEmailSent = false;
          }),
        ),
        Text(
          'Enter your registered email address. We\'ll send you a link to reset your password.',
          style: GoogleFonts.inter(fontSize: 12, color: textMuted, height: 1.5),
        ),
        const SizedBox(height: 20),
        _buildInputField(
          controller: _emailController,
          placeholder: 'Enter your email',
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 20),
        _buildOutlinedButton(
          text: 'Send Reset Link',
          onPressed: () async {
            if (_emailController.text.isEmpty) {
              _showToast('Enter your email', isError: true);
              return;
            }
            final success = await authNotifier.forgotPassword(_emailController.text);
            if (success) {
              setState(() => _isEmailSent = true);
              _showToast('Link sent successfully!');
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

    // Determine which view to show
    Widget currentView;
    if (authState.otpSent && !authState.otpVerified) {
      currentView = _buildOtpView(authState);
    } else if (_view == 'welcome') {
      currentView = _buildWelcomeView();
    } else if (_view == 'createAccount') {
      currentView = _buildCreateAccountView(authState);
    } else if (_view == 'login') {
      currentView = _buildLoginView(authState);
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
            // Background blurred circles (matching React's blur-[100px] divs)
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

            // Main content
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
                    duration: const Duration(milliseconds: 300),
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
