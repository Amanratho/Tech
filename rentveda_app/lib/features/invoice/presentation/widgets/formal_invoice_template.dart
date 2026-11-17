import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';

class FormalInvoiceTemplate extends StatelessWidget {
  final Map<String, dynamic>? user;
  final Map<String, dynamic> entryData;
  final String machineName;
  final String formattedDate;
  final double totalAmount;

  const FormalInvoiceTemplate({
    super.key,
    required this.user,
    required this.entryData,
    required this.machineName,
    required this.formattedDate,
    required this.totalAmount,
  });

  @override
  Widget build(BuildContext context) {
    final companyName = user?['companyName'] ?? 'COMPANY NAME';
    final ownerName = user?['username'] ?? 'Owner Name';
    final ownerMobile = user?['mobileNo'] ?? 'N/A';
    
    final customerName = entryData['customerName'] ?? 'N/A';
    final customerMobile = entryData['mobileNumber'] ?? 'N/A';
    final customerAddress = entryData['address'] ?? 'N/A';
    
    final jobWork = entryData['jobWork'] ?? 'N/A';
    final operatorName = entryData['operatorName'] ?? 'N/A';
    
    final qty = entryData['quantity'] ?? 0;
    final rentType = entryData['rentType'] ?? 'Hour';
    final price = entryData['price'] ?? 0;
    
    final paidAmount = entryData['paidAmount'] ?? 0;
    final pendingAmount = entryData['pendingAmount'] ?? 0;
    
    final qrCodeUrl = user?['qrCodeUrl'];

    return Container(
      width: 800,
      height: 1130,
      color: Colors.white,
      padding: const EdgeInsets.all(40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. BLACK HEADER
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            decoration: const BoxDecoration(
              color: Color(0xFF1E1E1E), // Black header
              border: Border(bottom: BorderSide(color: Color(0xFFFBC02D), width: 6)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tr('invoiceHeader'),
                      style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w300, letterSpacing: 4),
                    ),
                    const SizedBox(height: 8),
                    Text(tr('billFromLabel'), style: const TextStyle(color: Colors.white54, fontSize: 12)),
                    const SizedBox(height: 2),
                    Text(ownerName, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    Text('+91 $ownerMobile', style: const TextStyle(color: Colors.white70, fontSize: 14)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      companyName.toUpperCase(),
                      style: const TextStyle(color: Color(0xFFFBC02D), fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: 2),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tr('originalCopyLabel'),
                      style: const TextStyle(color: Colors.white54, fontSize: 12),
                    ),
                  ],
                )
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          
          // 2. BILL TO & DATE
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(tr('billToLabel'), style: const TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(customerName, style: const TextStyle(color: Colors.black, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('+91 $customerMobile', style: const TextStyle(color: Colors.black87, fontSize: 14)),
                  const SizedBox(height: 4),
                  SizedBox(
                    width: 300,
                    child: Text(customerAddress, style: const TextStyle(color: Colors.black87, fontSize: 14)),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      Text('${tr('dateLabel')} ', style: const TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
                      Text(formattedDate, style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text('${tr('invoiceNoLabel')} ', style: const TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
                      Text('#INV-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}', style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  if (entry['isEdited'] == true || (entry['editCount'] != null && (entry['editCount'] as num) > 0)) ...[
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7ED),
                        border: Border.all(color: const Color(0xFFEA580C), width: 1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        (entry['editCount'] != null && (entry['editCount'] as num) > 1)
                            ? 'EDITED (v${entry['editCount']})'
                            : 'EDITED INVOICE',
                        style: const TextStyle(
                          color: Color(0xFFC2410C),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
          
          const SizedBox(height: 40),
          
          // 3. JOB DETAILS HEADER (Light Gray)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF9F9F9),
              border: Border.all(color: const Color(0xFFE0E0E0)),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tr('machineLabel'), style: const TextStyle(color: Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(machineName, style: const TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.w600)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(tr('jobWorkLabel'), style: const TextStyle(color: Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(jobWork, style: const TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.w600)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(tr('operatorLabel'), style: const TextStyle(color: Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(operatorName, style: const TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // 4. TABLE
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFFE0E0E0)),
              borderRadius: BorderRadius.circular(8),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                // Table Header (Yellow)
                Container(
                  color: const Color(0xFFFBC02D),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    children: [
                      Expanded(flex: 4, child: Text(tr('descriptionCol'), style: const TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold))),
                      Expanded(flex: 2, child: Center(child: Text(tr('qtyCol', namedArgs: {'unit': rentType}), style: const TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold)))),
                      Expanded(flex: 2, child: Center(child: Text(tr('rateCol'), style: const TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold)))),
                      Expanded(flex: 2, child: Align(alignment: Alignment.centerRight, child: Text(tr('amountCol'), style: const TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold)))),
                    ],
                  ),
                ),
                // Table Row
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                  child: Row(
                    children: [
                      Expanded(flex: 4, child: Text(tr('machineRentalCharges'), style: const TextStyle(color: Colors.black87, fontSize: 16))),
                      Expanded(flex: 2, child: Center(child: Text('$qty', style: const TextStyle(color: Colors.black87, fontSize: 16)))),
                      Expanded(flex: 2, child: Center(child: Text('${tr('rsSymbol')} $price', style: const TextStyle(color: Colors.black87, fontSize: 16)))),
                      Expanded(flex: 2, child: Align(alignment: Alignment.centerRight, child: Text('${tr('rsSymbol')} $totalAmount', style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)))),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const Spacer(),
          
          // 5. FOOTER (QR and Summary)
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // QR CODE
              Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      border: Border.all(color: const Color(0xFFE0E0E0)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: qrCodeUrl != null && qrCodeUrl.isNotEmpty
                        ? Image.network(qrCodeUrl, fit: BoxFit.contain)
                        : const Center(child: Icon(Icons.qr_code, size: 64, color: Colors.black12)),
                  ),
                  const SizedBox(height: 8),
                  Text(tr('scanToPay'), style: const TextStyle(color: Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
              
              // TOTAL BOX
              Container(
                width: 320,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFF9F9F9),
                  border: Border.all(color: const Color(0xFFE0E0E0)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(tr('paidAmountLabel'), style: const TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
                        Text('${tr('rsSymbol')} $paidAmount', style: const TextStyle(color: Colors.green, fontSize: 14, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(tr('pendingDueLabel'), style: const TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
                        Text('${tr('rsSymbol')} $pendingAmount', style: const TextStyle(color: Colors.red, fontSize: 14, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(color: Color(0xFFE0E0E0), height: 1),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(tr('totalLabel'), style: const TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.w900)),
                        Text('${tr('rsSymbol')} $totalAmount', style: const TextStyle(color: Color(0xFFFBC02D), fontSize: 24, fontWeight: FontWeight.w900)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 60),
          
          // 6. BOTTOM GREETING
          Center(
            child: Column(
              children: [
                const Divider(color: Color(0xFFE0E0E0), height: 1),
                const SizedBox(height: 24),
                Text(
                  tr('thankYouBusiness'),
                  style: const TextStyle(color: Colors.black54, fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      tr('madeBy'),
                      style: const TextStyle(color: Colors.black45, fontSize: 12, fontStyle: FontStyle.italic),
                    ),
                    const Text(
                      'RentVeda',
                      style: TextStyle(color: Color(0xFFFBC02D), fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1),
                    ),
                  ],
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
