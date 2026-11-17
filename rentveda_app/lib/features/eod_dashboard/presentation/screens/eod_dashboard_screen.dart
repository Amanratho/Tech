import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../core/theme/app_colors.dart';
import '../../providers/eod_dashboard_provider.dart';

class EodDashboardScreen extends ConsumerStatefulWidget {
  const EodDashboardScreen({super.key});

  @override
  ConsumerState<EodDashboardScreen> createState() => _EodDashboardScreenState();
}

class _EodDashboardScreenState extends ConsumerState<EodDashboardScreen> {
  String _activeFilter = 'today';
  DateTime? _customStart;
  DateTime? _customEnd;
  bool _showCustomPicker = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _fetchForFilter('today');
      }
    });
  }

  String _formatDate(DateTime date) {
    return date.toIso8601String().split('T')[0];
  }

  void _fetchForFilter(String filterId) {
    final now = DateTime.now();
    String start = '';
    String end = '';

    if (filterId == 'today') {
      start = _formatDate(now);
      end = _formatDate(now);
    } else if (filterId == 'yesterday') {
      final yest = now.subtract(const Duration(days: 1));
      start = _formatDate(yest);
      end = _formatDate(yest);
    } else if (filterId == 'week') {
      final day = now.weekday; // 1 = Mon, 7 = Sun
      final monday = now.subtract(Duration(days: day - 1));
      start = _formatDate(monday);
      end = _formatDate(now);
    } else if (filterId == 'month') {
      final first = DateTime(now.year, now.month, 1);
      start = _formatDate(first);
      end = _formatDate(now);
    }

    if (mounted && start.isNotEmpty && end.isNotEmpty) {
      ref.read(eodDashboardProvider.notifier).fetchSummary(start, end);
    }
  }

  void _handleQuickFilter(String filterId) {
    setState(() => _activeFilter = filterId);
    if (filterId == 'custom') {
      setState(() => _showCustomPicker = !_showCustomPicker);
      return;
    }
    setState(() => _showCustomPicker = false);
    _fetchForFilter(filterId);
  }

  void _handleCustomSubmit() {
    if (_customStart == null || _customEnd == null) return;
    if (_customEnd!.isBefore(_customStart!)) return;

    ref.read(eodDashboardProvider.notifier).fetchSummary(
      _formatDate(_customStart!),
      _formatDate(_customEnd!),
    );
    setState(() => _showCustomPicker = false);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(eodDashboardProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Filters Section
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterBtn('today', tr('eodFilterToday'), Icons.calendar_today),
                    const SizedBox(width: 8),
                    _buildFilterBtn('yesterday', tr('eodFilterYesterday'), Icons.event_note),
                    const SizedBox(width: 8),
                    _buildFilterBtn('week', tr('eodFilterThisWeek'), Icons.date_range),
                    const SizedBox(width: 8),
                    _buildFilterBtn('month', tr('eodFilterThisMonth'), Icons.calendar_month),
                    const SizedBox(width: 8),
                    _buildFilterBtn('custom', tr('eodFilterCustom'), Icons.expand_more, isCustom: true),
                  ],
                ),
              ),

              // Custom Date Picker
              if (_showCustomPicker) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEEEEE),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E2E2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tr('eodCustomRange').toUpperCase(),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF4F4633), letterSpacing: 1),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(tr('eodFrom'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF4F4633))),
                                const SizedBox(height: 6),
                                InkWell(
                                  onTap: () async {
                                    final d = await showDatePicker(context: context, initialDate: _customStart ?? DateTime.now(), firstDate: DateTime(2020), lastDate: DateTime.now());
                                    if (d != null) setState(() => _customStart = d);
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFD3C5AD))),
                                    child: Text(_customStart != null ? _formatDate(_customStart!) : 'Select', style: const TextStyle(fontSize: 12)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(tr('eodTo'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF4F4633))),
                                const SizedBox(height: 6),
                                InkWell(
                                  onTap: () async {
                                    final d = await showDatePicker(context: context, initialDate: _customEnd ?? DateTime.now(), firstDate: _customStart ?? DateTime(2020), lastDate: DateTime.now());
                                    if (d != null) setState(() => _customEnd = d);
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFD3C5AD))),
                                    child: Text(_customEnd != null ? _formatDate(_customEnd!) : 'Select', style: const TextStyle(fontSize: 12)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _handleCustomSubmit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFBC02D),
                            foregroundColor: const Color(0xFF6C5000),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: Text(tr('eodApplyRange'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      )
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 24),

              // Content Area
              if (state.isLoading)
                const Padding(
                  padding: EdgeInsets.all(48),
                  child: Center(child: CircularProgressIndicator(color: AppColors.warning)),
                )
              else if (state.error != null)
                Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(state.error!, style: const TextStyle(color: Colors.red))))
              else if (state.summary != null && state.summary!['entryCount'] != null && state.summary!['entryCount'] > 0)
                _buildDashboardContent(state.summary!)
              else
                _buildEmptyState(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDashboardContent(Map<String, dynamic> summary) {
    final entryCount = summary['entryCount'] ?? 0;
    final entriesLabel = entryCount == 1 ? tr('eodEntry') : tr('eodEntries');

    return Column(
      children: [
        // 4 Grid Cards
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.4,
          children: [
            _buildMetricCard(
              title: tr('eodTotalIncome'),
              value: summary['totalIncome'],
              icon: Icons.account_balance_wallet,
              color: Colors.green.shade600,
              bgLight: Colors.green.shade50,
              subtitle: '$entryCount $entriesLabel',
            ),
            _buildMetricCard(
              title: tr('eodExpenses'),
              value: summary['totalExpenses'],
              icon: Icons.arrow_downward,
              color: Colors.red.shade600,
              bgLight: Colors.red.shade50,
              subtitle: tr('eodMaintExpenses'),
            ),
            _buildMetricCard(
              title: tr('eodPendingDues'),
              value: summary['totalPending'],
              icon: Icons.access_time,
              color: Colors.orange.shade600,
              bgLight: Colors.orange.shade50,
              subtitle: tr('eodPendingFollowup'),
            ),
            _buildProfitCard(summary['netProfit']),
          ],
        ),
        const SizedBox(height: 24),

        // Breakdown Table
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E2E2)),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: const BoxDecoration(
                  color: Color(0xFFF9F9F9),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                  border: Border(bottom: BorderSide(color: Color(0xFFE2E2E2))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.receipt, color: Color(0xFF795900), size: 20),
                        const SizedBox(width: 8),
                        Text(tr('eodBreakdown'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1A1C1C))),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFFEEEEEE), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFE2E2E2))),
                      child: Text('$entryCount $entriesLabel', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF4F4633))),
                    ),
                  ],
                ),
              ),
              _buildTableRow(tr('eodTotalBilled'), summary['totalBilled'], const Color(0xFF1A1C1C), null, false),
              _buildTableRow(tr('eodCollected'), summary['totalIncome'], Colors.green.shade600, Colors.green.shade600, true),
              _buildTableRow(tr('eodMaintExpenses'), summary['totalExpenses'], Colors.red.shade600, Colors.red.shade600, false, prefix: '- '),
              _buildTableRow(tr('eodStillPending'), summary['totalPending'], Colors.orange.shade600, Colors.orange.shade600, false),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFBC02D).withValues(alpha: 0.15),
                  border: const Border(top: BorderSide(color: Color(0xFFFBC02D), width: 2)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(tr('eodNetProfitRow'), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1A1C1C))),
                    Text('₹${summary['netProfit'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF6C5000))),
                  ],
                ),
              )
            ],
          ),
        )
      ],
    );
  }

  Widget _buildTableRow(String title, dynamic value, Color dotColor, Color? valueColor, bool isPositive, {String prefix = ''}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFE2E2E2))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              if (valueColor != null) ...[
                Container(width: 10, height: 10, decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle)),
                const SizedBox(width: 8),
              ],
              Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF1A1C1C))),
            ],
          ),
          Text(
            '${isPositive ? '+ ' : prefix}₹${value ?? 0}',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: valueColor ?? const Color(0xFF1A1C1C)),
          )
        ],
      ),
    );
  }

  Widget _buildMetricCard({required String title, required dynamic value, required IconData icon, required Color color, required Color bgLight, required String subtitle}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E2E2)),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.08), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF2D2F30),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 4),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: bgLight, borderRadius: BorderRadius.circular(10)),
                child: Icon(icon, color: color, size: 18),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  '₹${value ?? 0}',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildProfitCard(dynamic value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Colors.white, Color(0xFFFFFBEB), Color(0x33FBC02D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFBC02D), width: 1.5),
        boxShadow: const [BoxShadow(color: Color(0x33FBC02D), blurRadius: 12, offset: Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  tr('eodNetProfit'),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF5D4037),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 4),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: const Color(0xFFFBC02D), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.trending_up, color: Color(0xFF6C5000), size: 18),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  '₹${value ?? 0}',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF6C5000)),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                tr('eodNetProfit'),
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF6C5000)),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(width: 80, height: 80, decoration: BoxDecoration(color: const Color(0xFFEEEEEE), shape: BoxShape.circle, border: Border.all(color: const Color(0xFFE2E2E2))), child: const Icon(Icons.query_stats, size: 40, color: Color(0xFF817661))),
          const SizedBox(height: 16),
          Text(tr('eodEmptyTitle'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1A1C1C))),
          const SizedBox(height: 8),
          Text(tr('eodEmptySubtitle'), textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: Color(0xFF4F4633))),
        ],
      ),
    );
  }

  Widget _buildFilterBtn(String id, String label, IconData icon, {bool isCustom = false}) {
    final isActive = _activeFilter == id;
    return InkWell(
      onTap: () => _handleQuickFilter(id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFFBC02D) : const Color(0xFFEEEEEE),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: isActive ? const Color(0xFF795900) : const Color(0xFFD3C5AD)),
        ),
        child: Row(
          children: [
            if (!isCustom) ...[Icon(icon, size: 14, color: isActive ? const Color(0xFF6C5000) : const Color(0xFF4F4633)), const SizedBox(width: 6)],
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                color: isActive ? const Color(0xFF6C5000) : const Color(0xFF4F4633),
              ),
            ),
            if (isCustom) ...[
              const SizedBox(width: 6),
              Icon(
                _showCustomPicker ? Icons.expand_less : Icons.expand_more,
                size: 16,
                color: isActive ? const Color(0xFF6C5000) : const Color(0xFF4F4633),
              )
            ]
          ],
        ),
      ),
    );
  }
}
