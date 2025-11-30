@echo off
echo Verificando bases de datos...
docker-compose exec postgres psql -U riego_admin -d postgres -c "\l"
echo.
echo Si ves auth_service, sensor_service, analysis_service y notification_service, todo esta bien.
pause
