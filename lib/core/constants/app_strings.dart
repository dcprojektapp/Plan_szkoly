/// Stałe tekstowe aplikacji (język polski)
class AppStrings {
  AppStrings._();

  // Nazwa aplikacji
  static const String appName = 'Zespół Szkół nr 3';
  static const String appTagline = 'Nawigacja wewnątrz szkoły';

  // Ekran główny
  static const String homeTitle = 'Witaj w SchoolNav';
  static const String scanQrButton = 'SKANUJ KOD PRZY SALI';
  static const String orDivider = 'lub';
  static const String enterRoomNumber = 'Wpisz numer sali';
  static const String whereToGo = 'Dokąd chcesz iść?';
  static const String searchPlaceholder = 'Szukaj sali...';

  // Skaner QR
  static const String scannerTitle = 'Skanuj kod QR';
  static const String scannerHint = 'Skieruj kamerę na kod QR przy sali';
  static const String scannerError = 'Nie rozpoznano kodu';
  static const String scannerSuccess = 'Kod rozpoznany!';

  // Nawigacja
  static const String navigationTitle = 'Nawigacja';
  static const String routeFound = 'Trasa wyznaczona';
  static const String routeNotFound = 'Nie znaleziono trasy';
  static const String estimatedTime = 'Szacowany czas';
  static const String startNavigation = 'Rozpocznij nawigację';
  static const String endNavigation = 'Zakończ';
  static const String nextStep = 'Następny krok';
  static const String previousStep = 'Poprzedni krok';

  // Instrukcje nawigacyjne
  static const String instructionStart = 'Rozpocznij tutaj';
  static const String instructionWalkStraight = 'Idź prosto';
  static const String instructionTurnLeft = 'Skręć w lewo';
  static const String instructionTurnRight = 'Skręć w prawo';
  static const String instructionStairsUp = 'Wejdź po schodach';
  static const String instructionStairsDown = 'Zejdź po schodach';
  static const String instructionElevator = 'Użyj windy';
  static const String instructionChangeBuilding = 'Przejdź do innego budynku';
  static const String instructionDestination = 'Cel osiągnięty!';

  // Wyszukiwanie
  static const String searchTitle = 'Wybierz cel';
  static const String searchNoResults = 'Nie znaleziono sal';
  static const String searchRecentRooms = 'Ostatnio odwiedzane';
  static const String searchAllRooms = 'Wszystkie sale';

  // Błędy
  static const String errorGeneric = 'Wystąpił błąd';
  static const String errorRoomNotFound = 'Nie znaleziono sali';
  static const String errorCameraPermission = 'Brak dostępu do kamery';
  static const String errorNoRoute = 'Nie można wyznaczyć trasy';

  // Przyciski
  static const String buttonOk = 'OK';
  static const String buttonCancel = 'Anuluj';
  static const String buttonRetry = 'Spróbuj ponownie';
  static const String buttonBack = 'Wróć';

  // Piętro
  static const String floor = 'Piętro';
  static const String groundFloor = 'Parter';
}
