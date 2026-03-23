import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

import '../navigation/widgets/map_view.dart';

class SchoolPlanScreen extends StatefulWidget {
  const SchoolPlanScreen({super.key});

  @override
  State<SchoolPlanScreen> createState() => _SchoolPlanScreenState();
}

class _SchoolPlanScreenState extends State<SchoolPlanScreen> {
  String _currentFloorId = 'FLOOR_0';

  final Map<String, String> _floorSvgs = {
    'FLOOR_0': 'assets/maps/floor_0a.png',
    'FLOOR_1': 'assets/maps/floor_1.png',
  };

  final Map<String, String> _floorNames = {
    'FLOOR_0': 'Parter',
    'FLOOR_1': '1. Piętro',
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Plan szkoły')),
      body: Stack(
        children: [
          // Mapa
          MapView(
            floorId: _currentFloorId,
            svgAsset: _floorSvgs[_currentFloorId] ?? '',
            pathSegments: const [], // Pusta ścieżka - tylko podgląd
            startNodeId: '',
            endNodeId: '',
            currentStepNodeId: '',
          ),

          // Przełącznik pięter
          Positioned(
            right: 16,
            bottom: 32,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children:
                    _floorNames.keys.map((floorId) {
                      final isSelected = floorId == _currentFloorId;
                      return InkWell(
                        onTap: () {
                          setState(() {
                            _currentFloorId = floorId;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color:
                                isSelected
                                    ? AppColors.primary
                                    : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _floorNames[floorId]!,
                            style: TextStyle(
                              color:
                                  isSelected
                                      ? Colors.white
                                      : AppColors.textPrimary,
                              fontWeight:
                                  isSelected
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
