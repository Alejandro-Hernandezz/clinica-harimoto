#!/bin/bash

echo "=========================================="
echo "ARREGLANDO BASE DE DATOS POSTGRESQL"
echo "=========================================="
echo ""

echo "[1/3] Deteniendo contenedor de PostgreSQL..."
docker-compose stop postgres

echo ""
echo "[2/3] Eliminando contenedor y volumen..."
docker-compose rm -f postgres
docker volume rm clinica-harimoto_postgres_data 2>/dev/null || true

echo ""
echo "[3/3] Recreando PostgreSQL con script corregido..."
cp init-db-fixed.sql init-db.sql
docker-compose up -d postgres

echo ""
echo "Esperando 15 segundos a que PostgreSQL inicie..."
sleep 15

echo ""
echo "=========================================="
echo "✅ BASE DE DATOS ARREGLADA"
echo "=========================================="
echo ""
echo "Ahora puedes ejecutar los servicios:"
echo "  ./start-all.sh"
echo ""
