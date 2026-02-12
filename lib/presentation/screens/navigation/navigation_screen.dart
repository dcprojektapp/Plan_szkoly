import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/di/injection.dart';
import '../../../data/datasources/school_data_source.dart';
import '../../../data/models/models.dart';
import '../../../services/navigation_service.dart';
import 'widgets/map_view.dart';
import 'widgets/instruction_card.dart';

class NavigationScreen extends StatefulWidget {
  const NavigationScreen({super.key});

  @override
  State<NavigationScreen> createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  NavigationResult? _navigationResult;
  String? _startNodeId;
  String? _endNodeId;
  int _currentStepIndex = 0;
  String? _currentFloorId;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is Map<String, dynamic>) {
      final newStartId = args['startNodeId'] as String?;
      final newEndId = args['endNodeId'] as String?;

      if (newStartId != _startNodeId || newEndId != _endNodeId) {
        _startNodeId = newStartId;
        _endNodeId = newEndId;
        _calculateRoute();
      }
    }
  }

  void _calculateRoute() {
    if (_startNodeId == null || _endNodeId == null) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Brak punktu startowego lub docelowego';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final navigationService = getIt<NavigationService>();
    final result = navigationService.findRoute(_startNodeId!, _endNodeId!);

    setState(() {
      _isLoading = false;
      _navigationResult = result;
      if (result != null) {
        _currentFloorId = result.steps.first.floorId;
        _currentStepIndex = 0;
      } else {
        _errorMessage = AppStrings.routeNotFound;
      }
    });
  }

  void _goToStep(int index) {
    if (_navigationResult == null) return;
    if (index < 0 || index >= _navigationResult!.steps.length) return;

    setState(() {
      _currentStepIndex = index;
      _currentFloorId = _navigationResult!.steps[index].floorId;
    });
  }

  void _nextStep() => _goToStep(_currentStepIndex + 1);
  void _previousStep() => _goToStep(_currentStepIndex - 1);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.navigationTitle),
        actions: [],
      ),
      body: _buildBody(),
      bottomNavigationBar: _navigationResult != null ? _buildBottomBar() : null,
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(AppStrings.buttonBack),
            ),
          ],
        ),
      );
    }

    if (_navigationResult == null) {
      return const Center(child: Text('Brak danych nawigacji'));
    }

    final dataSource = getIt<SchoolDataSource>();
    final currentFloor = dataSource.getFloorById(_currentFloorId!);
    final currentStep = _navigationResult!.steps[_currentStepIndex];

    return Column(
      children: [
        // Selektor piętra
        _buildFloorSelector(dataSource),

        // Mapa
        Expanded(
          child: MapView(
            floorId: _currentFloorId!,
            svgAsset: currentFloor?.svgAsset ?? '',
            pathSegments:
                _navigationResult!.pathSegments
                    .where((s) => s.floorId == _currentFloorId)
                    .toList(),
            startNodeId: _startNodeId!,
            endNodeId: _endNodeId!,
            currentStepNodeId: currentStep.nodeId,
          ),
        ),

        // Instrukcja
        InstructionCard(
          step: currentStep,
          stepNumber: _currentStepIndex + 1,
          totalSteps: _navigationResult!.steps.length,
        ),
      ],
    );
  }

  Widget _buildFloorSelector(SchoolDataSource dataSource) {
    final floorsOnRoute = _navigationResult!.floorsOnRoute;

    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: floorsOnRoute.length,
        itemBuilder: (context, index) {
          final floorId = floorsOnRoute[index];
          final floor = dataSource.getFloorById(floorId);
          final isSelected = floorId == _currentFloorId;

          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: ChoiceChip(
              label: Text(floor?.name ?? floorId),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) {
                  setState(() {
                    _currentFloorId = floorId;
                  });
                }
              },
              selectedColor: AppColors.primary,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : AppColors.textPrimary,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBottomBar() {
    final isFirstStep = _currentStepIndex == 0;
    final isLastStep = _currentStepIndex == _navigationResult!.steps.length - 1;

    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Poprzedni krok
            Expanded(
              child: OutlinedButton.icon(
                onPressed: isFirstStep ? null : _previousStep,
                icon: const Icon(Icons.arrow_back),
                label: const Text(AppStrings.previousStep),
              ),
            ),
            const SizedBox(width: 16),
            // Następny krok
            Expanded(
              child:
                  isLastStep
                      ? ElevatedButton.icon(
                        onPressed: () {
                          Navigator.popUntil(context, (route) => route.isFirst);
                        },
                        icon: const Icon(Icons.check),
                        label: const Text(AppStrings.endNavigation),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.success,
                        ),
                      )
                      : ElevatedButton.icon(
                        onPressed: _nextStep,
                        icon: const Icon(Icons.arrow_forward),
                        label: const Text(AppStrings.nextStep),
                      ),
            ),
          ],
        ),
      ),
    );
  }
}
