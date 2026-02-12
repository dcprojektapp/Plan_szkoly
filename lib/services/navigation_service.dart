import 'dart:math' as math;
import '../data/datasources/school_data_source.dart';
import '../data/models/models.dart';

/// Serwis nawigacji wykorzystujący algorytm A*
class NavigationService {
  final SchoolDataSource _dataSource;

  NavigationService(this._dataSource);

  /// Znajduje najkrótszą trasę między dwoma węzłami używając algorytmu A*
  NavigationResult? findRoute(String startNodeId, String endNodeId) {
    final startNode = _dataSource.getNodeById(startNodeId);
    final endNode = _dataSource.getNodeById(endNodeId);

    if (startNode == null || endNode == null) {
      return null;
    }

    // A* algorithm
    final openSet = _PriorityQueue<_AStarNode>(
      (a, b) => a.fScore.compareTo(b.fScore),
    );
    final closedSet = <String>{};
    final cameFrom = <String, String>{};
    final gScore = <String, double>{};
    final edgeUsed = <String, NavEdge>{};

    gScore[startNodeId] = 0;
    openSet.add(
      _AStarNode(nodeId: startNodeId, fScore: _heuristic(startNode, endNode)),
    );

    while (openSet.isNotEmpty) {
      final current = openSet.removeFirst();

      if (current.nodeId == endNodeId) {
        // Ścieżka znaleziona - zrekonstruuj
        return _reconstructPath(
          startNodeId,
          endNodeId,
          cameFrom,
          edgeUsed,
          gScore[endNodeId] ?? 0,
        );
      }

      if (closedSet.contains(current.nodeId)) {
        continue;
      }
      closedSet.add(current.nodeId);

      final currentNode = _dataSource.getNodeById(current.nodeId);
      if (currentNode == null) continue;

      // Pobierz sąsiadów (uwzględniamy krawędzie dwukierunkowe)
      final edges = _getNeighborEdges(current.nodeId);
      for (final edgeInfo in edges) {
        final edge = edgeInfo.edge;
        final neighborId = edgeInfo.neighborId;
        if (closedSet.contains(neighborId)) continue;

        final neighborNode = _dataSource.getNodeById(neighborId);
        if (neighborNode == null) continue;

        final tentativeGScore =
            (gScore[current.nodeId] ?? double.infinity) + edge.weight;

        if (tentativeGScore < (gScore[neighborId] ?? double.infinity)) {
          cameFrom[neighborId] = current.nodeId;
          edgeUsed[neighborId] = edge;
          gScore[neighborId] = tentativeGScore;

          final fScore = tentativeGScore + _heuristic(neighborNode, endNode);
          openSet.add(_AStarNode(nodeId: neighborId, fScore: fScore));
        }
      }
    }

    // Nie znaleziono ścieżki
    return null;
  }

  /// Pobiera sąsiadów węzła (uwzględnia dwukierunkowość krawędzi WALK)
  List<_EdgeInfo> _getNeighborEdges(String nodeId) {
    final result = <_EdgeInfo>[];
    final allEdges = _dataSource.getEdges();

    for (final edge in allEdges) {
      if (edge.fromNodeId == nodeId) {
        // Krawędź wychodząca
        result.add(_EdgeInfo(edge: edge, neighborId: edge.toNodeId));
      } else if (edge.toNodeId == nodeId && edge.type == EdgeType.walk) {
        // Krawędź przychodząca typu WALK - traktujemy jako dwukierunkową
        result.add(_EdgeInfo(edge: edge, neighborId: edge.fromNodeId));
      }
    }

    return result;
  }

  /// Heurystyka - odległość euklidesowa (uwzględnia różne piętra)
  double _heuristic(NavNode from, NavNode to) {
    double dx = to.x - from.x;
    double dy = to.y - from.y;
    double distance = math.sqrt(dx * dx + dy * dy);

    // Dodaj karę za zmianę piętra
    if (from.floorId != to.floorId) {
      distance += 50; // Dodatkowy koszt za zmianę piętra
    }

    return distance;
  }

  /// Rekonstruuje ścieżkę i generuje instrukcje
  NavigationResult _reconstructPath(
    String startNodeId,
    String endNodeId,
    Map<String, String> cameFrom,
    Map<String, NavEdge> edgeUsed,
    double totalDistance,
  ) {
    // Zbuduj listę węzłów na ścieżce
    final nodePath = <String>[];
    String? current = endNodeId;
    while (current != null) {
      nodePath.insert(0, current);
      current = cameFrom[current];
    }

    // Wygeneruj instrukcje
    final steps = _generateSteps(nodePath, edgeUsed);

    // Wygeneruj segmenty ścieżki do rysowania
    final pathSegments = _generatePathSegments(nodePath);

    // Szacowany czas (zakładamy 1 jednostka wagi = 1 sekunda)
    final estimatedTime = totalDistance.toInt();

    return NavigationResult(
      startNodeId: startNodeId,
      endNodeId: endNodeId,
      nodePath: nodePath,
      steps: steps,
      pathSegments: pathSegments,
      totalDistance: totalDistance,
      estimatedTimeSeconds: estimatedTime,
    );
  }

  /// Generuje instrukcje tekstowe dla ścieżki
  List<RouteStep> _generateSteps(
    List<String> nodePath,
    Map<String, NavEdge> edgeUsed,
  ) {
    final steps = <RouteStep>[];
    if (nodePath.isEmpty) return steps;

    // Pierwszy krok - start
    final startNode = _dataSource.getNodeById(nodePath.first);
    if (startNode != null) {
      steps.add(
        RouteStep(
          nodeId: startNode.id,
          floorId: startNode.floorId,
          type: InstructionType.start,
          instruction: 'Rozpocznij przy: ${startNode.displayName}',
          x: startNode.x,
          y: startNode.y,
        ),
      );
    }

    // Środkowe kroki
    for (int i = 1; i < nodePath.length - 1; i++) {
      final nodeId = nodePath[i];
      final node = _dataSource.getNodeById(nodeId);
      final edge = edgeUsed[nodeId];

      if (node == null) continue;

      final instruction = _getInstructionForEdge(edge, node);
      if (instruction != null) {
        steps.add(instruction);
      }
    }

    // Ostatni krok - cel
    final endNode = _dataSource.getNodeById(nodePath.last);
    if (endNode != null) {
      steps.add(
        RouteStep(
          nodeId: endNode.id,
          floorId: endNode.floorId,
          type: InstructionType.destination,
          instruction: 'Cel: ${endNode.displayName}',
          x: endNode.x,
          y: endNode.y,
        ),
      );
    }

    return steps;
  }

  /// Generuje instrukcję dla danej krawędzi
  RouteStep? _getInstructionForEdge(NavEdge? edge, NavNode node) {
    if (edge == null) return null;

    InstructionType type;
    String instruction;

    switch (edge.type) {
      case EdgeType.stairsUp:
        type = InstructionType.stairsUp;
        final floor = _dataSource.getFloorById(node.floorId);
        instruction = 'Wejdź po schodach na ${floor?.name ?? "wyższe piętro"}';
        break;
      case EdgeType.stairsDown:
        type = InstructionType.stairsDown;
        final floor = _dataSource.getFloorById(node.floorId);
        instruction = 'Zejdź po schodach na ${floor?.name ?? "niższe piętro"}';
        break;
      case EdgeType.elevator:
        type = InstructionType.elevator;
        final floor = _dataSource.getFloorById(node.floorId);
        instruction = 'Wjedź windą na ${floor?.name ?? "inne piętro"}';
        break;
      case EdgeType.buildingConnector:
        type = InstructionType.changeBuilding;
        instruction = 'Przejdź do innego budynku przez: ${node.displayName}';
        break;
      case EdgeType.walk:
        // Dla zwykłego przejścia generujemy tylko przy ważnych punktach
        if (node.type == NodeType.corridor) {
          return null; // Pomijamy zwykłe korytarze
        }
        type = InstructionType.walkStraight;
        instruction = 'Idź korytarzem obok: ${node.displayName}';
        break;
    }

    return RouteStep(
      nodeId: node.id,
      floorId: node.floorId,
      type: type,
      instruction: instruction,
      x: node.x,
      y: node.y,
    );
  }

  /// Generuje segmenty ścieżki do rysowania na mapach
  List<PathSegment> _generatePathSegments(List<String> nodePath) {
    final segments = <PathSegment>[];
    if (nodePath.isEmpty) return segments;

    List<PathPoint> currentPoints = [];
    String? currentFloorId;

    for (int i = 0; i < nodePath.length; i++) {
      final nodeId = nodePath[i];
      final node = _dataSource.getNodeById(nodeId);
      if (node == null) continue;

      // Inicjalizacja pierwszego piętra
      currentFloorId ??= node.floorId;

      // Sprawdź czy nastąpiła zmiana piętra
      if (node.floorId != currentFloorId) {
        // Zakończ obecny segment
        if (currentPoints.isNotEmpty) {
          segments.add(
            PathSegment(
              floorId: currentFloorId!,
              points: List.unmodifiable(currentPoints),
            ),
          );
        }

        // Przygotuj się na nowe piętro
        // WAŻNE: Nowy segment zaczynamy OD TEGO SAMEGO WĘZŁA (schodów/windy),
        // aby punkt startowy na nowym piętrze był poprawny.
        // Ale węzeł 'node' jest już na NOWYM piętrze.
        currentFloorId = node.floorId;
        currentPoints = [PathPoint(x: node.x, y: node.y)];
      } else {
        // Kontynuuj na tym samym piętrze
        currentPoints.add(PathPoint(x: node.x, y: node.y));
      }
    }

    // Dodaj ostatni segment
    if (currentPoints.isNotEmpty && currentFloorId != null) {
      segments.add(
        PathSegment(
          floorId: currentFloorId,
          points: List.unmodifiable(currentPoints),
        ),
      );
    }

    return segments;
  }
}

/// Węzeł pomocniczy dla algorytmu A*
class _AStarNode {
  final String nodeId;
  final double fScore;

  _AStarNode({required this.nodeId, required this.fScore});
}

class _PriorityQueue<T> {
  final List<T> _items = [];
  final int Function(T a, T b) _compare;

  _PriorityQueue(this._compare);

  bool get isNotEmpty => _items.isNotEmpty;

  void add(T item) {
    _items.add(item);
    _items.sort(_compare);
  }

  T removeFirst() {
    return _items.removeAt(0);
  }
}

/// Informacja o krawędzi i sąsiednim węźle
class _EdgeInfo {
  final NavEdge edge;
  final String neighborId;

  _EdgeInfo({required this.edge, required this.neighborId});
}
