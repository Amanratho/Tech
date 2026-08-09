import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';

class ClientListItem extends StatelessWidget {
  final Map<String, dynamic> user;
  final VoidCallback onTap;

  const ClientListItem({
    super.key,
    required this.user,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final name = user['customerName'] ?? tr('Unknown');
    final mobile = user['mobileNumber']?.toString() ?? '';
    final pendingAmount = (user['pendingAmount'] ?? 0).toDouble();

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12), // p-3
        decoration: BoxDecoration(
          color: Colors.white, // bg-white
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(12), // rounded-xl
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 40, // w-10
                  height: 40, // h-10
                  decoration: BoxDecoration(
                    color: AppColors.bgMain,
                    border: Border.all(color: AppColors.border),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.person, size: 16, color: AppColors.textMuted), // FaUser
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        fontSize: 14, // text-sm
                        fontWeight: FontWeight.bold, // font-bold
                        color: AppColors.textMain, // text-main
                      ),
                    ),
                    const SizedBox(height: 2), // mt-0.5
                    GestureDetector(
                      // We don't have openPhoneDialer here, but we match the UI
                      onTap: () {},
                      child: Row(
                        children: [
                          const Icon(Icons.phone, size: 10, color: Colors.green), // text-green-500
                          const SizedBox(width: 6), // gap-1.5
                          Text(
                            mobile,
                            style: const TextStyle(
                              fontSize: 11, // text-[11px]
                              color: AppColors.textMuted, // text-muted
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            if (pendingAmount > 0)
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'PENDING', // text-[10px] font-bold text-red-500 uppercase tracking-wider
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 2), // mb-0.5
                  Text(
                    '₹${NumberFormat('#,##,###').format(pendingAmount.toInt())}',
                    style: TextStyle(
                      fontSize: 14, // text-sm
                      fontWeight: FontWeight.w900, // font-black
                      color: Colors.red.shade700, // text-red-600
                    ),
                  ),
                ],
              )
            else
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), // px-2 py-1
                decoration: BoxDecoration(
                  color: Colors.green.shade50, // bg-green-50
                  borderRadius: BorderRadius.circular(8), // rounded-lg
                  border: Border.all(color: Colors.green.shade200), // border-green-200
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, size: 10, color: Colors.green.shade600), // text-green-600
                    const SizedBox(width: 4), // gap-1
                    Text(
                      'FULLY PAID', // text-[10px] font-bold uppercase tracking-wider
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.green.shade600,
                        letterSpacing: 1.0,
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
