@echo off
echo Deteniendo PostgreSQL...
docker-compose stop postgres

echo Eliminando contenedor y datos antiguos...
docker-compose rm -f postgres
docker volume rm clinica-harimoto_postgres_data

echo Iniciando PostgreSQL...
docker-compose up -d postgres

echo Esperando 20 segundos...
timeout /t 20 /nobreak

echo Creando bases de datos...
docker-compose exec -T postgres psql -U riego_admin -d postgres < create-databases.sql

echo LISTO. Ahora ejecuta: start-all.bat
pause
