@echo off
cls
echo ==========================================
echo INICIANDO SERVICIOS - RIEGO SMART
echo ==========================================
echo.

start "Auth Service - Puerto 3000" cmd /k "cd backend\services\auth-service && node src\app-simple.js"
timeout /t 2 /nobreak >nul

start "Sensor Service - Puerto 3001" cmd /k "cd backend\services\sensor-service && node src\app-simple.js"
timeout /t 2 /nobreak >nul

start "Analysis Service - Puerto 3002" cmd /k "cd backend\services\analysis-service && node src\app-simple.js"
timeout /t 2 /nobreak >nul

start "Notification Service - Puerto 3003" cmd /k "cd backend\services\notification-service && node src\app-simple.js"

echo.
echo Servicios iniciados en 4 ventanas
echo Puertos: 3000, 3001, 3002, 3003
echo.
pause
