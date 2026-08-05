// ignore_for_file: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:math_expressions/math_expressions.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import 'package:easy_localization/easy_localization.dart';

class CalculatorScreen extends StatefulWidget {
  const CalculatorScreen({super.key});

  @override
  State<CalculatorScreen> createState() => _CalculatorScreenState();
}

class _CalculatorScreenState extends State<CalculatorScreen> {
  String _display = "0";
  String _equation = "";
  bool _isResult = false;

  void _handleNumber(String num) {
    if (_display == "0" || _isResult) {
      setState(() {
        _display = num;
        _isResult = false;
      });
    } else {
      // Prevent multiple decimals
      if (num == "." && _display.contains(".")) return;
      setState(() {
        _display = _display + num;
      });
    }
  }

  void _handleOperator(String op) {
    setState(() {
      _isResult = false;
      if (_equation.isNotEmpty && !_isResult) {
        _equation = "$_equation $_display $op";
      } else {
        _equation = "$_display $op";
      }
      _display = "0";
    });
  }

  void _calculate() {
    if (_equation.isEmpty) return;
    try {
      final fullEquation = "$_equation $_display";
      final mathEquation = fullEquation.replaceAll('×', '*').replaceAll('÷', '/');

      Parser p = Parser();
      Expression exp = p.parse(mathEquation);
      ContextModel cm = ContextModel();
      double eval = exp.evaluate(EvaluationType.REAL, cm);

      String formattedResult;
      if (eval % 1 == 0) {
        formattedResult = eval.toInt().toString();
      } else {
        formattedResult = eval.toStringAsFixed(4).replaceAll(RegExp(r'0*$'), '').replaceAll(RegExp(r'\.$'), '');
      }

      setState(() {
        _display = formattedResult;
        _equation = "";
        _isResult = true;
      });
    } catch (error) {
      setState(() {
        _display = "Error";
        _equation = "";
        _isResult = true;
      });
    }
  }

  void _handleClear() {
    setState(() {
      _display = "0";
      _equation = "";
      _isResult = false;
    });
  }

  void _handleDelete() {
    if (_isResult) {
      _handleClear();
      return;
    }
    setState(() {
      if (_display.length > 1) {
        _display = _display.substring(0, _display.length - 1);
      } else {
        _display = "0";
      }
    });
  }

  void _handlePercentage() {
    final value = double.tryParse(_display);
    if (value == null) return;
    setState(() {
      _display = (value / 100).toString();
      _isResult = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgMain,
      body: SafeArea(
        child: Column(
          children: [
            // Display Area
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                alignment: Alignment.bottomRight,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      _equation,
                      style: AppTypography.bodySecondary.copyWith(
                        fontFamily: 'monospace',
                        color: AppColors.textDarkBrown,
                        fontSize: 16,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerRight,
                      child: Text(
                        _display,
                        style: AppTypography.screenHeader.copyWith(
                          fontSize: _display.length > 12 ? 32 : _display.length > 8 ? 42 : 56,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Keypad
            Container(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 20,
                    offset: Offset(0, -5),
                  )
                ],
              ),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final btnSpacing = 12.0;
                  final btnWidth = (constraints.maxWidth - (btnSpacing * 3)) / 4;
                  final btnHeight = btnWidth * 0.9; // Slight rectangle like iOS

                  Widget buildBtn(String label, {
                    required VoidCallback onTap,
                    Color? bgColor,
                    Color? textColor,
                    Color? borderColor,
                    bool isWide = false,
                    IconData? icon,
                  }) {
                    return SizedBox(
                      width: isWide ? (btnWidth * 2) + btnSpacing : btnWidth,
                      height: btnHeight,
                      child: Material(
                        color: bgColor ?? Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(100), // fully rounded
                          side: BorderSide(color: borderColor ?? AppColors.border),
                        ),
                        clipBehavior: Clip.antiAlias,
                        child: InkWell(
                          onTap: onTap,
                          splashColor: Colors.black12,
                          child: Center(
                            child: icon != null 
                              ? Icon(icon, color: textColor ?? AppColors.textMain, size: 24)
                              : Text(
                                  label,
                                  style: AppTypography.screenHeader.copyWith(
                                    color: textColor ?? AppColors.textMain,
                                    fontSize: 24,
                                  ),
                                ),
                          ),
                        ),
                      ),
                    );
                  }

                  return Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          buildBtn("AC", onTap: _handleClear, bgColor: const Color(0xFFEEEEEE), textColor: const Color(0xFF4F4633)),
                          buildBtn("", onTap: _handleDelete, icon: Icons.backspace_outlined, bgColor: const Color(0xFFEEEEEE), textColor: const Color(0xFF4F4633)),
                          buildBtn("%", onTap: _handlePercentage, bgColor: const Color(0xFFEEEEEE), textColor: const Color(0xFF4F4633)),
                          buildBtn("÷", onTap: () => _handleOperator("÷"), bgColor: AppColors.warning, textColor: AppColors.warningDark, borderColor: AppColors.primaryGold),
                        ],
                      ),
                      SizedBox(height: btnSpacing),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          buildBtn("7", onTap: () => _handleNumber("7")),
                          buildBtn("8", onTap: () => _handleNumber("8")),
                          buildBtn("9", onTap: () => _handleNumber("9")),
                          buildBtn("×", onTap: () => _handleOperator("×"), bgColor: AppColors.warning, textColor: AppColors.warningDark, borderColor: AppColors.primaryGold),
                        ],
                      ),
                      SizedBox(height: btnSpacing),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          buildBtn("4", onTap: () => _handleNumber("4")),
                          buildBtn("5", onTap: () => _handleNumber("5")),
                          buildBtn("6", onTap: () => _handleNumber("6")),
                          buildBtn("-", onTap: () => _handleOperator("-"), bgColor: AppColors.warning, textColor: AppColors.warningDark, borderColor: AppColors.primaryGold),
                        ],
                      ),
                      SizedBox(height: btnSpacing),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          buildBtn("1", onTap: () => _handleNumber("1")),
                          buildBtn("2", onTap: () => _handleNumber("2")),
                          buildBtn("3", onTap: () => _handleNumber("3")),
                          buildBtn("+", onTap: () => _handleOperator("+"), bgColor: AppColors.warning, textColor: AppColors.warningDark, borderColor: AppColors.primaryGold),
                        ],
                      ),
                      SizedBox(height: btnSpacing),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          buildBtn("0", onTap: () => _handleNumber("0"), isWide: true),
                          buildBtn(".", onTap: () => _handleNumber(".")),
                          buildBtn("=", onTap: _calculate, bgColor: AppColors.successDark, textColor: Colors.white, borderColor: AppColors.successDark),
                        ],
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
