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
      Fluttertoast.showToast(msg: "Please fill all fields", backgroundColor: AppColors.danger);
      return;
    }

    setState(() => _isLoading = true);

    // Provide your actual support email here
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
        Fluttertoast.showToast(msg: "Opening Email App...", backgroundColor: AppColors.successDark);
        if (mounted) {
          _nameController.clear();
          _emailController.clear();
          _messageController.clear();
        }
      } else {
        Fluttertoast.showToast(msg: "Could not launch email app", backgroundColor: AppColors.danger);
      }
    } catch (e) {
      Fluttertoast.showToast(msg: "Error launching email app", backgroundColor: AppColors.danger);
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
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                tr('contactUs'),
                style: AppTypography.screenHeader,
              ),
              const SizedBox(height: 12),
              Text(
                tr('contactSubtitle'),
                style: AppTypography.bodyMain.copyWith(color: AppColors.textSubtle),
              ),
              const SizedBox(height: 32),

              _buildTextField(
                controller: _nameController,
                icon: Icons.person_outline,
                hintText: tr('fullNamePlaceholder'),
              ),
              const SizedBox(height: 20),
              
              _buildTextField(
                controller: _emailController,
                icon: Icons.email_outlined,
                hintText: tr('emailPlaceholder'),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 20),

              _buildTextField(
                controller: _messageController,
                icon: Icons.chat_bubble_outline,
                hintText: tr('messagePlaceholder'),
                maxLines: 5,
              ),
              const SizedBox(height: 40),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _sendEmail,
                  icon: _isLoading 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: AppColors.textMain, strokeWidth: 2))
                    : const Icon(Icons.send),
                  label: Text(
                    _isLoading ? "Sending..." : tr('sendMessage'),
                    style: AppTypography.buttonText,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryGold,
                    foregroundColor: AppColors.textMain,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                ),
              ),
            ],
          ),
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
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: AppTypography.bodySecondary,
        prefixIcon: Padding(
          padding: EdgeInsets.only(bottom: maxLines > 1 ? (maxLines * 12.0) : 0),
          child: Icon(icon, color: AppColors.textSubtle, size: 20),
        ),
        filled: true,
        fillColor: AppColors.bgSurface,
        contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(maxLines > 1 ? 16 : 30), 
          borderSide: const BorderSide(color: Colors.transparent)
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(maxLines > 1 ? 16 : 30), 
          borderSide: const BorderSide(color: Colors.transparent)
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(maxLines > 1 ? 16 : 30), 
          borderSide: const BorderSide(color: AppColors.primaryGold, width: 2)
        ),
      ),
    );
  }
}
