@echo off
echo ========================================
echo INSTALANDO DEPENDENCIAS - RIEGO-SMART
echo ========================================

echo.
echo [1/4] Instalando Auth Service...
cd backend\services\auth-service
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo en Auth Service
    exit /b 1
)

echo.
echo [2/4] Instalando Sensor Service...
cd ..\..\..
cd backend\services\sensor-service
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo en Sensor Service
    exit /b 1
)

echo.
echo [3/4] Instalando Analysis Service...
cd ..\..\..
cd backend\services\analysis-service
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo en Analysis Service
    exit /b 1
)

echo.
echo [4/4] Instalando Notification Service...
cd ..\..\..
cd backend\services\notification-service
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo en Notification Service
    exit /b 1
)

echo.
echo ========================================
echo INSTALACION COMPLETADA EXITOSAMENTE!
echo ========================================
echo.
echo Ahora puedes ejecutar los servicios:
echo.
echo Terminal 1: cd backend\services\auth-service ^&^& npm start
echo Terminal 2: cd backend\services\sensor-service ^&^& npm start
echo Terminal 3: cd backend\services\analysis-service ^&^& npm start
echo Terminal 4: cd backend\services\notification-service ^&^& npm start
echo.
