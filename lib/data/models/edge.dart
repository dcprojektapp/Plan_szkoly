import 'package:equatable/equatable.dart';

/// Typ krawędzi (połączenia między węzłami)
enum EdgeType {
  walk, // Normalne przejście korytarzem
  stairsUp, // Wejście po schodach w górę
  stairsDown, // Zejście po schodach w dół
  elevator, // Winda
  buildingConnector, // Przejście między budynkami
}

extension EdgeTypeExtension on EdgeType {
  String get value {
    switch (this) {
      case EdgeType.walk:
        return 'WALK';
      case EdgeType.stairsUp:
        return 'STAIRS_UP';
      case EdgeType.stairsDown:
        return 'STAIRS_DOWN';
      case EdgeType.elevator:
        return 'ELEVATOR';
      case EdgeType.buildingConnector:
        return 'BUILDING_CONNECTOR';
    }
  }

  static EdgeType fromString(String value) {
    switch (value.toUpperCase()) {
      case 'WALK':
        return EdgeType.walk;
      case 'STAIRS_UP':
        return EdgeType.stairsUp;
      case 'STAIRS_DOWN':
        return EdgeType.stairsDown;
      case 'ELEVATOR':
        return EdgeType.elevator;
      case 'BUILDING_CONNECTOR':
        return EdgeType.buildingConnector;
      default:
        return EdgeType.walk;
    }
  }

  /// Ikona reprezentująca typ przejścia
  String get icon {
    switch (this) {
      case EdgeType.walk:
        return '🚶';
      case EdgeType.stairsUp:
        return '⬆️';
      case EdgeType.stairsDown:
        return '⬇️';
      case EdgeType.elevator:
        return '🛗';
      case EdgeType.buildingConnector:
        return '🚪';
    }
  }
}

/// Model krawędzi (połączenia między dwoma węzłami)
class NavEdge extends Equatable {
  final String fromNodeId;
  final String toNodeId;
  final double weight;
  final EdgeType type;

  const NavEdge({
    required this.fromNodeId,
    required this.toNodeId,
    required this.weight,
    required this.type,
  });

  factory NavEdge.fromJson(Map<String, dynamic> json) {
    return NavEdge(
      fromNodeId: json['from'] as String,
      toNodeId: json['to'] as String,
      weight: (json['weight'] as num).toDouble(),
      type: EdgeTypeExtension.fromString(json['type'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'from': fromNodeId,
      'to': toNodeId,
      'weight': weight,
      'type': type.value,
    };
  }

  /// Czy przejście wymaga zmiany piętra
  bool get isFloorChange =>
      type == EdgeType.stairsUp ||
      type == EdgeType.stairsDown ||
      type == EdgeType.elevator;

  /// Czy przejście wymaga zmiany budynku
  bool get isBuildingChange => type == EdgeType.buildingConnector;

  @override
  List<Object?> get props => [fromNodeId, toNodeId, weight, type];
}
