import 'package:equatable/equatable.dart';

/// Typ instrukcji nawigacyjnej
enum InstructionType {
  start, // Rozpocznij nawigację
  walkStraight, // Idź prosto
  turnLeft, // Skręć w lewo
  turnRight, // Skręć w prawo
  stairsUp, // Wejdź po schodach
  stairsDown, // Zejdź po schodach
  elevator, // Użyj windy
  changeBuilding, // Przejdź do innego budynku
  destination, // Cel osiągnięty
}

extension InstructionTypeExtension on InstructionType {
  String get icon {
    switch (this) {
      case InstructionType.start:
        return '📍';
      case InstructionType.walkStraight:
        return '⬆️';
      case InstructionType.turnLeft:
        return '⬅️';
      case InstructionType.turnRight:
        return '➡️';
      case InstructionType.stairsUp:
        return '🔼';
      case InstructionType.stairsDown:
        return '🔽';
      case InstructionType.elevator:
        return '🛗';
      case InstructionType.changeBuilding:
        return '🚪';
      case InstructionType.destination:
        return '🏁';
    }
  }
}

/// Pojedynczy krok instrukcji nawigacyjnej
class RouteStep extends Equatable {
  final String nodeId;
  final String floorId;
  final InstructionType type;
  final String instruction;
  final double x;
  final double y;

  const RouteStep({
    required this.nodeId,
    required this.floorId,
    required this.type,
    required this.instruction,
    required this.x,
    required this.y,
  });

  @override
  List<Object?> get props => [nodeId, floorId, type, instruction, x, y];
}

/// Segment ścieżki do rysowania na mapie
class PathSegment extends Equatable {
  final String floorId;
  final List<PathPoint> points;

  const PathSegment({required this.floorId, required this.points});

  @override
  List<Object?> get props => [floorId, points];
}

/// Punkt na ścieżce
class PathPoint extends Equatable {
  final double x;
  final double y;

  const PathPoint({required this.x, required this.y});

  @override
  List<Object?> get props => [x, y];
}

/// Wynik nawigacji
class NavigationResult extends Equatable {
  final String startNodeId;
  final String endNodeId;
  final List<String> nodePath;
  final List<RouteStep> steps;
  final List<PathSegment> pathSegments;
  final double totalDistance;
  final int estimatedTimeSeconds;

  const NavigationResult({
    required this.startNodeId,
    required this.endNodeId,
    required this.nodePath,
    required this.steps,
    required this.pathSegments,
    required this.totalDistance,
    required this.estimatedTimeSeconds,
  });

  /// Czy trasa wymaga zmiany piętra
  bool get hasFloorChange {
    final floors = steps.map((s) => s.floorId).toSet();
    return floors.length > 1;
  }

  /// Lista pięter na trasie
  List<String> get floorsOnRoute {
    return steps.map((s) => s.floorId).toSet().toList();
  }

  /// Szacowany czas w formacie "X min"
  String get estimatedTimeFormatted {
    final minutes = (estimatedTimeSeconds / 60).ceil();
    return '$minutes min';
  }

  @override
  List<Object?> get props => [
    startNodeId,
    endNodeId,
    nodePath,
    steps,
    pathSegments,
    totalDistance,
    estimatedTimeSeconds,
  ];
}
