# 🏗️ ARQUITECTURA SIMPLIFICADA - RIEGO-SMART

## 📌 RESUMEN DE CAMBIOS

Esta versión simplificada elimina dependencias complejas y usa comunicación HTTP/REST directa entre servicios, manteniendo toda la funcionalidad del sistema.

---

## ✅ QUÉ SE ELIMINÓ

### ❌ RabbitMQ (Message Broker)
- **Antes:** Los servicios se comunicaban mediante colas de mensajes
- **Ahora:** Comunicación directa HTTP/REST usando `axios`

### ❌ Código Compartido (`backend/shared/`)
- **Antes:** Middleware, utilidades y clientes compartidos causaban problemas de dependencias
- **Ahora:** Cada servicio es **totalmente autocontenido** (self-contained)

### ❌ Dependencias Innecesarias
- **Eliminado:** `amqplib` (RabbitMQ client)
- **Simplificado:** Cada servicio tiene solo las dependencias que realmente usa

---

## 🔄 NUEVA ARQUITECTURA

### Flujo de Comunicación

```
┌─────────────────┐
│   Auth Service  │ (Puerto 3000)
│   PostgreSQL    │ - Registro/Login
└─────────────────┘ - Generación de JWT tokens
                    - Validación de usuarios
        │
        │ (Token JWT)
        ▼
┌─────────────────┐     HTTP POST        ┌──────────────────┐
│ Sensor Service  │ ──────────────────▶ │ Analysis Service │
│   PostgreSQL    │  /api/analizar      │   PostgreSQL     │
└─────────────────┘                      └──────────────────┘
- Gestión sensores                        - Análisis de datos
- Almacena lecturas                       - Reglas de alertas
- Simulador integrado                     - Crear alertas
                                                   │
                                                   │ HTTP POST
                                                   │ /api/notificar
                                                   ▼
                                          ┌────────────────────────┐
                                          │ Notification Service   │
                                          │     PostgreSQL         │
                                          └────────────────────────┘
                                          - Simulador SMS/Email
                                          - Historial notificaciones
```

### Servicios Autocontenidos

Cada servicio (`app-simple.js`) incluye:

1. **Conexión a Base de Datos** - Sequelize inline
2. **Modelos** - Definidos en el mismo archivo
3. **Middleware de Autenticación** - JWT inline (no compartido)
4. **Rutas y Controladores** - Express routes
5. **Lógica de Negocio** - Funciones específicas del servicio

---

## 📦 DEPENDENCIAS POR SERVICIO

### Auth Service
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "sequelize": "^6.35.1",
  "pg": "^8.11.3",
  "pg-hstore": "^2.3.4"
}
```

### Sensor Service
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "sequelize": "^6.35.1",
  "pg": "^8.11.3",
  "pg-hstore": "^2.3.4",
  "jsonwebtoken": "^9.0.2",
  "axios": "^1.6.0"  // Para notificar a Analysis Service
}
```

### Analysis Service
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "sequelize": "^6.35.1",
  "pg": "^8.11.3",
  "pg-hstore": "^2.3.4",
  "jsonwebtoken": "^9.0.2",
  "axios": "^1.6.0"  // Para notificar a Notification Service
}
```

### Notification Service
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "pg": "^8.11.3",
  "pg-hstore": "^2.3.4",
  "sequelize": "^6.35.1",
  "jsonwebtoken": "^9.0.2"
}
```

---

## 🔗 ENDPOINTS DE COMUNICACIÓN

### Sensor Service → Analysis Service

```javascript
// Cuando se guarda un dato de sensor
await axios.post('http://localhost:3002/api/analizar', {
  sensorId,
  usuarioId,
  valor,
  umbralMinimo,
  umbralMaximo,
  tipo,
  ubicacion
});
```

### Analysis Service → Notification Service

```javascript
// Cuando se genera una alerta
await axios.post('http://localhost:3003/api/notificar', {
  usuarioId,
  alerta: {
    id,
    tipo,
    severidad,
    mensaje
  }
});
```

---

## 🎯 VENTAJAS DE LA SIMPLIFICACIÓN

### ✅ Instalación Más Fácil
- Solo requiere PostgreSQL (no RabbitMQ ni Redis)
- `npm install` más rápido (menos dependencias)
- Menos servicios Docker que gestionar

### ✅ Menos Errores de Dependencias
- No más errores "Cannot find module 'amqplib'"
- Cada servicio es independiente
- No hay conflictos de módulos compartidos

### ✅ Código Más Fácil de Entender
- Un solo archivo por servicio (`app-simple.js`)
- Toda la lógica visible en un lugar
- No hay imports de código compartido que buscar

### ✅ Deployment Más Simple
- Cada servicio se puede desplegar independientemente
- No hay dependencias entre repositorios
- Fácil de dockerizar individualmente

---

## 🚀 CÓMO EJECUTAR

### Opción 1: Script Automático

**Windows:**
```cmd
install-dependencies.bat
start-all.bat
```

**Linux/Mac:**
```bash
chmod +x install-dependencies.sh start-all.sh
./install-dependencies.sh
./start-all.sh
```

### Opción 2: Manual

**1. Iniciar PostgreSQL:**
```bash
docker-compose up -d postgres
```

**2. Instalar dependencias (una vez):**
```bash
cd backend/services/auth-service && npm install
cd backend/services/sensor-service && npm install
cd backend/services/analysis-service && npm install
cd backend/services/notification-service && npm install
```

**3. Ejecutar servicios (4 terminales):**
```bash
# Terminal 1
cd backend/services/auth-service && npm start

# Terminal 2
cd backend/services/sensor-service && npm start

# Terminal 3
cd backend/services/analysis-service && npm start

# Terminal 4
cd backend/services/notification-service && npm start
```

---

## 📊 COMPARACIÓN: ANTES vs AHORA

| Aspecto | Versión Original | Versión Simplificada |
|---------|------------------|---------------------|
| **Comunicación** | RabbitMQ (async) | HTTP/REST (sync) |
| **Código Compartido** | `backend/shared/` | Ninguno (inline) |
| **Dependencias** | 9+ por servicio | 7-8 por servicio |
| **Docker Services** | PostgreSQL + RabbitMQ + Redis | Solo PostgreSQL |
| **Archivos por Servicio** | Múltiples (routes, controllers, etc.) | Un solo `app-simple.js` |
| **Complejidad** | Alta | Baja |
| **Tiempo de Instalación** | ~5 minutos | ~2 minutos |

---

## 🔧 MANTENIMIENTO Y EXTENSIÓN

### Agregar Nuevo Endpoint

Simplemente edita el archivo `app-simple.js` del servicio:

```javascript
app.get('/api/nueva-ruta', authenticate, async (req, res) => {
  try {
    // Tu lógica aquí
    res.json({ success: true, data: resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Comunicar con Otro Servicio

Usa `axios`:

```javascript
const axios = require('axios');

async function notificarOtroServicio(datos) {
  try {
    await axios.post('http://localhost:PUERTO/api/endpoint', datos);
  } catch (error) {
    console.log('⚠️ Servicio no disponible');
  }
}
```

---

## 🎓 CONCEPTOS TÉCNICOS IMPLEMENTADOS

Aunque simplificado, el sistema sigue demostrando:

- ✅ **Microservicios:** Servicios independientes con BD separadas
- ✅ **SOA:** Arquitectura orientada a servicios con APIs REST
- ✅ **Autenticación JWT:** Tokens seguros para auth
- ✅ **Separación de Responsabilidades:** Cada servicio tiene un propósito único
- ✅ **Comunicación Inter-Servicios:** HTTP/REST entre microservicios
- ✅ **Persistencia de Datos:** PostgreSQL con Sequelize ORM
- ✅ **Simulación de Hardware:** Sensores sin Arduino físico
- ✅ **Análisis de Datos:** Reglas de negocio para alertas
- ✅ **Sistema de Notificaciones:** Simulación de SMS/Email

---

## 📚 SIGUIENTE PASO

Consulta `INSTALACION.md` para instrucciones detalladas de instalación y pruebas del sistema.
