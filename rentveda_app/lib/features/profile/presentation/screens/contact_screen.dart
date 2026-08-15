import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/top_app_bar.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();
  
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _sendEmail() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final message = _messageController.text.trim();

    if (name.isEmpty || email.isEmpty || message.isEmpty) {
      Fluttertoast.showToast(msg: tr('fillAllFieldsErr'), backgroundColor: AppColors.danger);
      return;
    }

    setState(() => _isLoading = true);

    // Simulated delay like in React app
    await Future.delayed(const Duration(milliseconds: 1500));

    // Email launching functionality
    const String supportEmail = 'support@rentveda.com'; 
    final Uri emailLaunchUri = Uri(
      scheme: 'mailto',
      path: supportEmail,
      query: _encodeQueryParameters(<String, String>{
        'subject': 'Support Request from $name',
        'body': 'Name: $name\nEmail: $email\n\nMessage:\n$message',
      }),
    );

    try {
      if (await canLaunchUrl(emailLaunchUri)) {
        await launchUrl(emailLaunchUri);
        Fluttertoast.showToast(msg: tr('messageSentSuccess'), backgroundColor: AppColors.successDark);
        if (mounted) {
          _nameController.clear();
          _emailController.clear();
          _messageController.clear();
        }
      } else {
        Fluttertoast.showToast(msg: tr('launchEmailErr'), backgroundColor: AppColors.danger);
      }
    } catch (e) {
      Fluttertoast.showToast(msg: tr('launchEmailErr'), backgroundColor: AppColors.danger);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  String? _encodeQueryParameters(Map<String, String> params) {
    return params.entries
        .map((MapEntry<String, String> e) =>
            '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')
        .join('&');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgMain,
      appBar: const RentVedaAppBar(showBackButton: true),
      body: SafeArea(
        child: Column(
          children: [
            // SCROLLABLE CONTENT AREA
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tr('contactUs'),
                      style: AppTypography.screenHeader.copyWith(fontSize: 20, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      tr('contactSubtitle'),
                      style: AppTypography.bodyMain.copyWith(color: AppColors.textSubtle, fontSize: 14, height: 1.5),
                    ),
                    const SizedBox(height: 32),

                    _buildTextField(
                      controller: _nameController,
                      icon: Icons.person,
                      hintText: tr('fullNamePlaceholder'),
                    ),
                    const SizedBox(height: 20),
                    
                    _buildTextField(
                      controller: _emailController,
                      icon: Icons.email,
                      hintText: tr('emailPlaceholder'),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 20),

                    _buildTextField(
                      controller: _messageController,
                      icon: Icons.chat,
                      hintText: tr('messagePlaceholder'),
                      maxLines: 5,
                    ),
                  ],
                ),
              ),
            ),

            // BOTTOM ACTION AREA (Sticky Button at bottom)
            Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              color: AppColors.bgMain,
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _sendEmail,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.warning, // Yellow like React
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                    elevation: 4,
                    shadowColor: AppColors.warning.withValues(alpha: 0.4),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              tr('sendMessage') == 'sendMessage' ? 'Send Message' : tr('sendMessage'),
                              style: AppTypography.buttonText.copyWith(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.send, size: 16),
                          ],
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required IconData icon,
    required String hintText,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(maxLines > 1 ? 24 : 30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        maxLines: maxLines,
        style: AppTypography.bodyMain.copyWith(fontSize: 14),
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: AppTypography.bodySecondary.copyWith(color: AppColors.textSubtle),
          prefixIcon: Padding(
            padding: EdgeInsets.only(
              left: 20, 
              right: 12, 
              bottom: maxLines > 1 ? (maxLines * 16.0) : 0, 
              top: maxLines > 1 ? 16.0 : 0
            ),
            child: Icon(icon, color: AppColors.textSubtle, size: 16),
          ),
          filled: true,
          fillColor: Colors.transparent,
          contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(maxLines > 1 ? 24 : 30), 
            borderSide: const BorderSide(color: Colors.transparent)
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(maxLines > 1 ? 24 : 30), 
            borderSide: const BorderSide(color: Colors.transparent)
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(maxLines > 1 ? 24 : 30), 
            borderSide: const BorderSide(color: AppColors.primary, width: 2) // primary border color on focus
          ),
        ),
      ),
    );
  }
}
