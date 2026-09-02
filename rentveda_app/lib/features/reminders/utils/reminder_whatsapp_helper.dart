import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../../../core/theme/app_colors.dart';
import '../../profile/providers/profile_provider.dart';

class ReminderWhatsAppHelper {
  static Future<void> sendReminder({
    required BuildContext context,
    required WidgetRef ref,
    required Map<String, dynamic> reminder,
  }) async {
    try {
      String phone = (reminder['customerMobile'] ?? reminder['mobileNumber'] ?? '').toString().trim();
      phone = phone.replaceAll(RegExp(r'[^\d+]'), '');

      if (phone.isEmpty) {
        Fluttertoast.showToast(msg: tr('couldNotLaunchDialer'), backgroundColor: AppColors.danger);
        return;
      }

      if (phone.startsWith('+')) {
        phone = phone.substring(1);
      } else if (phone.length == 10) {
        phone = '91$phone';
      }

      String formattedDate = '';
      final dateStr = reminder['reminderDate']?.toString();
      if (dateStr != null && dateStr.isNotEmpty) {
        final d = DateTime.tryParse(dateStr);
        if (d != null) {
          formattedDate = DateFormat('dd MMM yyyy').format(d);
        }
      }
      if (formattedDate.isEmpty) {
        formattedDate = tr('reminderStatusDueToday');
      }

      final profileState = ref.read(profileProvider);
      final companyName = profileState.userData?['companyName']?.toString().trim();
      final effectiveCompanyName = (companyName != null && companyName.isNotEmpty)
          ? companyName
          : (profileState.userData?['username']?.toString().trim() ?? 'RentVeda');

      final customerName = reminder['customerName']?.toString().trim() ?? tr('reminderModalCustomer');
      final pendingAmount = reminder['pendingAmount']?.toString() ?? '0';

      final greeting = tr('whatsappReminderGreeting', namedArgs: {'customer': customerName});
      final body = tr('whatsappReminderBody', namedArgs: {
        'companyName': effectiveCompanyName,
        'pendingAmount': pendingAmount,
        'dueDate': formattedDate,
      });
      final message = '$greeting$body';

      final Uri whatsappAppUri = Uri.parse("whatsapp://send?phone=$phone&text=${Uri.encodeComponent(message)}");
      final Uri whatsappWebUri = Uri.parse("https://wa.me/$phone?text=${Uri.encodeComponent(message)}");

      if (await canLaunchUrl(whatsappAppUri)) {
        await launchUrl(whatsappAppUri, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(whatsappWebUri)) {
        await launchUrl(whatsappWebUri, mode: LaunchMode.externalApplication);
      } else {
        Fluttertoast.showToast(msg: tr('whatsappNotInstalled'), backgroundColor: AppColors.danger);
      }
    } catch (e) {
      debugPrint('Error opening WhatsApp: $e');
      Fluttertoast.showToast(msg: tr('whatsappShareFailed'), backgroundColor: AppColors.danger);
    }
  }
}
