import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart' as ll;
import 'package:maps_toolkit/maps_toolkit.dart' as mp;

enum BighaRegion {
  standard('Central / MP (0.625 Acre)', 2529.285),
  upPakka('UP / Bihar Pakka', 2529.285),
  rajasthan('Rajasthan (1618 m²)', 1618.74),
  gujarat('Gujarat Vigha', 1936.0),
  punjabHaryana('Punjab / Haryana Killa', 4046.856);

  final String label;
  final double sqMetersPerUnit;
  const BighaRegion(this.label, this.sqMetersPerUnit);
}

class AreaCalculationResult {
  final double sqMeters;
  final double acres;
  final double hectares;
  final double guntha;
  final double bigha;
  final BighaRegion bighaRegion;

  const AreaCalculationResult({
    required this.sqMeters,
    required this.acres,
    required this.hectares,
    required this.guntha,
    required this.bigha,
    required this.bighaRegion,
  });

  String get formattedAcres => '${acres.toStringAsFixed(2)} Acre';
  String get formattedBigha => '${bigha.toStringAsFixed(2)} Bigha';
  String get formattedHectares => '${hectares.toStringAsFixed(2)} Ha';
  String get formattedSqMeters => '${sqMeters.toStringAsFixed(1)} m²';
}

class AreaCalculator {
  static const double sqMetersPerAcre = 4046.8564224;
  static const double sqMetersPerHectare = 10000.0;
  static const double sqMetersPerGuntha = 101.1714;

  /// Computes spherical polygon surface area from a list of latlong2 coordinates.
  static double computeAreaSqMeters(List<ll.LatLng> points) {
    if (points.length < 3) return 0.0;
    try {
      final mpPoints = points.map((p) => mp.LatLng(p.latitude, p.longitude)).toList();
      final num area = mp.SphericalUtil.computeArea(mpPoints);
      return area.toDouble();
    } catch (_) {
      return 0.0;
    }
  }

  /// Computes perimeter of the polygon in meters
  static double computePerimeterMeters(List<ll.LatLng> points) {
    if (points.length < 2) return 0.0;
    double perimeter = 0.0;
    for (int i = 0; i < points.length; i++) {
      final p1 = points[i];
      final p2 = points[(i + 1) % points.length];
      perimeter += Geolocator.distanceBetween(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    }
    return perimeter;
  }

  /// Converts square meters to all agricultural units with specified Bigha region.
  static AreaCalculationResult calculate(
    List<ll.LatLng> points, {
    BighaRegion bighaRegion = BighaRegion.standard,
  }) {
    final sqMeters = computeAreaSqMeters(points);
    final acres = sqMeters / sqMetersPerAcre;
    final hectares = sqMeters / sqMetersPerHectare;
    final guntha = sqMeters / sqMetersPerGuntha;
    final bigha = sqMeters / bighaRegion.sqMetersPerUnit;

    return AreaCalculationResult(
      sqMeters: sqMeters,
      acres: acres,
      hectares: hectares,
      guntha: guntha,
      bigha: bigha,
      bighaRegion: bighaRegion,
    );
  }

  static double sqMetersToAcres(double sqMeters) => sqMeters / sqMetersPerAcre;
  static double sqMetersToBigha(double sqMeters, [BighaRegion region = BighaRegion.standard]) =>
      sqMeters / region.sqMetersPerUnit;
}
