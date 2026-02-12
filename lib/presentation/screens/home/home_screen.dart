import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/di/injection.dart';
import '../../../data/datasources/school_data_source.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _roomController = TextEditingController();
  String? _startNodeId;
  String? _errorMessage;

  @override
  void dispose() {
    _roomController.dispose();
    super.dispose();
  }

  void _onScanQr() {
    Navigator.pushNamed(context, '/scanner').then((result) {
      if (result != null && result is String) {
        setState(() {
          _startNodeId = result;
          _errorMessage = null;
        });
        _showDestinationSearch();
      }
    });
  }

  void _onRoomNumberSubmitted(String value) {
    if (value.isEmpty) return;

    final dataSource = getIt<SchoolDataSource>();
    final node = dataSource.getNodeById(value.toUpperCase());

    if (node != null) {
      setState(() {
        _startNodeId = node.id;
        _errorMessage = null;
      });
      _showDestinationSearch();
    } else {
      // Spróbuj wyszukać
      final results = dataSource.searchRooms(value);
      if (results.isNotEmpty) {
        setState(() {
          _startNodeId = results.first.id;
          _errorMessage = null;
        });
        _showDestinationSearch();
      } else {
        setState(() {
          _errorMessage = AppStrings.errorRoomNotFound;
        });
      }
    }
  }

  void _showDestinationSearch() {
    Navigator.pushNamed(
      context,
      '/search',
      arguments: {'startNodeId': _startNodeId},
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  const Spacer(),

                  // Logo i tytuł
                  const Icon(Icons.school, size: 80, color: AppColors.primary),
                  const SizedBox(height: 16),
                  Text(
                    AppStrings.appName,
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    AppStrings.appTagline,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),

                  const Spacer(),

                  // Przycisk skanowania QR
                  ElevatedButton.icon(
                    onPressed: _onScanQr,
                    icon: const Icon(Icons.qr_code_scanner, size: 28),
                    label: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 4),
                      child: Text(
                        AppStrings.scanQrButton,
                        textAlign: TextAlign.center,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 72),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Divider "lub"
                  Row(
                    children: [
                      const Expanded(child: Divider()),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          AppStrings.orDivider,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                      const Expanded(child: Divider()),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Pole do wpisania numeru sali
                  TextField(
                    controller: _roomController,
                    decoration: InputDecoration(
                      hintText: AppStrings.enterRoomNumber,
                      prefixIcon: const Icon(Icons.meeting_room),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.arrow_forward),
                        onPressed:
                            () => _onRoomNumberSubmitted(_roomController.text),
                      ),
                      errorText: _errorMessage,
                    ),
                    textInputAction: TextInputAction.go,
                    textCapitalization: TextCapitalization.characters,
                    onSubmitted: _onRoomNumberSubmitted,
                  ),

                  // Info o punkcie startowym
                  if (_startNodeId != null) ...[
                    const SizedBox(height: 16),
                    Card(
                      color: AppColors.surfaceVariant,
                      child: ListTile(
                        leading: const Icon(
                          Icons.location_on,
                          color: AppColors.success,
                        ),
                        title: const Text('Punkt startowy'),
                        subtitle: Text(_getNodeName(_startNodeId!)),
                        trailing: IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => setState(() => _startNodeId = null),
                        ),
                      ),
                    ),
                  ],

                  const Spacer(),

                  // Przycisk "Dokąd chcesz iść?"
                  if (_startNodeId != null)
                    OutlinedButton.icon(
                      onPressed: _showDestinationSearch,
                      icon: const Icon(Icons.search),
                      label: const Text(AppStrings.whereToGo),
                    ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
            // Przycisk mapy w prawym górnym rogu
            Positioned(
              top: 16,
              right: 16,
              child: IconButton(
                onPressed: () => Navigator.pushNamed(context, '/plan'),
                icon: const Icon(Icons.map_outlined, size: 32),
                color: AppColors.primary,
                tooltip: 'Plan szkoły',
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.surfaceVariant,
                  padding: const EdgeInsets.all(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getNodeName(String nodeId) {
    final dataSource = getIt<SchoolDataSource>();
    final node = dataSource.getNodeById(nodeId);
    return node?.displayName ?? nodeId;
  }
}
