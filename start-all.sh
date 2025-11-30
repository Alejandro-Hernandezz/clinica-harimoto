#!/bin/bash

echo "=========================================="
echo "🚀 INICIANDO RIEGO-SMART - TODOS LOS SERVICIOS"
echo "=========================================="
echo ""

# Verificar que PostgreSQL esté corriendo
echo "Verificando PostgreSQL..."
if ! docker-compose ps | grep -q "riego-smart-postgres.*Up"; then
    echo "⚠️  PostgreSQL no está corriendo. Iniciando..."
    docker-compose up -d postgres
    echo "Esperando 15 segundos a que PostgreSQL esté listo..."
    sleep 15
fi

echo "✅ PostgreSQL está corriendo"
echo ""

# Función para abrir terminal y ejecutar servicio
start_service() {
    SERVICE_NAME=$1
    SERVICE_PATH=$2
    PORT=$3

    echo "🔄 Abriendo terminal para $SERVICE_NAME (puerto $PORT)..."

    # Detectar sistema operativo y abrir terminal apropiada
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell app \"Terminal\" to do script \"cd $PWD/$SERVICE_PATH && npm start\""
    elif [[ -n "$DISPLAY" ]]; then
        # Linux con X11
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal --title="$SERVICE_NAME" -- bash -c "cd $SERVICE_PATH && npm start; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -title "$SERVICE_NAME" -e "cd $SERVICE_PATH && npm start; bash" &
        else
            echo "⚠️  No se encontró emulador de terminal. Por favor, abre manualmente: cd $SERVICE_PATH && npm start"
        fi
    else
        echo "⚠️  Ejecuta manualmente en una nueva terminal: cd $SERVICE_PATH && npm start"
    fi
}

# Iniciar servicios
start_service "Auth Service" "backend/services/auth-service" "3000"
sleep 2
start_service "Sensor Service" "backend/services/sensor-service" "3001"
sleep 2
start_service "Analysis Service" "backend/services/analysis-service" "3002"
sleep 2
start_service "Notification Service" "backend/services/notification-service" "3003"

echo ""
echo "=========================================="
echo "✅ TODOS LOS SERVICIOS INICIADOS"
echo "=========================================="
echo ""
echo "Puertos:"
echo "  - Auth Service:         http://localhost:3000"
echo "  - Sensor Service:       http://localhost:3001"
echo "  - Analysis Service:     http://localhost:3002"
echo "  - Notification Service: http://localhost:3003"
echo ""
echo "Para detener todos los servicios, cierra las terminales o presiona Ctrl+C en cada una."
echo ""
