import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:path_provider/path_provider.dart';
import 'package:printing/printing.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../services/statement_pdf_service.dart';

class StatementPdfPreviewScreen extends StatefulWidget {
  final DateTime startDate;
  final DateTime endDate;
  final String machineName;
  final String filterType;
  final List<Map<String, dynamic>> rentals;
  final String? userName;
  final String? companyName;
  final String? userMobile;

  const StatementPdfPreviewScreen({
    super.key,
    required this.startDate,
    required this.endDate,
    required this.machineName,
    required this.filterType,
    required this.rentals,
    this.userName,
    this.companyName,
    this.userMobile,
  });

  @override
  State<StatementPdfPreviewScreen> createState() => _StatementPdfPreviewScreenState();
}

class _StatementPdfPreviewScreenState extends State<StatementPdfPreviewScreen> {
  Uint8List? _cachedPdfBytes;
  bool _isGenerating = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _generatePdfBytes();
  }

  Future<Uint8List?> _generatePdfBytes() async {
    if (_cachedPdfBytes != null) return _cachedPdfBytes;

    setState(() {
      _isGenerating = true;
      _errorMessage = null;
    });

    try {
      final bytes = await StatementPdfService.generateStatementPdf(
        startDate: widget.startDate,
        endDate: widget.endDate,
        machineName: widget.machineName,
        filterType: widget.filterType,
        rentals: widget.rentals,
        userName: widget.userName,
        companyName: widget.companyName,
        userMobile: widget.userMobile,
      );
      if (mounted) {
        setState(() {
          _cachedPdfBytes = bytes;
          _isGenerating = false;
        });
      }
      return bytes;
    } catch (e) {
      if (mounted) {
        setState(() {
          _isGenerating = false;
          _errorMessage = e.toString();
        });
      }
      return null;
    }
  }

  String get _fileName =>
      'RentVeda_Statement_${DateFormat('yyyyMMdd').format(widget.startDate)}_${DateFormat('yyyyMMdd').format(widget.endDate)}.pdf';

  Future<void> _sharePdf() async {
    if (_cachedPdfBytes == null) return;
    try {
      await Printing.sharePdf(bytes: _cachedPdfBytes!, filename: _fileName);
    } catch (e) {
      Fluttertoast.showToast(msg: 'शेयर करने में त्रुटि: $e', backgroundColor: AppColors.danger);
    }
  }

  Future<void> _downloadPdf() async {
    if (_cachedPdfBytes == null) return;
    try {
      Directory? dir;
      if (Platform.isAndroid) {
        // Try direct Download directory
        final downloadDir = Directory('/storage/emulated/0/Download');
        if (await downloadDir.exists()) {
          dir = downloadDir;
        } else {
          dir = await getExternalStorageDirectory() ?? await getApplicationDocumentsDirectory();
        }
      } else {
        dir = await getApplicationDocumentsDirectory();
      }

      final file = File('${dir.path}/$_fileName');
      await file.writeAsBytes(_cachedPdfBytes!);

      Fluttertoast.showToast(
        msg: 'PDF डाउनलोड हो गया!\nफ़ाइल: $_fileName',
        backgroundColor: AppColors.successDark,
        toastLength: Toast.LENGTH_LONG,
      );
    } catch (e) {
      // Fallback: use Printing.sharePdf
      await Printing.sharePdf(bytes: _cachedPdfBytes!, filename: _fileName);
    }
  }

  Future<void> _printPdf() async {
    if (_cachedPdfBytes == null) return;
    try {
      await Printing.layoutPdf(onLayout: (format) => _cachedPdfBytes!);
    } catch (e) {
      Fluttertoast.showToast(msg: 'प्रिंट करने में त्रुटि: $e', backgroundColor: AppColors.danger);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateSubtitle =
        '${DateFormat('dd MMM').format(widget.startDate)} - ${DateFormat('dd MMM yyyy').format(widget.endDate)}';

    return Scaffold(
      backgroundColor: const Color(0xFF1E293B),
      appBar: AppBar(
        backgroundColor: AppColors.bgSurface,
        elevation: 1,
        shadowColor: Colors.black.withValues(alpha: 0.05),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textMain, size: 22),
          onPressed: () => Navigator.pop(context),
        ),
        titleSpacing: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tr('statementPreviewTitle') == 'statementPreviewTitle' ? 'स्टेटमेंट प्रीव्यू' : tr('statementPreviewTitle'),
              style: AppTypography.cardHeader.copyWith(fontSize: 16),
            ),
            Text(
              dateSubtitle,
              style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted),
            ),
          ],
        ),
        actions: [
          // 1. Compact Share Button
          IconButton(
            tooltip: 'शेयर करें (Share)',
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primaryGold.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.share_rounded, size: 18, color: AppColors.primaryGold),
            ),
            onPressed: _cachedPdfBytes != null ? _sharePdf : null,
          ),

          // 2. Compact Download Button
          IconButton(
            tooltip: 'डाउनलोड (Save PDF)',
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF16A34A).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.file_download_outlined, size: 18, color: Color(0xFF16A34A)),
            ),
            onPressed: _cachedPdfBytes != null ? _downloadPdf : null,
          ),

          // 3. Compact Print Button
          IconButton(
            tooltip: 'प्रिंट (Print)',
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.textMain.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.print_outlined, size: 18, color: AppColors.textMain),
            ),
            onPressed: _cachedPdfBytes != null ? _printPdf : null,
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: _isGenerating
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircularProgressIndicator(color: AppColors.primaryGold),
                  const SizedBox(height: 16),
                  Text(
                    tr('generatingPdf') == 'generatingPdf' ? 'पीडीएफ तैयार हो रही है...' : tr('generatingPdf'),
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],
              ),
            )
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.danger),
                        const SizedBox(height: 12),
                        Text(
                          'PDF बनाने में त्रुटि:\n$_errorMessage',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () => _generatePdfBytes(),
                          icon: const Icon(Icons.refresh, size: 16),
                          label: const Text('पुनः प्रयास करें'),
                        ),
                      ],
                    ),
                  ),
                )
              : PdfPreview(
                  build: (format) => _cachedPdfBytes!,
                  canChangeOrientation: false,
                  canChangePageFormat: false,
                  canDebug: false,
                  allowSharing: false, // Clean full screen without duplicate bottom bars
                  allowPrinting: false, // Clean full screen without duplicate bottom bars
                  pdfFileName: _fileName,
                  maxPageWidth: 700,
                  previewPageMargin: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
                  loadingWidget: const Center(
                    child: CircularProgressIndicator(color: AppColors.primaryGold),
                  ),
                ),
    );
  }
}
