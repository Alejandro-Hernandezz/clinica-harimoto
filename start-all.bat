@echo off
echo ==========================================
echo 🚀 INICIANDO RIEGO-SMART - TODOS LOS SERVICIOS
echo ==========================================
echo.

REM Verificar PostgreSQL
echo Verificando PostgreSQL...
docker-compose ps | findstr "riego-smart-postgres" | findstr "Up" >nul
if errorlevel 1 (
    echo ⚠️  PostgreSQL no está corriendo. Iniciando...
    docker-compose up -d postgres
    echo Esperando 15 segundos a que PostgreSQL esté listo...
    timeout /t 15 /nobreak >nul
)

echo ✅ PostgreSQL está corriendo
echo.

REM Iniciar Auth Service
echo 🔄 Iniciando Auth Service (puerto 3000)...
start "Auth Service" cmd /k "cd backend\services\auth-service && npm start"
timeout /t 2 /nobreak >nul

REM Iniciar Sensor Service
echo 🔄 Iniciando Sensor Service (puerto 3001)...
start "Sensor Service" cmd /k "cd backend\services\sensor-service && npm start"
timeout /t 2 /nobreak >nul

REM Iniciar Analysis Service
echo 🔄 Iniciando Analysis Service (puerto 3002)...
start "Analysis Service" cmd /k "cd backend\services\analysis-service && npm start"
timeout /t 2 /nobreak >nul

REM Iniciar Notification Service
echo 🔄 Iniciando Notification Service (puerto 3003)...
start "Notification Service" cmd /k "cd backend\services\notification-service && npm start"

echo.
echo ==========================================
echo ✅ TODOS LOS SERVICIOS INICIADOS
echo ==========================================
echo.
echo Puertos:
echo   - Auth Service:         http://localhost:3000
echo   - Sensor Service:       http://localhost:3001
echo   - Analysis Service:     http://localhost:3002
echo   - Notification Service: http://localhost:3003
echo.
echo Para detener todos los servicios, cierra las ventanas de CMD.
echo.
pause
