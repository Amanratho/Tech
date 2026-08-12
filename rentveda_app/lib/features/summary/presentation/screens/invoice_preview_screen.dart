import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../profile/providers/profile_provider.dart';
import '../../../invoice/presentation/widgets/formal_invoice_template.dart';

class InvoicePreviewScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> bill;

  const InvoicePreviewScreen({super.key, required this.bill});

  @override
  ConsumerState<InvoicePreviewScreen> createState() => _InvoicePreviewScreenState();
}

class _InvoicePreviewScreenState extends ConsumerState<InvoicePreviewScreen> {
  final GlobalKey _globalKey = GlobalKey();
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profileState = ref.read(profileProvider);
      if (profileState.userData == null) {
        ref.read(profileProvider.notifier).fetchProfile();
      }
    });
  }

  Future<File?> _generateImageFile() async {
    try {
      // Find the render object
      RenderRepaintBoundary boundary = _globalKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
      // Convert to image
      ui.Image image = await boundary.toImage(pixelRatio: 3.0);
      ByteData? byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      
      if (byteData == null) return null;
      
      Uint8List pngBytes = byteData.buffer.asUint8List();

      // Save to temp directory
      final directory = await getTemporaryDirectory();
      final String fileName = 'Invoice_${widget.bill['customerName']?.toString().replaceAll(' ', '_') ?? 'RentVeda'}_${DateTime.now().millisecondsSinceEpoch}.png';
      File imgFile = File('${directory.path}/$fileName');
      await imgFile.writeAsBytes(pngBytes);
      return imgFile;
    } catch (e) {
      debugPrint("Error generating image: $e");
      return null;
    }
  }

  Future<void> _handleDownload() async {
    setState(() => _isProcessing = true);
    final file = await _generateImageFile();
    setState(() => _isProcessing = false);

    if (file != null && mounted) {
      // Save it to a visible Downloads directory on Android
      try {
        Directory? downloadDir;
        if (Platform.isAndroid) {
          downloadDir = Directory('/storage/emulated/0/Download');
          if (!await downloadDir.exists()) {
            downloadDir = await getExternalStorageDirectory();
          }
        } else {
          downloadDir = await getApplicationDocumentsDirectory();
        }
        
        final finalPath = '${downloadDir!.path}/${file.path.split('/').last}';
        await file.copy(finalPath);
        
        Fluttertoast.showToast(
          msg: 'Invoice saved to Downloads!',
          backgroundColor: AppColors.successDark,
        );
      } catch (e) {
        Fluttertoast.showToast(msg: 'Failed to save invoice', backgroundColor: AppColors.danger);
      }
    } else if (mounted) {
      Fluttertoast.showToast(msg: 'Failed to generate invoice', backgroundColor: AppColors.danger);
    }
  }

  Future<void> _handleShare() async {
    setState(() => _isProcessing = true);
    final file = await _generateImageFile();
    setState(() => _isProcessing = false);

    if (file != null) {
      await Share.shareXFiles(
        [XFile(file.path)],
        text: 'Invoice from RentVeda for ${widget.bill['customerName'] ?? 'Customer'}',
      );
    } else {
      Fluttertoast.showToast(msg: 'Failed to generate invoice', backgroundColor: AppColors.danger);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    final userData = profileState.userData;

    // Derived properties
    final machineName = widget.bill['machineName']?.toString() ?? 'Rental Service';
    final rawDate = widget.bill['createdAt']?.toString() ?? DateTime.now().toIso8601String();
    DateTime parsedDate;
    try {
      parsedDate = DateTime.parse(rawDate);
    } catch (_) {
      parsedDate = DateTime.now();
    }
    final formattedDate = DateFormat('dd MMM yyyy').format(parsedDate);

    final paidAmount = (widget.bill['paidAmount'] ?? 0).toDouble();
    final pendingAmount = (widget.bill['pendingAmount'] ?? 0).toDouble();
    final totalAmount = paidAmount + pendingAmount;

    return Scaffold(
      backgroundColor: Colors.grey.shade900,
      appBar: AppBar(
        backgroundColor: AppColors.bgMain,
        elevation: 0,
        title: Text(
          'Invoice Preview',
          style: AppTypography.cardHeader,
        ),
        iconTheme: const IconThemeData(color: AppColors.textMain),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Preview Area
            Expanded(
              child: InteractiveViewer(
                boundaryMargin: const EdgeInsets.all(40),
                minScale: 0.5,
                maxScale: 4.0,
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: FittedBox(
                      fit: BoxFit.contain,
                      child: RepaintBoundary(
                        key: _globalKey,
                        child: Material(
                          color: Colors.white,
                          elevation: 10,
                          child: FormalInvoiceTemplate(
                            user: userData,
                            entryData: widget.bill,
                            machineName: machineName,
                            formattedDate: formattedDate,
                            totalAmount: totalAmount,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Bottom Actions
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: AppColors.bgSurface,
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _isProcessing ? null : _handleDownload,
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        side: const BorderSide(color: AppColors.border),
                      ),
                      child: _isProcessing
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.download, size: 18),
                                const SizedBox(width: 8),
                                Text('Download', style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600)),
                              ],
                            ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isProcessing ? null : _handleShare,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: AppColors.textMain,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                      ),
                      child: _isProcessing
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.textMain))
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.share, size: 18),
                                const SizedBox(width: 8),
                                Text('Share', style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600)),
                              ],
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
