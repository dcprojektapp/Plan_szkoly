import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/models.dart';

class InstructionCard extends StatelessWidget {
  final RouteStep step;
  final int stepNumber;
  final int totalSteps;

  const InstructionCard({
    super.key,
    required this.step,
    required this.stepNumber,
    required this.totalSteps,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Ikona instrukcji
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: _getIconBackgroundColor(),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(step.type.icon, style: const TextStyle(fontSize: 28)),
            ),
          ),
          const SizedBox(width: 16),

          // Tekst instrukcji
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Krok $stepNumber z $totalSteps',
                  style: TextStyle(
                    fontSize: 12,
                    color: _getTextSecondaryColor(),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  step.instruction,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: _getTextPrimaryColor(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getBackgroundColor() {
    switch (step.type) {
      case InstructionType.destination:
        return AppColors.success.withOpacity(0.1);
      case InstructionType.stairsUp:
      case InstructionType.stairsDown:
        return AppColors.stairs.withOpacity(0.2);
      case InstructionType.elevator:
        return AppColors.elevator.withOpacity(0.1);
      case InstructionType.changeBuilding:
        return AppColors.warning.withOpacity(0.1);
      default:
        return AppColors.surface;
    }
  }

  Color _getIconBackgroundColor() {
    switch (step.type) {
      case InstructionType.destination:
        return AppColors.success.withOpacity(0.2);
      case InstructionType.stairsUp:
      case InstructionType.stairsDown:
        return AppColors.stairs.withOpacity(0.3);
      case InstructionType.elevator:
        return AppColors.elevator.withOpacity(0.2);
      case InstructionType.changeBuilding:
        return AppColors.warning.withOpacity(0.2);
      case InstructionType.start:
        return AppColors.startPoint.withOpacity(0.2);
      default:
        return AppColors.primaryLight;
    }
  }

  Color _getTextPrimaryColor() {
    switch (step.type) {
      case InstructionType.destination:
        return AppColors.success;
      default:
        return AppColors.textPrimary;
    }
  }

  Color _getTextSecondaryColor() {
    return AppColors.textSecondary;
  }
}
