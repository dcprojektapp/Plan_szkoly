import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/di/injection.dart';
import '../../../../data/datasources/school_data_source.dart';
import '../../../../data/models/models.dart';

class MapView extends StatelessWidget {
  final String floorId;
  final String svgAsset;
  final List<PathSegment> pathSegments;
  final String startNodeId;
  final String endNodeId;
  final String currentStepNodeId;

  const MapView({
    super.key,
    required this.floorId,
    required this.svgAsset,
    required this.pathSegments,
    required this.startNodeId,
    required this.endNodeId,
    required this.currentStepNodeId,
  });

  @override
  Widget build(BuildContext context) {
    return InteractiveViewer(
      minScale: 0.5,
      maxScale: 4.0,
      child: Stack(
        children: [
          // Mapa SVG lub PNG
          if (svgAsset.isNotEmpty)
            Center(
              child: AspectRatio(
                aspectRatio: 1.0,
                child: Stack(
                  children: [
                    Positioned.fill(
                      child:
                          svgAsset.toLowerCase().endsWith('.svg')
                              ? SvgPicture.asset(svgAsset, fit: BoxFit.fill)
                              : Image.asset(svgAsset, fit: BoxFit.fill),
                    ),
                    Positioned.fill(
                      child: CustomPaint(
                        painter: _RouteOverlayPainter(
                          pathSegments: pathSegments,
                          startNodeId: startNodeId,
                          endNodeId: endNodeId,
                          currentStepNodeId: currentStepNodeId,
                          floorId: floorId,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            Center(
              child: Container(
                padding: const EdgeInsets.all(32),
                child: const Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.map_outlined,
                      size: 64,
                      color: AppColors.textSecondary,
                    ),
                    SizedBox(height: 16),
                    Text(
                      'Mapa piętra',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 18,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Nakładka z trasą
          // Nakładka z trasą została przeniesiona do wnętrza AspectRatio wyżej
        ],
      ),
    );
  }
}

class _RouteOverlayPainter extends CustomPainter {
  final List<PathSegment> pathSegments;
  final String startNodeId;
  final String endNodeId;
  final String currentStepNodeId;
  final String floorId;

  _RouteOverlayPainter({
    required this.pathSegments,
    required this.startNodeId,
    required this.endNodeId,
    required this.currentStepNodeId,
    required this.floorId,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Skalowanie współrzędnych do rozmiaru widoku
    // Oba pliki SVG mają viewBox 0 0 1024 1024
    final scaleX = size.width / 1024;
    final scaleY = size.height / 1024;

    // Rysuj linie trasy dla wszystkich segmentów
    for (final segment in pathSegments) {
      if (segment.points.length < 2) continue;

      final path = Path();
      final firstPoint = segment.points.first;
      path.moveTo(firstPoint.x * scaleX, firstPoint.y * scaleY);

      for (int i = 1; i < segment.points.length; i++) {
        final point = segment.points[i];
        path.lineTo(point.x * scaleX, point.y * scaleY);
      }

      // Cień linii
      canvas.drawPath(
        path,
        Paint()
          ..color = Colors.black26
          ..style = PaintingStyle.stroke
          ..strokeWidth = 8
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round,
      );

      // Główna linia trasy
      canvas.drawPath(
        path,
        Paint()
          ..color = AppColors.routeLine
          ..style = PaintingStyle.stroke
          ..strokeWidth = 5
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round,
      );
    }

    // Rysuj markery punktów
    final dataSource = getIt<SchoolDataSource>();

    // Punkt startowy
    final startNode = dataSource.getNodeById(startNodeId);
    if (startNode != null && startNode.floorId == floorId) {
      _drawDot(canvas, startNode.x * scaleX, startNode.y * scaleY, Colors.red);
    }

    // Punkt końcowy
    final endNode = dataSource.getNodeById(endNodeId);
    if (endNode != null && endNode.floorId == floorId) {
      _drawDot(canvas, endNode.x * scaleX, endNode.y * scaleY, Colors.blue);
    }

    // Aktualny krok
    final currentNode = dataSource.getNodeById(currentStepNodeId);
    if (currentNode != null &&
        currentNode.floorId == floorId &&
        currentStepNodeId != startNodeId &&
        currentStepNodeId != endNodeId) {
      _drawPulsingCircle(
        canvas,
        currentNode.x * scaleX,
        currentNode.y * scaleY,
      );
    }
  }

  void _drawDot(Canvas canvas, double x, double y, Color color) {
    // Kropka (Radius 5)
    canvas.drawCircle(Offset(x, y), 5, Paint()..color = color);
  }

  void _drawPulsingCircle(Canvas canvas, double x, double y) {
    // Zewnętrzny okrąg (animowany efekt pulsowania)
    canvas.drawCircle(
      Offset(x, y),
      24,
      Paint()
        ..color = AppColors.accent.withOpacity(0.3)
        ..style = PaintingStyle.fill,
    );

    // Wewnętrzny okrąg
    canvas.drawCircle(
      Offset(x, y),
      12,
      Paint()
        ..color = AppColors.accent
        ..style = PaintingStyle.fill,
    );

    // Biała obwódka
    canvas.drawCircle(
      Offset(x, y),
      12,
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2,
    );
  }

  @override
  bool shouldRepaint(covariant _RouteOverlayPainter oldDelegate) {
    return oldDelegate.pathSegments != pathSegments ||
        oldDelegate.currentStepNodeId != currentStepNodeId ||
        oldDelegate.floorId != floorId;
  }
}
