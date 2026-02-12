import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/di/injection.dart';
import '../../../data/datasources/school_data_source.dart';
import '../../../data/models/models.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<NavNode> _searchResults = [];
  List<NavNode> _allRooms = [];
  String? _startNodeId;

  @override
  void initState() {
    super.initState();
    _loadRooms();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is Map<String, dynamic>) {
      _startNodeId = args['startNodeId'] as String?;
    }
  }

  void _loadRooms() {
    final dataSource = getIt<SchoolDataSource>();
    _allRooms = dataSource.getRooms();
    // Sortuj sale według nazwy (numeru)
    _allRooms.sort((a, b) => _compareRoomNames(a.displayName, b.displayName));
    _searchResults = List.from(_allRooms);
  }

  /// Porównuje nazwy sal uwzględniając numery
  int _compareRoomNames(String a, String b) {
    // Wyciągnij początkową część numeryczną lub literową
    final regExp = RegExp(r'^(\d+|[A-Za-z]+)');
    final matchA = regExp.firstMatch(a);
    final matchB = regExp.firstMatch(b);

    if (matchA == null || matchB == null) {
      return a.compareTo(b);
    }

    final partA = matchA.group(0)!;
    final partB = matchB.group(0)!;

    // Jeśli obie części są liczbami, porównaj jako liczby
    final numA = int.tryParse(partA);
    final numB = int.tryParse(partB);

    if (numA != null && numB != null) {
      if (numA != numB) return numA.compareTo(numB);
      // Jeśli numery równe, porównaj resztę
      return a.compareTo(b);
    }

    // W przeciwnym razie porównaj alfabetycznie
    return a.compareTo(b);
  }

  void _onSearchChanged(String query) {
    if (query.isEmpty) {
      setState(() {
        _searchResults = List.from(_allRooms);
      });
    } else {
      final dataSource = getIt<SchoolDataSource>();
      setState(() {
        _searchResults = dataSource.searchRooms(query);
        _searchResults.sort(
          (a, b) => _compareRoomNames(a.displayName, b.displayName),
        );
      });
    }
  }

  void _onRoomSelected(NavNode room) {
    if (_startNodeId == null) {
      // Domyślnie nawiguj od głównego wejścia (PUNKT_1) do wybranej sali
      Navigator.pushNamed(
        context,
        '/navigation',
        arguments: {'startNodeId': 'PUNKT_1', 'endNodeId': room.id},
      );
    } else {
      // Mamy ustalony start (np. z QR kodu), więc nawiguj do wybranej sali
      Navigator.pushNamed(
        context,
        '/navigation',
        arguments: {'startNodeId': _startNodeId, 'endNodeId': room.id},
      );
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dataSource = getIt<SchoolDataSource>();

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppStrings.searchTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.map_outlined),
            tooltip: 'Plan szkoły',
            onPressed: () => Navigator.pushNamed(context, '/plan'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Pole wyszukiwania
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: AppStrings.searchPlaceholder,
                prefixIcon: const Icon(Icons.search),
                suffixIcon:
                    _searchController.text.isNotEmpty
                        ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            _searchController.clear();
                            _onSearchChanged('');
                          },
                        )
                        : null,
              ),
              onChanged: _onSearchChanged,
            ),
          ),

          // Info o punkcie startowym
          if (_startNodeId != null)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on, color: AppColors.startPoint),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Punkt startowy:',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        Text(
                          dataSource.getNodeById(_startNodeId!)?.displayName ??
                              _startNodeId!,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 8),

          // Nagłówek listy
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text(
                  _searchController.text.isEmpty
                      ? AppStrings.searchAllRooms
                      : '${_searchResults.length} wyników',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
          ),

          // Lista sal
          Expanded(
            child:
                _searchResults.isEmpty
                    ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.search_off,
                            size: 64,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            AppStrings.searchNoResults,
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ],
                      ),
                    )
                    : ListView.builder(
                      itemCount: _searchResults.length,
                      itemBuilder: (context, index) {
                        final room = _searchResults[index];
                        final floor = dataSource.getFloorById(room.floorId);

                        return ListTile(
                          leading: CircleAvatar(
                            backgroundColor: AppColors.primaryLight,
                            child: Text(
                              room.id.length > 3
                                  ? room.id.substring(0, 3)
                                  : room.id,
                              style: const TextStyle(
                                color: AppColors.primaryDark,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                          title: Text(room.displayName),
                          subtitle: Text(floor?.name ?? ''),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => _onRoomSelected(room),
                        );
                      },
                    ),
          ),
        ],
      ),
    );
  }
}
