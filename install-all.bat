@echo off
cls
echo ==========================================
echo INSTALANDO DEPENDENCIAS - RIEGO SMART
echo ==========================================
echo.

cd backend\services\auth-service
echo [1/4] Auth Service...
call npm install --silent
cd ..\..\..

cd backend\services\sensor-service
echo [2/4] Sensor Service...
call npm install --silent
cd ..\..\..

cd backend\services\analysis-service
echo [3/4] Analysis Service...
call npm install --silent
cd ..\..\..

cd backend\services\notification-service
echo [4/4] Notification Service...
call npm install --silent
cd ..\..\..

echo.
echo ==========================================
echo INSTALACION COMPLETA
echo ==========================================
echo.
echo Ahora ejecuta: start-all.bat
pause
