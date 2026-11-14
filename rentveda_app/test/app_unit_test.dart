// ignore_for_file: deprecated_member_use
import 'package:flutter_test/flutter_test.dart';
import 'package:rentveda_app/features/tracker/utils/area_calculator.dart';
import 'package:latlong2/latlong.dart';
import 'package:math_expressions/math_expressions.dart';

void main() {
  group('Hourly Rental Rate Calculation Tests', () {
    double computeTotal(double price, double qty, String qtyStr, String rentType) {
      if (rentType.toLowerCase().contains('hour')) {
        final trimmed = qtyStr.trim();
        if (trimmed.contains('.')) {
          final parts = trimmed.split('.');
          final hours = double.tryParse(parts[0]) ?? 0.0;
          final minPart = parts[1].padRight(2, '0').substring(0, 2);
          final mins = double.tryParse(minPart) ?? 0.0;
          final totalHours = hours + (mins / 60.0);
          return price * totalHours;
        }
      }
      return price * qty;
    }

    test('Computes 1 hour 30 mins (1.30) correctly as 1.5 hours', () {
      final total = computeTotal(1000.0, 1.30, '1.30', 'Hour');
      expect(total, 1500.0);
    });

    test('Computes 1 hour 45 mins (1.45) correctly as 1.75 hours', () {
      final total = computeTotal(1000.0, 1.45, '1.45', 'byHour');
      expect(total, 1750.0);
    });

    test('Computes non-hour rental by simple multiplication', () {
      final total = computeTotal(500.0, 3.5, '3.5', 'Acre');
      expect(total, 1750.0);
    });
  });

  group('Area Calculator Tests', () {
    test('Calculates zero area for fewer than 3 points', () {
      final points = [const LatLng(22.0, 78.0), const LatLng(22.1, 78.1)];
      final area = AreaCalculator.computeAreaSqMeters(points);
      expect(area, 0.0);
    });

    test('Calculates perimeter for coordinates', () {
      final points = [
        const LatLng(22.0, 78.0),
        const LatLng(22.0, 78.01),
        const LatLng(22.01, 78.01),
        const LatLng(22.01, 78.0),
      ];
      final perimeter = AreaCalculator.computePerimeterMeters(points);
      expect(perimeter, greaterThan(1000.0));
    });
  });

  group('Calculator Math Engine Tests', () {
    test('Evaluates arithmetic expressions properly', () {
      final equation = '15 + 25 * 2';
      final parser = Parser();
      final exp = parser.parse(equation);
      final eval = exp.evaluate(EvaluationType.REAL, ContextModel());
      expect(eval, 65.0);
    });
  });
}
