import 'dart:ui' as ui;
import 'dart:io';
import 'package:flutter/rendering.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:whatsapp_share_plus/whatsapp_share_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/network/api_client.dart';
import '../widgets/formal_invoice_template.dart';

class InvoiceScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> extra;
  
  const InvoiceScreen({super.key, required this.extra});

  @override
  ConsumerState<InvoiceScreen> createState() => _InvoiceScreenState();
}

class _InvoiceScreenState extends ConsumerState<InvoiceScreen> {
  late Map<String, dynamic> _entryData;
  late String _machineName;
  
  Map<String, dynamic>? _user;
  final GlobalKey _invoiceKey = GlobalKey();
  // Track which button is loading: null = none, 'download', 'share', 'whatsapp'
  String? _activeAction;
  
  @override
  void initState() {
    super.initState();
    _entryData = widget.extra['entryData'] ?? {};
    _machineName = widget.extra['machineName'] ?? 'Machine';
    
    _fetchUser();
  }

  Future<void> _fetchUser() async {
    try {
      final apiClient = ref.read(apiClientProvider);
      final uid = await apiClient.secureStorage.read(key: 'uid');
      if (uid != null) {
        final response = await apiClient.dio.get('/users/$uid');
        if (mounted) {
          setState(() {
            _user = response.data;
          });
        }
      }
    } catch (e) {
      debugPrint('Failed to fetch user profile in Invoice: $e');
    }
  }

  Future<File?> _generateImageFile() async {
    try {
      RenderRepaintBoundary boundary = _invoiceKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
      ui.Image image = await boundary.toImage(pixelRatio: 3.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      
      if (byteData == null) return null;
      
      final pngBytes = byteData.buffer.asUint8List();
      final directory = await getTemporaryDirectory();
      final imagePath = '${directory.path}/Invoice_${_entryData['customerName']?.toString().replaceAll(' ', '_') ?? 'Customer'}_${DateTime.now().millisecondsSinceEpoch}.png';
      final file = File(imagePath);
      await file.writeAsBytes(pngBytes);
      return file;
    } catch (e) {
      debugPrint('Error generating image: $e');
      return null;
    }
  }

  Future<void> _handleDownload() async {
    if (_activeAction != null) return;
    setState(() => _activeAction = 'download');
    final file = await _generateImageFile();

    if (file != null && mounted) {
      try {
        Directory? downloadDir;
        if (Platform.isAndroid) {
          try {
            final publicDownload = Directory('/storage/emulated/0/Download');
            if (await publicDownload.exists()) {
              downloadDir = publicDownload;
            }
          } catch (_) {}
          downloadDir ??= await getExternalStorageDirectory() ?? await getApplicationDocumentsDirectory();
        } else {
          downloadDir = await getApplicationDocumentsDirectory();
        }
        
        final fileName = file.path.split(RegExp(r'[/\\]')).last;
        final finalPath = '${downloadDir.path}/$fileName';
        await file.copy(finalPath);
        
        Fluttertoast.showToast(
          msg: tr('invoiceSavedSuccess'),
          backgroundColor: AppColors.successDark,
        );
      } catch (e) {
        Fluttertoast.showToast(msg: tr('invoiceSaveFailed'), backgroundColor: AppColors.danger);
      }
    } else if (mounted) {
      Fluttertoast.showToast(msg: tr('invoiceGenerateFailed'), backgroundColor: AppColors.danger);
    }
    if (mounted) setState(() => _activeAction = null);
  }

  Future<void> _shareOnWhatsApp(Map<String, dynamic>? user, {bool directToWhatsApp = false}) async {
    if (_activeAction != null) return;
    setState(() => _activeAction = directToWhatsApp ? 'whatsapp' : 'share');
    
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    
    try {
      final file = await _generateImageFile();
      if (file == null) throw Exception("Could not generate image file");

      final customerName = _entryData['customerName'] ?? 'Customer';
      final pendingAmount = _entryData['pendingAmount'] ?? 0;
      final companyName = user?['companyName'] ?? 'Our Company';
      
      final message = tr('whatsappInvoiceGreeting', namedArgs: {'customer': customerName}) +
                      tr('whatsappInvoiceBody', namedArgs: {
                        'companyName': companyName,
                        'machineName': _machineName,
                        'jobWork': _entryData['jobWork'] ?? 'N/A',
                        'pendingAmount': pendingAmount.toString()
                      });
      
      if (directToWhatsApp) {
        String phone = _entryData['mobileNumber']?.toString() ?? '';
        if (phone.startsWith('+')) {
          phone = phone.substring(1);
        } else if (phone.length == 10) {
          phone = '91$phone';
        }
        await WhatsappSharePlus.shareImageToWhatsapp(
          imagePath: file.path,
          text: message,
          phone: phone,
        );
      } else {
        // ignore: deprecated_member_use
        await Share.shareXFiles([XFile(file.path)], text: message);
      }
    } catch (e) {
      debugPrint('Failed to share invoice: $e');
      scaffoldMessenger.showSnackBar(SnackBar(content: Text(tr('whatsappShareFailed'))));
    } finally {
      if (mounted) setState(() => _activeAction = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_entryData.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.bgMain,
        body: Center(child: Text(tr('noDataFound'), style: AppTypography.bodySecondary)),
      );
    }

    final currentDate = DateTime.now();
    final formattedDate = DateFormat('dd MMM yyyy').format(currentDate);
    final totalAmount = (double.tryParse(_entryData['paidAmount'].toString()) ?? 0) + 
                        (double.tryParse(_entryData['pendingAmount'].toString()) ?? 0);

    return Scaffold(
      backgroundColor: Colors.grey.shade900,
      appBar: AppBar(
        backgroundColor: AppColors.bgMain,
        elevation: 0,
        title: Text(
          tr('invoiceGenerated'),
          style: AppTypography.cardHeader,
        ),
        iconTheme: const IconThemeData(color: AppColors.textMain),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Invoice Preview Area
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
                        key: _invoiceKey,
                        child: Material(
                          color: Colors.white,
                          elevation: 10,
                          child: FormalInvoiceTemplate(
                            user: _user,
                            entryData: _entryData,
                            machineName: _machineName,
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
              child: Column(
                children: [
                  Row(
                    children: [
                      // Download
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _activeAction != null ? null : _handleDownload,
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            side: const BorderSide(color: AppColors.border),
                          ),
                          child: _activeAction == 'download'
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.download, size: 18),
                                    const SizedBox(width: 4),
                                    Text(tr('downloadBtn'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600, fontSize: 13)),
                                  ],
                                ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Share
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _activeAction != null ? null : () => _shareOnWhatsApp(_user, directToWhatsApp: false),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: AppColors.textMain,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: _activeAction == 'share'
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.textMain))
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.share, size: 18),
                                    const SizedBox(width: 4),
                                    Text(tr('shareBtn'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600, fontSize: 13)),
                                  ],
                                ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // WhatsApp
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _activeAction != null ? null : () => _shareOnWhatsApp(_user, directToWhatsApp: true),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF25D366),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: _activeAction == 'whatsapp'
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(Icons.chat, size: 18),
                                    const SizedBox(width: 4),
                                    Text(tr('whatsappBtn'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w600, fontSize: 13, color: Colors.white)),
                                  ],
                                ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Back to Home
                  SizedBox(
                    width: double.infinity,
                    child: TextButton(
                      onPressed: () => context.go('/home'),
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(tr('backToHome'), style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w700, color: AppColors.primaryDark)),
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
