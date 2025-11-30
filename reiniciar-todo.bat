@echo off
echo Deteniendo todo...
docker-compose down -v

echo.
echo Iniciando PostgreSQL limpio...
docker-compose up -d postgres

echo.
echo Esperando 20 segundos...
timeout /t 20 /nobreak

echo.
echo Creando bases de datos...
docker-compose exec postgres psql -U postgres -d postgres -c "CREATE DATABASE auth_service;"
docker-compose exec postgres psql -U postgres -d postgres -c "CREATE DATABASE sensor_service;"
docker-compose exec postgres psql -U postgres -d postgres -c "CREATE DATABASE analysis_service;"
docker-compose exec postgres psql -U postgres -d postgres -c "CREATE DATABASE notification_service;"

echo.
echo LISTO. Ahora ejecuta: start-all.bat
pause
