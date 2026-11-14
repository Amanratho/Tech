import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:easy_localization/easy_localization.dart';

class RecentActivity extends StatelessWidget {
  final List<dynamic> payments;
  final VoidCallback? onViewAllTap;

  const RecentActivity({super.key, required this.payments, this.onViewAllTap});

  @override
  Widget build(BuildContext context) {
    // Sort by createdAt descending and take first 3
    final sorted = [...payments];
    sorted.sort((a, b) {
      final dateA = DateTime.tryParse(a['createdAt'] ?? '') ?? DateTime(2000);
      final dateB = DateTime.tryParse(b['createdAt'] ?? '') ?? DateTime(2000);
      return dateB.compareTo(dateA);
    });
    final recentEntries = sorted.take(3).toList();

    if (recentEntries.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Section header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(tr('recentActivityTitle'),
                style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: const Color(0xFF1A1C1C))),
              GestureDetector(
                onTap: onViewAllTap,
                child: Row(
                  children: [
                    Text(tr('viewAllHistory'), style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF795900))),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_forward, size: 12, color: Color(0xFF795900)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Activity items
          ...recentEntries.map((entry) {
            final name = entry['customerName'] ?? 'Customer Entry';
            final totalAmount = (entry['totalAmount'] ?? 0).toDouble();
            final pendingAmount = (entry['pendingAmount'] ?? 0).toDouble();
            final createdAt = DateTime.tryParse(entry['createdAt'] ?? '');
            final dateStr = createdAt != null
                ? DateFormat('dd MMM yyyy • hh:mm a', context.locale.languageCode).format(createdAt)
                : '';

            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: const Color(0xFFE2E2E2)),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 4)],
              ),
              child: Row(
                children: [
                  // User avatar
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9F9F9),
                      border: Border.all(color: const Color(0xFFE2E2E2)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.person_outline, size: 16, color: Color(0xFF4F4633)),
                  ),
                  const SizedBox(width: 12),

                  // Name & date
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF1A1C1C))),
                        const SizedBox(height: 2),
                        Text(dateStr, style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF4F4633))),
                      ],
                    ),
                  ),

                  // Amount & status
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('₹${NumberFormat('#,##,###').format(totalAmount.toInt())}',
                        style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w800, color: const Color(0xFF1A1C1C))),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: pendingAmount > 0 ? const Color(0xFFFEE2E2) : const Color(0xFFDCFCE7),
                          border: Border.all(color: pendingAmount > 0 ? const Color(0xFFFECACA) : const Color(0xFFBBF7D0)),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          pendingAmount > 0 ? '${tr('statusDue')} ₹${pendingAmount.toInt()}' : tr('statusPaid'),
                          style: GoogleFonts.inter(
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            color: pendingAmount > 0 ? const Color(0xFFDC2626) : const Color(0xFF16A34A),
                            letterSpacing: 0.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
