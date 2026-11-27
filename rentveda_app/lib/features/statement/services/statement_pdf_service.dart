import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class StatementPdfService {
  /// Generate a professional, beautifully styled PDF document as raw bytes.
  static Future<Uint8List> generateStatementPdf({
    required DateTime startDate,
    required DateTime endDate,
    required String machineName,
    required String filterType,
    required List<Map<String, dynamic>> rentals,
    String? userName,
    String? companyName,
    String? userMobile,
  }) async {
    final pdf = pw.Document();

    // 1. Load Fonts with Devanagari (Hindi) & English Unicode support
    pw.Font regularFont;
    pw.Font boldFont;
    try {
      regularFont = await PdfGoogleFonts.notoSansDevanagariRegular();
      boldFont = await PdfGoogleFonts.notoSansDevanagariBold();
    } catch (_) {
      try {
        regularFont = await PdfGoogleFonts.robotoRegular();
        boldFont = await PdfGoogleFonts.robotoBold();
      } catch (_) {
        regularFont = pw.Font.helvetica();
        boldFont = pw.Font.helveticaBold();
      }
    }

    // 2. Load Logo Image if available
    pw.MemoryImage? logoImage;
    try {
      final byteData = await rootBundle.load('assets/images/rentVedaIcon.png');
      logoImage = pw.MemoryImage(byteData.buffer.asUint8List());
    } catch (_) {}

    // Colors
    const primaryGold = PdfColor.fromInt(0xFFD97706); // Darker amber for print readability
    const darkSlate = PdfColor.fromInt(0xFF0F172A);
    const textDark = PdfColor.fromInt(0xFF1E293B);
    const textMuted = PdfColor.fromInt(0xFF64748B);
    const borderSlate = PdfColor.fromInt(0xFFE2E8F0);
    const zebraBg = PdfColor.fromInt(0xFFF8FAFC);
    const greenDark = PdfColor.fromInt(0xFF15803D);
    const redDark = PdfColor.fromInt(0xFFB91C1C);

    // Calculate Summary Totals
    double sumTotal = 0;
    double sumPaid = 0;
    double sumPending = 0;

    for (final r in rentals) {
      final price = double.tryParse(r['price']?.toString() ?? '') ?? 0.0;
      final qty = double.tryParse(r['quantity']?.toString() ?? '') ?? 0.0;
      final paid = double.tryParse(r['paidAmount']?.toString() ?? '') ?? 0.0;
      final pending = double.tryParse(r['pendingAmount']?.toString() ?? '') ?? 0.0;
      final rawTotal = double.tryParse(r['totalAmount']?.toString() ?? '') ?? 0.0;
      final total = (paid + pending > 0) ? (paid + pending) : (rawTotal > 0 ? rawTotal : (price * qty));

      sumTotal += total;
      sumPaid += paid;
      sumPending += pending;
    }

    final currencyFormat = NumberFormat('#,##,###.##');
    String fmt(double val) {
      if (val % 1 == 0) return NumberFormat('#,##,###').format(val.toInt());
      return currencyFormat.format(val);
    }

    // Add MultiPage Document
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.symmetric(horizontal: 18, vertical: 22),
        theme: pw.ThemeData.withFont(
          base: regularFont,
          bold: boldFont,
        ),
        header: (context) {
          if (context.pageNumber > 1) {
            return pw.Container(
              margin: const pw.EdgeInsets.only(bottom: 12),
              padding: const pw.EdgeInsets.only(bottom: 6),
              decoration: const pw.BoxDecoration(
                border: pw.Border(bottom: pw.BorderSide(color: borderSlate, width: 0.8)),
              ),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('RentVeda - हिसाब स्टेटमेंट रिपोर्ट', style: pw.TextStyle(font: boldFont, fontSize: 8, color: textMuted)),
                  pw.Text(
                    '${DateFormat('dd-MM-yyyy').format(startDate)} से ${DateFormat('dd-MM-yyyy').format(endDate)}',
                    style: pw.TextStyle(font: regularFont, fontSize: 8, color: textMuted),
                  ),
                ],
              ),
            );
          }
          return pw.SizedBox.shrink();
        },
        footer: (context) {
          return pw.Container(
            margin: const pw.EdgeInsets.only(top: 10),
            padding: const pw.EdgeInsets.only(top: 6),
            decoration: const pw.BoxDecoration(
              border: pw.Border(top: pw.BorderSide(color: borderSlate, width: 0.8)),
            ),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text(
                  'RentVeda ऐप द्वारा जेनरेटेड • डिजिटल कृषि व मशीनरी बहीखाता',
                  style: pw.TextStyle(font: regularFont, fontSize: 7.5, color: textMuted),
                ),
                pw.Text(
                  'पृष्ठ ${context.pageNumber} / ${context.pagesCount}',
                  style: pw.TextStyle(font: boldFont, fontSize: 7.5, color: textDark),
                ),
              ],
            ),
          );
        },
        build: (context) {
          return [
            // --- 1. BRAND HEADER ---
            pw.Container(
              padding: const pw.EdgeInsets.all(12),
              decoration: pw.BoxDecoration(
                color: zebraBg,
                borderRadius: pw.BorderRadius.circular(8),
                border: pw.Border.all(color: borderSlate, width: 0.8),
              ),
              child: pw.Row(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  if (logoImage != null)
                    pw.Container(
                      width: 44,
                      height: 44,
                      margin: const pw.EdgeInsets.only(right: 10),
                      child: pw.Image(logoImage),
                    ),
                  pw.Expanded(
                    child: pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Row(
                          children: [
                            pw.Text('Rent', style: pw.TextStyle(font: boldFont, fontSize: 18, color: primaryGold)),
                            pw.Text('Veda', style: pw.TextStyle(font: boldFont, fontSize: 18, color: darkSlate)),
                            pw.SizedBox(width: 8),
                            pw.Container(
                              padding: const pw.EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: pw.BoxDecoration(
                                color: primaryGold,
                                borderRadius: pw.BorderRadius.circular(4),
                              ),
                              child: pw.Text(
                                'STATEMENT REPORT',
                                style: pw.TextStyle(font: boldFont, fontSize: 7, color: PdfColors.white),
                              ),
                            ),
                          ],
                        ),
                        pw.SizedBox(height: 2),
                        pw.Text(
                          companyName != null && companyName.isNotEmpty
                              ? companyName
                              : (userName != null && userName.isNotEmpty ? userName : 'कृषि मशीनरी रेंटल'),
                          style: pw.TextStyle(font: boldFont, fontSize: 11, color: textDark),
                        ),
                        if (userMobile != null && userMobile.isNotEmpty)
                          pw.Text('संचालक संपर्क: +91 $userMobile', style: pw.TextStyle(font: regularFont, fontSize: 8.5, color: textMuted)),
                      ],
                    ),
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text(
                        'हिसाब विवरण रिपोर्ट',
                        style: pw.TextStyle(font: boldFont, fontSize: 13, color: textDark),
                      ),
                      pw.SizedBox(height: 3),
                      pw.Text(
                        'दिनांक: ${DateFormat('dd MMM yyyy').format(DateTime.now())}',
                        style: pw.TextStyle(font: regularFont, fontSize: 8, color: textMuted),
                      ),
                      pw.Text(
                        'समय: ${DateFormat('hh:mm a').format(DateTime.now())}',
                        style: pw.TextStyle(font: regularFont, fontSize: 8, color: textMuted),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            pw.SizedBox(height: 10),

            // --- 2. REPORT FILTERS / METADATA ---
            pw.Container(
              padding: const pw.EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: pw.BoxDecoration(
                border: pw.Border.all(color: borderSlate, width: 0.8),
                borderRadius: pw.BorderRadius.circular(6),
              ),
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  _buildMetaItem('अवधि (Period)', '${DateFormat('dd-MM-yyyy').format(startDate)}  से  ${DateFormat('dd-MM-yyyy').format(endDate)}', boldFont, regularFont),
                  _buildMetaItem('मशीन (Machine)', machineName, boldFont, regularFont),
                  _buildMetaItem('फ़िल्टर (Status)', filterType == 'Paid' ? 'चुकाया गया (Paid)' : (filterType == 'Pending' ? 'बाकी (Pending)' : 'सभी (All)'), boldFont, regularFont),
                  _buildMetaItem('कुल रिकॉर्ड (Entries)', '${rentals.length} प्रविष्टियां', boldFont, regularFont),
                ],
              ),
            ),
            pw.SizedBox(height: 10),

            // --- 3. EXECUTIVE SUMMARY CARDS ---
            pw.Row(
              children: [
                _buildKpiCard('कुल एंट्रीज़', '${rentals.length}', primaryGold, darkSlate, boldFont, regularFont),
                pw.SizedBox(width: 8),
                _buildKpiCard('कुल बिल राशि', 'Rs. ${fmt(sumTotal)}', primaryGold, darkSlate, boldFont, regularFont),
                pw.SizedBox(width: 8),
                _buildKpiCard('कुल प्राप्त (जमा)', 'Rs. ${fmt(sumPaid)}', greenDark, greenDark, boldFont, regularFont),
                pw.SizedBox(width: 8),
                _buildKpiCard('कुल बकाया (बाकी)', 'Rs. ${fmt(sumPending)}', redDark, redDark, boldFont, regularFont),
              ],
            ),
            pw.SizedBox(height: 12),

            // --- 4. DATA TABLE ---
            pw.Table(
              border: pw.TableBorder.all(color: borderSlate, width: 0.6),
              columnWidths: const {
                0: pw.FixedColumnWidth(22), // #
                1: pw.FixedColumnWidth(54), // Date
                2: pw.FlexColumnWidth(2.0), // Customer
                3: pw.FixedColumnWidth(62), // Mobile
                4: pw.FlexColumnWidth(1.6), // Work
                5: pw.FixedColumnWidth(44), // Rent Type
                6: pw.FixedColumnWidth(42), // Price
                7: pw.FixedColumnWidth(40), // Qty
                8: pw.FixedColumnWidth(52), // Total
                9: pw.FixedColumnWidth(50), // Paid
                10: pw.FixedColumnWidth(50), // Pending
              },
              children: [
                // Header Row
                pw.TableRow(
                  decoration: const pw.BoxDecoration(color: darkSlate),
                  children: [
                    _th('#', boldFont),
                    _th('तारीख', boldFont),
                    _th('ग्राहक का नाम', boldFont, align: pw.TextAlign.left),
                    _th('मोबाइल', boldFont),
                    _th('काम का विवरण', boldFont, align: pw.TextAlign.left),
                    _th('प्रकार', boldFont),
                    _th('दर', boldFont, align: pw.TextAlign.right),
                    _th('मात्रा', boldFont, align: pw.TextAlign.right),
                    _th('कुल राशि', boldFont, align: pw.TextAlign.right),
                    _th('जमा', boldFont, align: pw.TextAlign.right),
                    _th('बाकी', boldFont, align: pw.TextAlign.right),
                  ],
                ),
                // Data Rows
                for (int i = 0; i < rentals.length; i++) ...[
                  () {
                    final r = rentals[i];
                    final dStr = r['createdAt']?.toString() ?? '';
                    final d = DateTime.tryParse(dStr);
                    final dateFormatted = d != null ? DateFormat('dd/MM/yy').format(d) : dStr;
                    final name = (r['customerName']?.toString() ?? 'N/A').replaceAll('\n', ' ');
                    final mobile = r['mobileNumber']?.toString() ?? '-';
                    final job = (r['jobWork']?.toString() ?? '-').replaceAll('\n', ' ');
                    final rType = r['rentType']?.toString() ?? 'Hour';
                    final price = double.tryParse(r['price']?.toString() ?? '') ?? 0.0;
                    final qty = double.tryParse(r['quantity']?.toString() ?? '') ?? 0.0;
                    final paid = double.tryParse(r['paidAmount']?.toString() ?? '') ?? 0.0;
                    final pending = double.tryParse(r['pendingAmount']?.toString() ?? '') ?? 0.0;
                    final rawTotal = double.tryParse(r['totalAmount']?.toString() ?? '') ?? 0.0;
                    final total = (paid + pending > 0) ? (paid + pending) : (rawTotal > 0 ? rawTotal : (price * qty));

                    final isEven = i % 2 == 0;
                    return pw.TableRow(
                      decoration: pw.BoxDecoration(color: isEven ? PdfColors.white : zebraBg),
                      children: [
                        _td('${i + 1}', regularFont),
                        _td(dateFormatted, regularFont),
                        _td(name, boldFont, align: pw.TextAlign.left),
                        _td(mobile, regularFont),
                        _td(job, regularFont, align: pw.TextAlign.left),
                        _td(rType, regularFont),
                        _td(fmt(price), regularFont, align: pw.TextAlign.right),
                        _td(qty % 1 == 0 ? qty.toInt().toString() : qty.toString(), regularFont, align: pw.TextAlign.right),
                        _td(fmt(total), boldFont, align: pw.TextAlign.right),
                        _td(fmt(paid), regularFont, color: greenDark, align: pw.TextAlign.right),
                        _td(fmt(pending), regularFont, color: pending > 0 ? redDark : textMuted, align: pw.TextAlign.right),
                      ],
                    );
                  }(),
                ],
                // Summary Total Row
                pw.TableRow(
                  decoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFFF1F5F9)),
                  children: [
                    pw.Container(
                      padding: const pw.EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                      child: pw.Text('कुल योग', style: pw.TextStyle(font: boldFont, fontSize: 8, color: darkSlate)),
                    ),
                    _td('', boldFont),
                    _td('', boldFont),
                    _td('', boldFont),
                    _td('', boldFont),
                    _td('', boldFont),
                    _td('', boldFont),
                    _td('', boldFont),
                    _td(fmt(sumTotal), boldFont, align: pw.TextAlign.right),
                    _td(fmt(sumPaid), boldFont, color: greenDark, align: pw.TextAlign.right),
                    _td(fmt(sumPending), boldFont, color: sumPending > 0 ? redDark : textMuted, align: pw.TextAlign.right),
                  ],
                ),
              ],
            ),
          ];
        },
      ),
    );

    return pdf.save();
  }

  static pw.Widget _buildMetaItem(String title, String value, pw.Font boldFont, pw.Font regularFont) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(title, style: pw.TextStyle(font: regularFont, fontSize: 7, color: const PdfColor.fromInt(0xFF64748B))),
        pw.SizedBox(height: 1),
        pw.Text(value, style: pw.TextStyle(font: boldFont, fontSize: 8.5, color: const PdfColor.fromInt(0xFF0F172A))),
      ],
    );
  }

  static pw.Widget _buildKpiCard(String label, String value, PdfColor borderColor, PdfColor textColor, pw.Font boldFont, pw.Font regularFont) {
    return pw.Expanded(
      child: pw.Container(
        padding: const pw.EdgeInsets.symmetric(vertical: 8, horizontal: 6),
        decoration: pw.BoxDecoration(
          color: const PdfColor.fromInt(0xFFF8FAFC),
          borderRadius: pw.BorderRadius.circular(6),
          border: pw.Border.all(color: borderColor, width: 0.9),
        ),
        child: pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Text(label, style: pw.TextStyle(font: regularFont, fontSize: 7, color: const PdfColor.fromInt(0xFF64748B))),
            pw.SizedBox(height: 2),
            pw.Text(value, style: pw.TextStyle(font: boldFont, fontSize: 10, color: textColor)),
          ],
        ),
      ),
    );
  }

  static pw.Widget _th(String text, pw.Font boldFont, {pw.TextAlign align = pw.TextAlign.center}) {
    return pw.Container(
      padding: const pw.EdgeInsets.symmetric(vertical: 6, horizontal: 3),
      alignment: align == pw.TextAlign.left ? pw.Alignment.centerLeft : (align == pw.TextAlign.right ? pw.Alignment.centerRight : pw.Alignment.center),
      child: pw.Text(
        text,
        textAlign: align,
        style: pw.TextStyle(font: boldFont, fontSize: 7.5, color: PdfColors.white),
      ),
    );
  }

  static pw.Widget _td(String text, pw.Font font, {PdfColor color = const PdfColor.fromInt(0xFF1E293B), pw.TextAlign align = pw.TextAlign.center}) {
    return pw.Container(
      padding: const pw.EdgeInsets.symmetric(vertical: 4, horizontal: 3),
      alignment: align == pw.TextAlign.left ? pw.Alignment.centerLeft : (align == pw.TextAlign.right ? pw.Alignment.centerRight : pw.Alignment.center),
      child: pw.Text(
        text,
        textAlign: align,
        style: pw.TextStyle(font: font, fontSize: 7.5, color: color),
      ),
    );
  }
}
