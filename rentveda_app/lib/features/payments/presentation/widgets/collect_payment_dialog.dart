import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:easy_localization/easy_localization.dart';

class CollectPaymentDialog extends StatefulWidget {
  final Map<String, dynamic> entry;
  final Function(double, String, String) onSubmit;

  const CollectPaymentDialog({
    super.key,
    required this.entry,
    required this.onSubmit,
  });

  @override
  State<CollectPaymentDialog> createState() => _CollectPaymentDialogState();
}

class _CollectPaymentDialogState extends State<CollectPaymentDialog> {
  late TextEditingController _nameController;
  late TextEditingController _mobileController;
  late TextEditingController _amountController;
  
  late double pendingAmount;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.entry['customerName'] ?? '');
    _mobileController = TextEditingController(text: widget.entry['mobileNumber']?.toString() ?? '');
    
    pendingAmount = (widget.entry['pendingAmount'] ?? 0).toDouble();
    _amountController = TextEditingController(text: pendingAmount.toInt().toString());
  }

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Collect Payment',
                  style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF1A1C1C)),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9F9F9),
                      border: Border.all(color: const Color(0xFFE2E2E2)),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, size: 14, color: Color(0xFF4F4633)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Input fields
            Text(tr('customerName'), style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF9CA3AF))),
            const SizedBox(height: 4),
            _buildTextField(_nameController),
            const SizedBox(height: 12),

            Text(tr('mobileNumber'), style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF9CA3AF))),
            const SizedBox(height: 4),
            _buildTextField(_mobileController, keyboardType: TextInputType.phone),
            const SizedBox(height: 16),

            // Pending amount display
            Text(tr('pendingAmount'), style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF9CA3AF))),
            const SizedBox(height: 4),
            Text(
              '₹${pendingAmount.toInt()}',
              style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: const Color(0xFFEF4444)),
            ),
            const SizedBox(height: 16),

            // Payment Amount Input
            Text(tr('pendingAmount') == 'pendingAmount' ? 'Enter Payment Amount' : tr('pendingAmount'), style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF9CA3AF))),
            const SizedBox(height: 4),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF1A1C1C)),
              decoration: InputDecoration(
                prefixText: '₹ ',
                prefixStyle: GoogleFonts.inter(color: const Color(0xFF9CA3AF)),
                filled: true,
                fillColor: const Color(0xFFF9F9F9),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E2E2))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E2E2))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFFFCC00))),
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  final amount = double.tryParse(_amountController.text) ?? 0;
                  if (amount > 0 && amount <= pendingAmount) {
                    widget.onSubmit(amount, _nameController.text, _mobileController.text);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF22C55E),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(
                  tr('submit'),
                  style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, {TextInputType keyboardType = TextInputType.text}) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF1A1C1C)),
      decoration: InputDecoration(
        filled: true,
        fillColor: const Color(0xFFF9F9F9),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E2E2))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E2E2))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFFFCC00))),
      ),
    );
  }
}
