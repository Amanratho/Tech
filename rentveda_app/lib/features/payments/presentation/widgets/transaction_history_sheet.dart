import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:easy_localization/easy_localization.dart';

class TransactionHistorySheet extends StatelessWidget {
  final List<dynamic> entries;
  final String clientName;
  final Function(Map<String, dynamic>) onCollectPayment;

  const TransactionHistorySheet({
    super.key,
    required this.entries,
    required this.clientName,
    required this.onCollectPayment,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFF9F9F9),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: const BoxDecoration(
              color: Color(0xFFF9F9F9),
              border: Border(bottom: BorderSide(color: Color(0xFFE2E2E2))),
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Icon(Icons.arrow_back, size: 20, color: Color(0xFF1A1C1C)),
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      clientName,
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF1A1C1C)),
                    ),
                    Text(
                      tr('billsHistory'),
                      style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF9CA3AF)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: entries.length,
              itemBuilder: (context, index) {
                final entry = entries[index] as Map<String, dynamic>;
                final createdAt = DateTime.tryParse(entry['createdAt'] ?? '') ?? DateTime.now();
                final pendingAmount = (entry['pendingAmount'] ?? 0).toDouble();
                final totalAmount = (entry['totalAmount'] ?? 0).toDouble();

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE2E2E2)),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      // Top Row (Date and Badge)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            DateFormat('dd MMM yyyy').format(createdAt),
                            style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF9CA3AF)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: pendingAmount <= 0 ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                              border: Border.all(color: pendingAmount <= 0 ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  pendingAmount <= 0 ? Icons.check_circle : Icons.error,
                                  size: 10,
                                  color: pendingAmount <= 0 ? const Color(0xFF22C55E) : const Color(0xFFF87171),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  pendingAmount <= 0 ? (tr('filterPaid') == 'filterPaid' ? 'Paid' : tr('filterPaid')) : (tr('filterPending') == 'filterPending' ? 'Pending' : tr('filterPending')),
                                  style: GoogleFonts.inter(
                                    fontSize: 10,
                                    color: pendingAmount <= 0 ? const Color(0xFF22C55E) : const Color(0xFFF87171),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Middle Row (Amounts)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(tr('total'), style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF9CA3AF))),
                              Text('₹${totalAmount.toInt()}', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF1A1C1C))),
                            ],
                          ),
                          if (pendingAmount > 0)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(tr('pendingAmount'), style: GoogleFonts.inter(fontSize: 10, color: const Color(0xFF9CA3AF))),
                                Text('₹${pendingAmount.toInt()}', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: const Color(0xFFEF4444))),
                              ],
                            )
                          else
                            Text(tr('filterPaid') == 'filterPaid' ? 'Paid' : tr('filterPaid'), style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF22C55E))),
                        ],
                      ),

                      // Collect Button
                      if (pendingAmount > 0) ...[
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => onCollectPayment(entry),
                            icon: const Icon(Icons.money, size: 16),
                            label: Text(tr('submit') == 'submit' ? 'Collect Payment' : 'Collect Payment'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFFCC00),
                              foregroundColor: Colors.black,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              textStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
