# RIEGO-SMART - Sistema SOA con Microservicios

Sistema autocontenido SIN DEPENDENCIAS EXTERNAS. Todo funciona localmente.

## INSTALACION (SOLO 2 PASOS)

### 1. Instala dependencias

```cmd
cd backend\services\auth-service && npm install && cd ..\..\..
cd backend\services\sensor-service && npm install && cd ..\..\..
cd backend\services\analysis-service && npm install && cd ..\..\..
cd backend\services\notification-service && npm install && cd ..\..\..
```

### 2. Inicia los 4 servicios (4 terminales)

```cmd
Terminal 1: cd backend\services\auth-service && node src\app-simple.js
Terminal 2: cd backend\services\sensor-service && node src\app-simple.js
Terminal 3: cd backend\services\analysis-service && node src\app-simple.js
Terminal 4: cd backend\services\notification-service && node src\app-simple.js
```

### 3. Abre el frontend

Abre `frontend/index.html` en Chrome/Firefox

## ARQUITECTURA

### Microservicios (SOA)
- **Auth Service** (Puerto 3000) - Autenticación JWT
- **Sensor Service** (Puerto 3001) - Gestión de sensores y simulador
- **Analysis Service** (Puerto 3002) - Análisis de datos y alertas
- **Notification Service** (Puerto 3003) - Notificaciones SMS/Email

### Comunicación
- **HTTP/REST** - Cada servicio expone APIs REST
- **Sin Message Broker** - Comunicación directa entre servicios

### Base de Datos
- **SQLite** - Cada servicio tiene su propia BD local en archivo
- **Sin configuración** - Se crea automáticamente
- **Sin credenciales** - No requiere usuario/password

## CARACTERISTICAS

✅ Sin Docker
✅ Sin MySQL/PostgreSQL
✅ Sin problemas de credenciales
✅ Sin configuración manual
✅ Todo automático
✅ Simulador de sensores incluido
✅ Frontend web incluido

## USO

1. Registrate en el frontend
2. Crea sensores
3. Simula lecturas
4. Ve alertas y notificaciones

Las bases de datos se crean automáticamente en:
- `backend/services/auth-service/database.sqlite`
- `backend/services/sensor-service/database.sqlite`
- `backend/services/analysis-service/database.sqlite`
- `backend/services/notification-service/database.sqlite`

Todo funciona sin configuración adicional.
