import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:easy_localization/easy_localization.dart';

class ClientListItem extends StatelessWidget {
  final Map<String, dynamic> user;
  final VoidCallback onTap;

  const ClientListItem({
    super.key,
    required this.user,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final name = user['customerName'] ?? tr('Unknown');
    final mobile = user['mobileNumber']?.toString() ?? '';
    final pendingAmount = (user['pendingAmount'] ?? 0).toDouble();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE2E2E2)),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9F9F9),
                    border: Border.all(color: const Color(0xFFE2E2E2)),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.person_outline, size: 18, color: Color(0xFF9CA3AF)),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1A1C1C),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.phone, size: 8, color: Color(0xFF9CA3AF)),
                        const SizedBox(width: 4),
                        Text(
                          mobile,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            color: const Color(0xFF9CA3AF),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
            Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (pendingAmount > 0) ...[
                      Text(
                        tr('filterPending').toUpperCase(),
                        style: GoogleFonts.inter(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFFF87171),
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        '₹${NumberFormat('#,##,###').format(pendingAmount.toInt())}',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFFEF4444),
                        ),
                      ),
                    ] else ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          tr('filterPaid') == 'filterPaid' ? 'Paid' : tr('filterPaid'),
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF22C55E),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(width: 12),
                const Icon(Icons.chevron_right, size: 12, color: Color(0xFF9CA3AF)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
