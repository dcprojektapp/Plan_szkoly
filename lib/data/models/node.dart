import 'package:equatable/equatable.dart';

/// Typ węzła w grafie nawigacyjnym
enum NodeType {
  room, // Sala lekcyjna
  corridor, // Korytarz
  stairs, // Klatka schodowa
  elevator, // Winda
  entrance, // Wejście do budynku
  connector, // Łącznik między budynkami
}

/// Rozszerzenie do parsowania NodeType z JSON
extension NodeTypeExtension on NodeType {
  String get value {
    switch (this) {
      case NodeType.room:
        return 'ROOM';
      case NodeType.corridor:
        return 'CORRIDOR';
      case NodeType.stairs:
        return 'STAIRS';
      case NodeType.elevator:
        return 'ELEVATOR';
      case NodeType.entrance:
        return 'ENTRANCE';
      case NodeType.connector:
        return 'CONNECTOR';
    }
  }

  static NodeType fromString(String value) {
    switch (value.toUpperCase()) {
      case 'ROOM':
        return NodeType.room;
      case 'CORRIDOR':
        return NodeType.corridor;
      case 'STAIRS':
        return NodeType.stairs;
      case 'ELEVATOR':
        return NodeType.elevator;
      case 'ENTRANCE':
        return NodeType.entrance;
      case 'CONNECTOR':
        return NodeType.connector;
      default:
        return NodeType.corridor;
    }
  }
}

/// Model węzła (punktu nawigacyjnego)
class NavNode extends Equatable {
  final String id;
  final String floorId;
  final double x;
  final double y;
  final NodeType type;
  final String? name;
  final String? qrCode;
  final bool isAccessible;

  const NavNode({
    required this.id,
    required this.floorId,
    required this.x,
    required this.y,
    required this.type,
    this.name,
    this.qrCode,
    this.isAccessible = true,
  });

  factory NavNode.fromJson(Map<String, dynamic> json) {
    return NavNode(
      id: json['id'] as String,
      floorId: json['floor_id'] as String,
      x: (json['x'] as num).toDouble(),
      y: (json['y'] as num).toDouble(),
      type: NodeTypeExtension.fromString(json['type'] as String),
      name: json['name'] as String?,
      qrCode: json['qr_code'] as String?,
      isAccessible: json['is_accessible'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'floor_id': floorId,
      'x': x,
      'y': y,
      'type': type.value,
      'name': name,
      'qr_code': qrCode,
      'is_accessible': isAccessible,
    };
  }

  /// Czy węzeł jest salą (można go wybrać jako cel)
  bool get isRoom => type == NodeType.room;

  /// Czy węzeł ma przypisany kod QR
  bool get hasQrCode => qrCode != null && qrCode!.isNotEmpty;

  /// Wyświetlana nazwa węzła
  String get displayName => name ?? id;

  @override
  List<Object?> get props => [
    id,
    floorId,
    x,
    y,
    type,
    name,
    qrCode,
    isAccessible,
  ];
}
