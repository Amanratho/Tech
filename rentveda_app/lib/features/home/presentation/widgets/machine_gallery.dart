import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';

class MachineGallery extends StatelessWidget {
  final List<dynamic> machines;
  final VoidCallback? onAddTap;

  const MachineGallery({super.key, required this.machines, this.onAddTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tr('exploreMachines'),
                    style: AppTypography.sectionHeader,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${machines.length} ${tr('machinesCount')}',
                    style: AppTypography.bodySecondary,
                  ),
                ],
              ),
              Row(
                children: [
                  _iconButton(Icons.search, onTap: () {}),
                  const SizedBox(width: 8),
                  if (machines.isNotEmpty)
                    _iconButton(Icons.add, isPrimary: true, onTap: onAddTap),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Machine cards or empty state
        if (machines.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GestureDetector(
              onTap: onAddTap,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 32),
                decoration: BoxDecoration(
                  color: AppColors.bgSurface,
                  border: Border.all(color: AppColors.border, width: 2, strokeAlign: BorderSide.strokeAlignInside),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.primaryGoldBg,
                        border: Border.all(color: AppColors.warning.withValues(alpha: 0.4)),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.add, size: 22, color: AppColors.primaryGold),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      tr('addYourMachine'),
                      style: AppTypography.cardHeader,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      tr('addMachine'),
                      style: AppTypography.bodySecondary,
                    ),
                  ],
                ),
              ),
            ),
          )
        else
          SizedBox(
            height: 190,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: machines.length + 1, // +1 for "Add New" card
              separatorBuilder: (context, index) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                if (index == machines.length) {
                  // "Add New" card at end
                  return GestureDetector(
                    onTap: onAddTap,
                    child: Container(
                      width: 155,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: const Color(0xFFE2E2E2), width: 2, strokeAlign: BorderSide.strokeAlignInside),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFFDF0),
                              border: Border.all(color: const Color(0xFFFBC02D).withValues(alpha: 0.4)),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.add, size: 16, color: Color(0xFF795900)),
                          ),
                          const SizedBox(height: 8),
                          Text(tr('addMachineButton').toUpperCase(), style: AppTypography.badgeText.copyWith(fontSize: 12, color: AppColors.textDarkBrown)),
                        ],
                      ),
                    ),
                  );
                }

                final machine = machines[index];
                final name = machine['Machine_name'] ?? 'Machine';
                final rentType = machine['RentType'] ?? 'Rate';
                final image = machine['image'];

                return GestureDetector(
                  onTap: () {
                    // Navigate to start-entry with machine data
                  },
                  child: Container(
                    width: 155,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4)],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        // Image or placeholder
                        if (image != null && image.toString().isNotEmpty)
                          Image.network(
                            image,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => _machinePlaceholder(),
                          )
                        else
                          _machinePlaceholder(),

                        // Gradient overlay
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                Colors.black.withValues(alpha: 0.4),
                                Colors.black.withValues(alpha: 0.9),
                              ],
                            ),
                          ),
                        ),

                        // Bottom info
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(name,
                                  style: AppTypography.cardHeader.copyWith(fontSize: 14, color: Colors.white),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.2),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        rentType,
                                        style: AppTypography.caption.copyWith(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                                      ),
                                    ),
                                    Container(
                                      width: 24,
                                      height: 24,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFFFBC02D),
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.chevron_right, size: 14, color: Color(0xFF6C5000)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }

  Widget _machinePlaceholder() {
    return Container(
      color: const Color(0xFFF3F4F6),
      child: const Center(
        child: Icon(Icons.agriculture, size: 36, color: Color(0xFFC5C5C5)),
      ),
    );
  }

  Widget _iconButton(IconData icon, {bool isPrimary = false, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: isPrimary ? const Color(0xFFFBC02D) : Colors.white,
          border: Border.all(color: isPrimary ? const Color(0xFFFBC02D) : const Color(0xFFE2E2E2)),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4)],
        ),
        child: Icon(icon, size: 14, color: isPrimary ? const Color(0xFF6C5000) : const Color(0xFF4F4633)),
      ),
    );
  }
}
