@echo off
echo Creando bases de datos...
echo.

docker-compose exec postgres psql -U postgres -d postgres -c "CREATE DATABASE auth_service;"
docker-compose exec postgres psql -U postgres -d postgres -c "CREATE DATABASE sensor_service;"
docker-compose exec postgres psql -U postgres -d postgres -c "CREATE DATABASE analysis_service;"
docker-compose exec postgres psql -U postgres -d postgres -c "CREATE DATABASE notification_service;"

echo.
echo LISTO. Bases de datos creadas.
echo Ejecuta: start-all.bat
pause
