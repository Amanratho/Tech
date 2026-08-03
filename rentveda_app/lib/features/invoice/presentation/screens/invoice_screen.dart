import 'dart:ui' as ui;
import 'dart:io';
import 'package:flutter/rendering.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../auth/providers/auth_provider.dart';
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
  bool _isGenerating = false;
  
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

  Future<void> _shareOnWhatsApp(Map<String, dynamic>? user) async {
    if (_isGenerating) return;
    setState(() => _isGenerating = true);
    
    // Store localized strings before async gaps
    final langCode = context.locale.languageCode;
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    
    try {
      // 1. Capture the Widget as an Image
      RenderRepaintBoundary boundary = _invoiceKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
      ui.Image image = await boundary.toImage(pixelRatio: 2.0); // High quality
      
      // 2. Convert to ByteData (PNG)
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      final pngBytes = byteData!.buffer.asUint8List();
      
      // 3. Save to Temporary Directory
      final directory = await getTemporaryDirectory();
      final imagePath = '${directory.path}/Invoice_${_entryData['customerName']}_${DateTime.now().millisecondsSinceEpoch}.png';
      final file = File(imagePath);
      await file.writeAsBytes(pngBytes);
      
      // 4. Create the WhatsApp Message Text
      final customerName = _entryData['customerName'] ?? 'Customer';
      final pendingAmount = _entryData['pendingAmount'] ?? 0;
      final companyName = user?['companyName'] ?? 'Our Company';
      
      final greeting = langCode == 'hi' ? 'नमस्ते' : 'Hello';
      final bodyText = langCode == 'hi'
          ? 'यहाँ $companyName से आपका बिल संलग्न है:\n\nमशीन: $_machineName\nकार्य: ${_entryData['jobWork'] ?? 'N/A'}\nकुल बकाया राशि: ₹$pendingAmount\n\nधन्यवाद!'
          : 'Here is your bill attached from $companyName:\n\nMachine: $_machineName\nWork: ${_entryData['jobWork'] ?? 'N/A'}\nTotal Due: ₹$pendingAmount\n\nThank you!';

      final message = '$greeting $customerName,\n\n$bodyText';
      
      // 5. Share via Native Share Sheet (Works perfectly for WhatsApp with images)
      // ignore: deprecated_member_use
      await Share.shareXFiles([XFile(imagePath)], text: message);

    } catch (e) {
      debugPrint('Failed to generate or share invoice image: $e');
      scaffoldMessenger.showSnackBar(SnackBar(content: Text('Failed to share invoice: $e')));
    } finally {
      if (mounted) setState(() => _isGenerating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = _user;
    
    if (_entryData.isEmpty) {
      return Scaffold(
        backgroundColor: AppColors.bgMain,
        body: Center(child: Text('No data found!', style: AppTypography.bodySecondary)),
      );
    }

    final currentDate = DateTime.now();
    final formattedDate = DateFormat('dd/MM/yyyy').format(currentDate);
    final totalAmount = (double.tryParse(_entryData['paidAmount'].toString()) ?? 0) + 
                        (double.tryParse(_entryData['pendingAmount'].toString()) ?? 0);

    return Scaffold(
      backgroundColor: AppColors.bgMain,
      appBar: AppBar(
        backgroundColor: AppColors.bgSurface,
        elevation: 1,
        shadowColor: Colors.black.withValues(alpha: 0.1),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textMain, size: 20),
          onPressed: () {
            // We want to go back to Home (reset the stack so back button doesn't take us back to form)
            context.go('/home');
          },
        ),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(tr('invoice').toUpperCase(), style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 10, letterSpacing: 1.2)),
            Row(
              children: [
                const Icon(Icons.receipt_long, size: 14, color: AppColors.primary),
                const SizedBox(width: 4),
                Text('#${currentDate.millisecondsSinceEpoch.toString().substring(7)}', style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 10)),
              ],
            )
          ],
        ),
      ),
      body: Stack(
        children: [
          // 1. HIDDEN FORMAL TEMPLATE (Rendered at bottom layer)
          Positioned(
            left: 0,
            top: 0,
            child: IgnorePointer(
              child: RepaintBoundary(
                key: _invoiceKey,
                child: FormalInvoiceTemplate(
                  user: user,
                  entryData: _entryData,
                  machineName: _machineName,
                  formattedDate: formattedDate,
                  totalAmount: totalAmount,
                ),
              ),
            ),
          ),
          
          // 2. VISIBLE MOBILE UI (Covers the template with solid background)
          Positioned.fill(
            child: Container(
              color: AppColors.bgMain, // Ensures hidden template is not visible
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
            // Cards: From and Bill To
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // FROM
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.bgSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('FROM', style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 9, letterSpacing: 1.2)),
                        const SizedBox(height: 6),
                        Text(user?['companyName'] ?? tr('companyName'), style: AppTypography.cardHeader.copyWith(fontSize: 14)),
                        const SizedBox(height: 4),
                        Text(user?['username'] ?? '...', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                        Text('+91 ${user?['mobileNo'] ?? '---'}', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // BILL TO
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.bgSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('BILL TO', style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 9, letterSpacing: 1.2)),
                        const SizedBox(height: 6),
                        Text(_entryData['customerName'] ?? 'N/A', style: AppTypography.cardHeader.copyWith(fontSize: 14, color: AppColors.primaryDark)),
                        const SizedBox(height: 4),
                        Text(_entryData['address'] ?? 'No Address', style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
                        Text('+91 ${_entryData['mobileNumber'] ?? '---'}', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // WORK DETAILS
            Container(
              decoration: BoxDecoration(
                color: AppColors.bgSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: const BoxDecoration(
                      color: AppColors.bgMain,
                      border: Border(bottom: BorderSide(color: AppColors.border)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Job Details', style: AppTypography.bodyMain.copyWith(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                        Text(formattedDate, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                  
                  // Body
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_machineName, style: AppTypography.cardHeader),
                        const SizedBox(height: 4),
                        Text('Job: ${_entryData['jobWork'] ?? '---'} • Op: ${_entryData['operatorName'] ?? '---'}', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                        
                        const SizedBox(height: 12),
                        const Divider(height: 1, color: AppColors.border),
                        const SizedBox(height: 12),
                        
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                children: [
                                  Text('WORK', style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 9)),
                                  const SizedBox(height: 4),
                                  Text('${_entryData['quantity']} ${_entryData['rentType']}', style: AppTypography.bodyMain.copyWith(fontSize: 12, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                            Container(width: 1, height: 30, color: AppColors.border),
                            Expanded(
                              child: Column(
                                children: [
                                  Text('RATE', style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 9)),
                                  const SizedBox(height: 4),
                                  Text('₹${_entryData['price']}', style: AppTypography.bodyMain.copyWith(fontSize: 12, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                            Container(width: 1, height: 30, color: AppColors.border),
                            Expanded(
                              child: Column(
                                children: [
                                  Text('AMOUNT', style: AppTypography.badgeText.copyWith(color: AppColors.textMuted, fontSize: 9)),
                                  const SizedBox(height: 4),
                                  Text('₹$totalAmount', style: AppTypography.bodyMain.copyWith(fontSize: 12, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: 12),
                        const Divider(height: 1, color: AppColors.border),
                        const SizedBox(height: 12),
                        
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: AppColors.successBg, borderRadius: BorderRadius.circular(6)),
                              child: Row(
                                children: [
                                  const Icon(Icons.check_circle, size: 12, color: AppColors.successDark),
                                  const SizedBox(width: 4),
                                  Text('Paid: ₹${_entryData['paidAmount']}', style: AppTypography.caption.copyWith(color: AppColors.successDark, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: AppColors.dangerBg, borderRadius: BorderRadius.circular(6)),
                              child: Row(
                                children: [
                                  const Icon(Icons.error, size: 12, color: AppColors.dangerDark),
                                  const SizedBox(width: 4),
                                  Text('Due: ₹${_entryData['pendingAmount']}', style: AppTypography.caption.copyWith(color: AppColors.dangerDark, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // NO QR NOTICE
            if (user != null && (user['qrCodeUrl'] == null || user['qrCodeUrl'].isEmpty))
              GestureDetector(
                onTap: () => context.push('/profile'),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGoldBg,
                    border: Border.all(color: AppColors.warning.withValues(alpha: 0.4)),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.primaryGold,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.qr_code, color: AppColors.textMain, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(tr('noQrNoticeTitle'), style: AppTypography.cardHeader.copyWith(fontSize: 12)),
                            Text(tr('noQrNoticeMsg'), style: AppTypography.caption.copyWith(color: AppColors.textDarkBrown, fontSize: 10)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGold,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(tr('uploadNow'), style: AppTypography.badgeText.copyWith(color: AppColors.textMain, fontSize: 9)),
                      )
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 24),
            
            // ACTION BUTTONS
            ElevatedButton(
              onPressed: () => _shareOnWhatsApp(user),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF25D366),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                elevation: 2,
              ),
              child: _isGenerating
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.chat, size: 18),
                        const SizedBox(width: 8),
                        Text('Share on WhatsApp', style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w800, color: Colors.white)),
                      ],
                    ),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => context.go('/home'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                side: const BorderSide(color: AppColors.borderFocus),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Back to Home', style: AppTypography.bodyMain.copyWith(fontWeight: FontWeight.w700, color: AppColors.textMain)),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  ),
],
),
    );
  }
}
