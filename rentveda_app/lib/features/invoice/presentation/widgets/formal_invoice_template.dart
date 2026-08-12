import 'package:flutter/material.dart';

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
                    const Text(
                      'INVOICE',
                      style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w300, letterSpacing: 4),
                    ),
                    const SizedBox(height: 8),
                    const Text('Bill From:', style: TextStyle(color: Colors.white54, fontSize: 12)),
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
                    const Text(
                      'Original Copy',
                      style: TextStyle(color: Colors.white54, fontSize: 12),
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
                  const Text('Bill To:', style: TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
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
                      const Text('Date: ', style: TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
                      Text(formattedDate, style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Text('Invoice No: ', style: TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
                      Text('#INV-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}', style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
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
                    const Text('Machine', style: TextStyle(color: Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(machineName, style: const TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.w600)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Text('Job Work', style: TextStyle(color: Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(jobWork, style: const TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.w600)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('Operator', style: TextStyle(color: Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
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
                      const Expanded(flex: 4, child: Text('Description', style: TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold))),
                      Expanded(flex: 2, child: Center(child: Text('Qty ($rentType)', style: const TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold)))),
                      const Expanded(flex: 2, child: Center(child: Text('Rate', style: TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold)))),
                      const Expanded(flex: 2, child: Align(alignment: Alignment.centerRight, child: Text('Amount', style: TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold)))),
                    ],
                  ),
                ),
                // Table Row
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                  child: Row(
                    children: [
                      const Expanded(flex: 4, child: Text('Machine Rental Charges', style: TextStyle(color: Colors.black87, fontSize: 16))),
                      Expanded(flex: 2, child: Center(child: Text('$qty', style: const TextStyle(color: Colors.black87, fontSize: 16)))),
                      Expanded(flex: 2, child: Center(child: Text('Rs $price', style: const TextStyle(color: Colors.black87, fontSize: 16)))),
                      Expanded(flex: 2, child: Align(alignment: Alignment.centerRight, child: Text('Rs $totalAmount', style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)))),
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
                  const Text('Scan to Pay', style: TextStyle(color: Colors.black54, fontSize: 12, fontWeight: FontWeight.bold)),
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
                        const Text('Paid Amount:', style: TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
                        Text('Rs $paidAmount', style: const TextStyle(color: Colors.green, fontSize: 14, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Pending Due:', style: TextStyle(color: Colors.black54, fontSize: 14, fontWeight: FontWeight.bold)),
                        Text('Rs $pendingAmount', style: const TextStyle(color: Colors.red, fontSize: 14, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 12),
                      child: Divider(color: Color(0xFFE0E0E0), height: 1),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total:', style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.w900)),
                        Text('Rs $totalAmount', style: const TextStyle(color: Color(0xFFFBC02D), fontSize: 24, fontWeight: FontWeight.w900)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 60),
          
          // 6. BOTTOM GREETING
          const Center(
            child: Column(
              children: [
                Divider(color: Color(0xFFE0E0E0), height: 1),
                SizedBox(height: 24),
                Text(
                  'Thank you for your business!',
                  style: TextStyle(color: Colors.black54, fontSize: 20, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'made by ',
                      style: TextStyle(color: Colors.black45, fontSize: 12, fontStyle: FontStyle.italic),
                    ),
                    Text(
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
