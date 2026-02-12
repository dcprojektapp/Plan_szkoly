import 'package:equatable/equatable.dart';

/// Model piętra budynku
class Floor extends Equatable {
  final String id;
  final String buildingId;
  final int level;
  final String name;
  final String svgAsset;
  final double width;
  final double height;

  const Floor({
    required this.id,
    required this.buildingId,
    required this.level,
    required this.name,
    required this.svgAsset,
    required this.width,
    required this.height,
  });

  factory Floor.fromJson(Map<String, dynamic> json) {
    return Floor(
      id: json['id'] as String,
      buildingId: json['building_id'] as String,
      level: json['level'] as int,
      name: json['name'] as String,
      svgAsset: json['svg_asset'] as String,
      width: (json['width'] as num?)?.toDouble() ?? 1500.0,
      height: (json['height'] as num?)?.toDouble() ?? 2000.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'building_id': buildingId,
      'level': level,
      'name': name,
      'svg_asset': svgAsset,
      'width': width,
      'height': height,
    };
  }

  @override
  List<Object?> get props => [
    id,
    buildingId,
    level,
    name,
    svgAsset,
    width,
    height,
  ];
}

/// Model budynku
class Building extends Equatable {
  final String id;
  final String name;
  final String? description;

  const Building({required this.id, required this.name, this.description});

  factory Building.fromJson(Map<String, dynamic> json) {
    return Building(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'description': description};
  }

  @override
  List<Object?> get props => [id, name, description];
}
