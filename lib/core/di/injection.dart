import 'package:get_it/get_it.dart';
import '../../data/datasources/school_data_source.dart';
import '../../services/navigation_service.dart';

final getIt = GetIt.instance;

/// Inicjalizuje dependency injection
Future<void> setupDependencies() async {
  // Data sources
  final schoolDataSource = SchoolDataSource();
  await schoolDataSource.loadData();
  getIt.registerSingleton<SchoolDataSource>(schoolDataSource);

  // Services
  getIt.registerLazySingleton<NavigationService>(
    () => NavigationService(getIt<SchoolDataSource>()),
  );
}
