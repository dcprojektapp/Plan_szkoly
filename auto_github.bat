@echo off
cls
echo ==========================================
echo        AUTOMATYCZNE PUBLIKOWANIE
echo ==========================================

:: Pobranie adresu repo
set /p REPO_URL=Podaj adres repozytorium GitHub (HTTPS lub SSH): 

:: Generowanie daty do commita
for /f "tokens=1-4 delims=/.- " %%a in ("%date%") do (
    set DATA=%%a-%%b-%%c
)

for /f "tokens=1-2 delims=: " %%a in ("%time%") do (
    set GODZ=%%a-%%b
)

set COMMIT_MSG=Auto commit %DATA% %GODZ%

:: Jesli brak repo git - inicjalizacja
if not exist ".git" (
    echo.
    echo Inicjalizacja repozytorium...
    git init
)

echo.
echo Dodawanie plikow...
git add .

echo.
echo Tworzenie commita...
git commit -m "%COMMIT_MSG%"

echo.
echo Ustawianie brancha main...
git branch -M main

echo.
echo Ustawianie origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo Wysylanie na GitHub...
git push -u origin main

echo.
echo ==========================================
echo                GOTOWE
echo ==========================================
pause
