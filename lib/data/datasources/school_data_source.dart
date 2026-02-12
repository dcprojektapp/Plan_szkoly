import 'dart:convert';
import 'package:flutter/services.dart';
import '../models/models.dart';

/// Źródło danych ładujące dane szkoły z pliku JSON w assets
class SchoolDataSource {
  List<Building>? _buildings;
  List<Floor>? _floors;
  List<NavNode>? _nodes;
  List<NavEdge>? _edges;

  bool _isLoaded = false;

  /// Czy dane zostały załadowane
  bool get isLoaded => _isLoaded;

  /// Ładuje dane szkoły z pliku JSON
  Future<void> loadData() async {
    if (_isLoaded) return;

    final jsonString = await rootBundle.loadString(
      'assets/data/school_data.json',
    );
    final json = jsonDecode(jsonString) as Map<String, dynamic>;

    _buildings =
        (json['buildings'] as List)
            .map((b) => Building.fromJson(b as Map<String, dynamic>))
            .toList();

    _floors =
        (json['floors'] as List)
            .map((f) => Floor.fromJson(f as Map<String, dynamic>))
            .toList();

    _nodes =
        (json['nodes'] as List)
            .map((n) => NavNode.fromJson(n as Map<String, dynamic>))
            .toList();

    _edges =
        (json['edges'] as List)
            .map((e) => NavEdge.fromJson(e as Map<String, dynamic>))
            .toList();

    _isLoaded = true;
  }

  /// Pobiera wszystkie budynki
  List<Building> getBuildings() {
    _ensureLoaded();
    return List.unmodifiable(_buildings!);
  }

  /// Pobiera wszystkie piętra
  List<Floor> getFloors() {
    _ensureLoaded();
    return List.unmodifiable(_floors!);
  }

  /// Pobiera piętra dla danego budynku
  List<Floor> getFloorsForBuilding(String buildingId) {
    _ensureLoaded();
    return _floors!.where((f) => f.buildingId == buildingId).toList();
  }

  /// Pobiera piętro po ID
  Floor? getFloorById(String floorId) {
    _ensureLoaded();
    try {
      return _floors!.firstWhere((f) => f.id == floorId);
    } catch (_) {
      return null;
    }
  }

  /// Pobiera wszystkie węzły
  List<NavNode> getNodes() {
    _ensureLoaded();
    return List.unmodifiable(_nodes!);
  }

  /// Pobiera węzły dla danego piętra
  List<NavNode> getNodesForFloor(String floorId) {
    _ensureLoaded();
    return _nodes!.where((n) => n.floorId == floorId).toList();
  }

  /// Pobiera węzeł po ID
  NavNode? getNodeById(String nodeId) {
    _ensureLoaded();
    try {
      return _nodes!.firstWhere((n) => n.id == nodeId);
    } catch (_) {
      return null;
    }
  }

  /// Pobiera węzeł po kodzie QR
  NavNode? getNodeByQrCode(String qrCode) {
    _ensureLoaded();
    try {
      return _nodes!.firstWhere((n) => n.qrCode == qrCode);
    } catch (_) {
      return null;
    }
  }

  /// Pobiera wszystkie sale (węzły typu ROOM)
  List<NavNode> getRooms() {
    _ensureLoaded();
    return _nodes!.where((n) => n.isRoom).toList();
  }

  /// Wyszukuje sale po nazwie lub ID
  List<NavNode> searchRooms(String query) {
    _ensureLoaded();
    final lowerQuery = query.toLowerCase();
    return _nodes!.where((n) {
      if (!n.isRoom) return false;
      final matchesId = n.id.toLowerCase().contains(lowerQuery);
      final matchesName = n.name?.toLowerCase().contains(lowerQuery) ?? false;
      return matchesId || matchesName;
    }).toList();
  }

  /// Pobiera wszystkie krawędzie
  List<NavEdge> getEdges() {
    _ensureLoaded();
    return List.unmodifiable(_edges!);
  }

  /// Pobiera krawędzie wychodzące z danego węzła
  List<NavEdge> getEdgesFromNode(String nodeId) {
    _ensureLoaded();
    return _edges!.where((e) => e.fromNodeId == nodeId).toList();
  }

  /// Pobiera wszystkie krawędzie dla węzła (wchodzące i wychodzące)
  List<NavEdge> getEdgesForNode(String nodeId) {
    _ensureLoaded();
    return _edges!
        .where((e) => e.fromNodeId == nodeId || e.toNodeId == nodeId)
        .toList();
  }

  void _ensureLoaded() {
    if (!_isLoaded) {
      throw StateError(
        'SchoolDataSource nie zostało załadowane. Wywołaj loadData() najpierw.',
      );
    }
  }
}
