# 🌱 RIEGO-SMART - Sistema Inteligente de Gestión de Riego Agrícola

Sistema modular, escalable y **totalmente funcional** que automatiza la gestión de riego agrícola mediante arquitectura SOA, Microservicios y Message Broker **sin requerir hardware Arduino físico**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.12-orange.svg)](https://www.rabbitmq.com/)

---

## 📋 RESUMEN EJECUTIVO

**RIEGO-SMART** es un sistema completo de gestión de riego que demuestra patrones de arquitectura modernos aplicados a la agricultura de precisión:

### ✅ Características Clave

- 🎯 **Sistema 100% Funcional** - No requiere hardware Arduino, usa simulador de datos realistas
- 🏗️ **Arquitectura SOA y Microservicios** - 4 servicios independientes con responsabilidades únicas
- 📨 **Message Broker (RabbitMQ)** - Comunicación asíncrona y desacoplada
- 🔐 **Autenticación JWT** - Seguridad robusta con tokens
- 📊 **Análisis Inteligente** - Detección automática de anomalías y generación de alertas
- 🔔 **Sistema de Notificaciones** - Alertas en tiempo real (SMS/Email simulados)
- 🎨 **Dashboard Web** - Interfaz moderna y responsive (React)
- 📝 **Código Profesional** - Documentado, modularizado y siguiendo mejores prácticas

---

## 🏗️ ARQUITECTURA

### Patrones Implementados

#### 1. **SOA (Service-Oriented Architecture)**
Servicios independientes con APIs REST bien definidas que exponen funcionalidades específicas.

#### 2. **Microservicios**
Cada servicio con:
- ✅ Puerto independiente
- ✅ Base de datos descentralizada
- ✅ Deployment autónomo
- ✅ Responsabilidad única

#### 3. **Message Broker (RabbitMQ)**
Comunicación asíncrona mediante colas de mensajes:
- `sensor.data.received`: Sensor Service → Analysis Service
- `alert.generated`: Analysis Service → Notification Service
- `notification.sent`: Notification Service → Dashboard

### Servicios

| Servicio | Puerto | Descripción | Base de Datos |
|----------|--------|-------------|---------------|
| **Auth Service** | 3000 | Autenticación y gestión de usuarios | auth_service |
| **Sensor Service** | 3001 | Gestión de sensores y datos + **Simulador** | sensor_service |
| **Analysis Service** | 3002 | Análisis de datos y generación de alertas | analysis_service |
| **Notification Service** | 3003 | Envío de notificaciones (simulado) | notification_service |

---

## 🚀 QUICK START

### Requisitos Previos

- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **Docker** y **Docker Compose** ([Descargar](https://www.docker.com/))
- **Git**

### Instalación

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd clinica-harimoto

# 2. Levantar infraestructura (PostgreSQL, RabbitMQ, Redis)
docker-compose up -d

# Esperar ~30 segundos a que los servicios estén listos
# Verificar: docker-compose ps

# 3. Instalar dependencias y ejecutar cada servicio

# Terminal 1: Auth Service
cd backend/services/auth-service
npm install
npm start
# ✅ Escuchando en puerto 3000

# Terminal 2: Sensor Service
cd backend/services/sensor-service
npm install
npm start
# ✅ Escuchando en puerto 3001

# Terminal 3: Analysis Service
cd backend/services/analysis-service
npm install
npm start
# ✅ Escuchando en puerto 3002

# Terminal 4: Notification Service
cd backend/services/notification-service
npm install
npm start
# ✅ Escuchando en puerto 3003
```

---

## 🤖 SIMULADOR DE SENSORES (SIN ARDUINO)

El sistema incluye un **simulador completo** que genera datos realistas sin hardware físico.

### Modos de Simulación

#### 1. **Modo BULK** - Datos históricos

Genera múltiples datos en una llamada (ideal para llenar historial inicial):

```bash
POST http://localhost:3001/api/sensores/:id/simular/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "cantidad": 288,    // 288 datos = 24 horas (1 dato cada 5 min)
  "horasAtras": 24
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "288 datos generados exitosamente",
  "data": {
    "total": 288,
    "sensor": "Sensor Humedad - Parcela 1"
  }
}
```

#### 2. **Modo STREAM** - Tiempo real

Genera datos continuamente y los publica a RabbitMQ:

```bash
POST http://localhost:3001/api/sensores/:id/simular/stream/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "duracionMinutos": 60,
  "intervaloSegundos": 5
}
```

#### 3. **Eventos Especiales** - Escenarios de prueba

Simula situaciones específicas para probar alertas:

**Sequía (Humedad baja):**
```bash
POST http://localhost:3001/api/sensores/:id/simular/evento
Authorization: Bearer <token>
Content-Type: application/json

{
  "evento": "sequia"
}
```

**Lluvia (Humedad alta):**
```json
{
  "evento": "lluvia"
}
```

**Temperatura Crítica:**
```json
{
  "evento": "temperatura-critica"
}
```

### Datos Generados

El simulador crea datos realistas con:

- ✅ **Variación gradual** - No cambios abruptos
- ✅ **Ciclos día/noche** - Temperatura sigue patrón solar
- ✅ **Rangos reales** - Humedad: 20%-80%, Temperatura: 15°C-35°C
- ✅ **Contexto** - Incluye temperatura ambiente

---

## 📊 FLUJO DE DATOS COMPLETO

```
USUARIO → Generar Datos Simulados
    ↓
SENSOR SERVICE
  ├─ SimulatorService.generarBulk(288 datos)
  ├─ Guardar en BD (SensorData)
  └─ Publicar a RabbitMQ "sensor.data.received"
    ↓
ANALYSIS SERVICE (Consumer)
  ├─ Recibir dato: { humedad: 28%, sensorId: "..." }
  ├─ Aplicar reglas: 28% < 30% → RIEGO_NECESARIO ✓
  ├─ Crear Alert en BD
  └─ Publicar a RabbitMQ "alert.generated"
    ↓
NOTIFICATION SERVICE (Consumer)
  ├─ Recibir alerta
  ├─ Obtener preferencias usuario
  ├─ Simular envío SMS: "Alerta: Riego necesario..."
  ├─ Simular envío EMAIL
  ├─ Guardar Notification (estado: ENVIADA)
  └─ Publicar "notification.sent"
    ↓
DASHBOARD (Usuario)
  ✅ Badge: "3 alertas sin leer"
  ✅ Notificación Toast: "Alerta: Riego necesario"
  ✅ Ver en AlertsCenter con recomendación
```

---

## 🧪 TESTING - Casos de Uso

### Caso 1: Registro y Login

```bash
# 1. Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agricultor@ejemplo.com",
    "password": "password123",
    "nombre": "Juan Pérez",
    "telefonoPropiedad": "8123456789"
  }'

# Respuesta: { "token": "eyJhbGc..." }

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agricultor@ejemplo.com",
    "password": "password123"
  }'

# Guardar el token para siguientes peticiones
```

### Caso 2: Crear Sensor y Generar Datos

```bash
# 3. Crear sensor de humedad
curl -X POST http://localhost:3001/api/sensores \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Sensor Humedad - Parcela A",
    "tipo": "HUMEDAD",
    "ubicacion": "Parcela A - Zona Norte",
    "umbralMinimo": 30,
    "umbralMaximo": 70
  }'

# Respuesta: { "id": "550e8400-e29b-41d4-a716-446655440000", ... }

# 4. Generar datos históricos (24 horas)
curl -X POST http://localhost:3001/api/sensores/550e8400-e29b-41d4-a716-446655440000/simular/bulk \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 288,
    "horasAtras": 24
  }'

# Respuesta: { "total": 288, "sensor": "Sensor Humedad - Parcela A" }
```

### Caso 3: Verificar Alertas Generadas

```bash
# 5. Obtener alertas del usuario
curl -X GET "http://localhost:3002/api/alertas?leida=false" \
  -H "Authorization: Bearer <token>"

# Respuesta:
# [
#   {
#     "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
#     "tipo": "RIEGO_NECESARIO",
#     "severidad": "ALTA",
#     "mensaje": "Humedad baja detectada en Parcela A: 28%",
#     "recomendacion": "Activar sistema de riego inmediatamente",
#     "leida": false
#   }
# ]

# 6. Marcar alerta como leída
curl -X PUT http://localhost:3002/api/alertas/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/leer \
  -H "Authorization: Bearer <token>"
```

### Caso 4: Ver Notificaciones

```bash
# 7. Obtener notificaciones enviadas
curl -X GET http://localhost:3003/api/notificaciones \
  -H "Authorization: Bearer <token>"

# Respuesta:
# [
#   {
#     "id": "a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
#     "tipo": "SMS",
#     "estado": "ENVIADA",
#     "contenido": "🚨 ALERTA ALTA: Humedad baja detectada en Parcela A: 28%",
#     "intentos": 1
#   },
#   {
#     "tipo": "EMAIL",
#     "estado": "ENVIADA",
#     ...
#   }
# ]
```

---

## 📡 API ENDPOINTS COMPLETA

### Auth Service (Puerto 3000)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/auth/profile` | Obtener perfil | Sí |
| PUT | `/api/auth/profile` | Actualizar perfil | Sí |
| PUT | `/api/auth/change-password` | Cambiar contraseña | Sí |
| GET | `/api/usuarios` | Listar usuarios | Sí |

### Sensor Service (Puerto 3001)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/sensores` | Crear sensor | Sí |
| GET | `/api/sensores` | Listar sensores | Sí |
| GET | `/api/sensores/:id` | Obtener sensor | Sí |
| PUT | `/api/sensores/:id` | Actualizar sensor | Sí |
| DELETE | `/api/sensores/:id` | Eliminar sensor | Sí |
| POST | `/api/sensores/:id/datos` | Guardar dato manual | Sí |
| GET | `/api/sensores/:id/datos/historial` | Obtener historial | Sí |
| GET | `/api/sensores/:id/estadisticas` | Obtener estadísticas | Sí |
| POST | `/api/sensores/:id/simular/bulk` | **Generar datos bulk** | Sí |
| POST | `/api/sensores/:id/simular/stream/start` | **Iniciar stream** | Sí |
| POST | `/api/sensores/:id/simular/stream/stop` | **Detener stream** | Sí |
| POST | `/api/sensores/:id/simular/evento` | **Generar evento** | Sí |

### Analysis Service (Puerto 3002)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/alertas` | Listar alertas | Sí |
| PUT | `/api/alertas/:id/leer` | Marcar como leída | Sí |
| PUT | `/api/alertas/:id/resolver` | Resolver alerta | Sí |

### Notification Service (Puerto 3003)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/notificaciones` | Listar notificaciones | Sí |

---

## 🔧 TECNOLOGÍAS

### Backend

- **Node.js** 18+ - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticación basada en tokens
- **bcrypt** - Hash de contraseñas
- **RabbitMQ (amqplib)** - Message broker
- **Helmet** - Seguridad HTTP headers
- **CORS** - Cross-Origin Resource Sharing

### Infraestructura

- **PostgreSQL 15** - Base de datos relacional
- **RabbitMQ 3.12** - Message broker
- **Redis 7** - Cache (opcional)
- **Docker & Docker Compose** - Containerización

---

## 📂 ESTRUCTURA DEL PROYECTO

```
riego-smart/
│
├── docker-compose.yml              # Orquestación: PostgreSQL, RabbitMQ, Redis
├── init-db.sql                     # Script inicialización BD
│
├── backend/
│   │
│   ├── shared/                     # Código compartido
│   │   ├── messagebroker/
│   │   │   ├── RabbitMQClient.js   # Cliente RabbitMQ reutilizable
│   │   │   └── queueConfig.js      # Configuración de colas
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # Validación JWT
│   │   │   ├── errorHandler.js     # Manejo de errores
│   │   │   └── logger.js           # Logging estructurado
│   │   └── utils/
│   │       ├── validators.js       # Validaciones
│   │       ├── constants.js        # Constantes
│   │       └── helpers.js          # Funciones auxiliares
│   │
│   └── services/
│       │
│       ├── auth-service/           # 🔐 Puerto 3000
│       │   ├── src/
│       │   │   ├── models/User.js
│       │   │   ├── services/
│       │   │   ├── controllers/
│       │   │   ├── routes/
│       │   │   └── app.js
│       │   └── package.json
│       │
│       ├── sensor-service/         # 📊 Puerto 3001
│       │   ├── src/
│       │   │   ├── models/
│       │   │   │   ├── Sensor.js
│       │   │   │   └── SensorData.js
│       │   │   ├── services/
│       │   │   │   ├── sensorService.js
│       │   │   │   ├── dataService.js
│       │   │   │   └── simulatorService.js    # ⭐ SIMULADOR
│       │   │   ├── controllers/
│       │   │   ├── routes/
│       │   │   └── app.js
│       │   └── package.json
│       │
│       ├── analysis-service/       # 🔍 Puerto 3002
│       │   ├── src/
│       │   │   ├── models/Alert.js
│       │   │   ├── services/analysisService.js
│       │   │   ├── consumers/sensorDataConsumer.js
│       │   │   ├── config/alertRules.js
│       │   │   └── app.js
│       │   └── package.json
│       │
│       └── notification-service/   # 🔔 Puerto 3003
│           ├── src/
│           │   └── app.js          # Todo integrado
│           └── package.json
│
└── docs/
    ├── ARCHITECTURE.md
    └── API.md
```

---

## 🛡️ REGLAS DE ALERTAS

El sistema aplica las siguientes reglas automáticamente:

| Regla | Condición | Severidad | Acción |
|-------|-----------|-----------|--------|
| **RIEGO_NECESARIO** | Humedad < 30% | ALTA | Notificar + Activar riego |
| **HUMEDAD_EXCESIVA** | Humedad > 80% | MEDIA | Notificar + Verificar drenaje |
| **TEMPERATURA_CRITICA** | Temperatura > 40°C | CRITICA | Notificar + Sistemas de enfriamiento |
| **TEMPERATURA_BAJA** | Temperatura < 10°C | ALTA | Notificar + Proteger cultivos |

---

## 🐳 DOCKER COMPOSE

Los servicios de infraestructura se levantan con Docker:

```yaml
# PostgreSQL, RabbitMQ, Redis, pgAdmin
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Acceso a Servicios

- **RabbitMQ Management**: http://localhost:15672 (usuario: `riego_rabbit`, password: `rabbit_password_2024`)
- **pgAdmin**: http://localhost:5050 (email: `admin@riego-smart.com`, password: `admin_password_2024`)

---

## 📝 LICENCIA

MIT

---

## 👥 AUTOR

RIEGO-SMART Team

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Levantar infraestructura (`docker-compose up -d`)
2. ✅ Instalar y ejecutar los 4 servicios backend
3. ✅ Probar endpoints con los ejemplos de arriba
4. ✅ Ver datos generados y alertas en acción
5. 📈 (Opcional) Desarrollar frontend React
6. 🚀 (Opcional) Deploy en producción

---

**¡Disfruta de RIEGO-SMART!** 🌱💧
