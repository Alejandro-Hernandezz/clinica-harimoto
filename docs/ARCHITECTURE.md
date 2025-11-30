# 🏗️ ARQUITECTURA RIEGO-SMART

## ÍNDICE

1. [Visión General](#visión-general)
2. [Patrones Arquitectónicos](#patrones-arquitectónicos)
3. [Microservicios](#microservicios)
4. [Message Broker](#message-broker)
5. [Base de Datos](#base-de-datos)
6. [Seguridad](#seguridad)
7. [Escalabilidad](#escalabilidad)

---

## VISIÓN GENERAL

RIEGO-SMART implementa una arquitectura distribuida basada en microservicios que se comunican de manera síncrona (REST API) y asíncrona (Message Broker).

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                │
│                     (React - Puerto 5173)                        │
└────────┬────────────────────────────────────────────────────────┘
         │ HTTP REST
         ├──────────┬──────────┬──────────┬──────────┐
         │          │          │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐ ┌──▼─────┐
    │  Auth  │ │ Sensor │ │Analysis│ │Notific.│ │RabbitMQ│
    │  :3000 │ │  :3001 │ │  :3002 │ │  :3003 │ │ :5672  │
    └────┬───┘ └───┬────┘ └───┬────┘ └───┬────┘ └────────┘
         │        │          │          │
    ┌────▼───┐ ┌─▼──────┐ ┌─▼──────┐ ┌─▼──────┐
    │  auth  │ │ sensor │ │analysis│ │notific.│
    │   DB   │ │   DB   │ │   DB   │ │   DB   │
    └────────┘ └────────┘ └────────┘ └────────┘
         PostgreSQL (4 bases de datos independientes)
```

---

## PATRONES ARQUITECTÓNICOS

### 1. SOA (Service-Oriented Architecture)

Cada servicio expone una **API REST** bien definida que otros servicios o clientes pueden consumir.

**Características:**
- ✅ Contratos claros (API endpoints documentados)
- ✅ Interoperabilidad (HTTP/JSON)
- ✅ Reutilización de servicios
- ✅ Independencia tecnológica

**Ejemplo:**
```javascript
// Auth Service expone:
POST /api/auth/login → { token }

// Sensor Service consume auth para validar:
GET /api/sensores
Headers: Authorization: Bearer <token>
```

### 2. Microservicios

Cada servicio es **independiente** y **desplegable por separado**.

| Principio | Implementación |
|-----------|----------------|
| **Responsabilidad Única** | Cada servicio tiene un dominio específico |
| **Base de Datos por Servicio** | 4 BD PostgreSQL independientes |
| **Comunicación Ligera** | HTTP REST + Message Broker |
| **Autonomía** | Cada servicio puede desplegarse/escalarse independientemente |

**Ventajas:**
- 🚀 Escalabilidad horizontal (escalar solo lo necesario)
- 🔄 Deployment independiente (cambiar un servicio sin afectar otros)
- 🛡️ Aislamiento de fallos (si uno falla, los demás continúan)
- 🧪 Facilidad de testing (probar servicios aisladamente)

### 3. Event-Driven Architecture (Message Broker)

Comunicación **asíncrona** mediante **RabbitMQ**.

**Flujo de Eventos:**

```
Sensor Service
      │ publish
      ▼
   [sensor.data.received]
      │ consume
      ▼
Analysis Service
      │ publish
      ▼
   [alert.generated]
      │ consume
      ▼
Notification Service
      │ publish
      ▼
   [notification.sent]
```

**Ventajas:**
- 🔓 **Desacoplamiento**: Los servicios no se conocen entre sí
- ⚡ **Asincronía**: No bloquean esperando respuesta
- 🔄 **Resiliencia**: Mensajes persisten si un servicio está caído
- 📈 **Escalabilidad**: Múltiples consumers para una cola

---

## MICROSERVICIOS

### Auth Service (Puerto 3000)

**Responsabilidad:** Autenticación y gestión de usuarios

**Tecnologías:**
- Express.js
- Sequelize (ORM)
- bcrypt (hashing)
- JWT (tokens)

**Modelo de Datos:**
```javascript
User {
  id: UUID,
  email: string (unique),
  password: string (hashed),
  nombre: string,
  preferenciasNotificacion: {
    sms: boolean,
    email: boolean
  },
  activo: boolean
}
```

**API Endpoints:**
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión (retorna JWT)
- `GET /api/auth/profile` - Obtener perfil (requiere JWT)

---

### Sensor Service (Puerto 3001)

**Responsabilidad:** Gestión de sensores, datos y **simulador**

**Tecnologías:**
- Express.js
- Sequelize (ORM)
- RabbitMQ (publicar datos)
- **SimulatorService** (generación de datos)

**Modelos de Datos:**
```javascript
Sensor {
  id: UUID,
  usuarioId: UUID,
  nombre: string,
  tipo: enum (HUMEDAD, TEMPERATURA),
  ubicacion: string,
  umbralMinimo: float,
  umbralMaximo: float,
  estado: enum (ACTIVO, INACTIVO, ERROR)
}

SensorData {
  id: UUID,
  sensorId: UUID,
  valor: float,
  unidad: string,
  temperatura: float,
  timestamp: date,
  estado: enum (NORMAL, ALERTA, CRITICO)
}
```

**Simulador de Sensores:**

El `SimulatorService` es la **pieza clave** que permite funcionar sin Arduino:

```javascript
// Genera humedad realista con variación gradual
generarHumedad(ultimoValor) {
  const variacion = (Math.random() - 0.5) * 10; // ±5%
  return clamp(ultimoValor + variacion, 20, 80);
}

// Genera temperatura con ciclo día/noche
generarTemperatura() {
  const hora = new Date().getHours();
  const ciclo = Math.sin((hora - 2) * Math.PI / 24);
  return 25 + (ciclo * 10); // 15°C - 35°C
}
```

**Modos:**
1. **Bulk**: Genera múltiples datos históricos
2. **Stream**: Genera datos en tiempo real
3. **Eventos**: Sequía, lluvia, temperatura crítica

**Publicación a RabbitMQ:**
```javascript
// Cada dato generado se publica
rabbitClient.publish('sensor.data.received', {
  sensorId,
  usuarioId,
  tipo: 'HUMEDAD',
  valor: 28.5,
  timestamp: new Date()
});
```

---

### Analysis Service (Puerto 3002)

**Responsabilidad:** Análisis de datos y generación de alertas

**Tecnologías:**
- Express.js
- Sequelize (ORM)
- RabbitMQ (consumer de datos + publisher de alertas)

**Modelo de Datos:**
```javascript
Alert {
  id: UUID,
  usuarioId: UUID,
  sensorId: UUID,
  tipo: enum (RIEGO_NECESARIO, TEMPERATURA_CRITICA, ...),
  severidad: enum (BAJA, MEDIA, ALTA, CRITICA),
  mensaje: text,
  recomendacion: text,
  leida: boolean,
  resuelta: boolean,
  fechaGeneracion: date
}
```

**Reglas de Alertas:**

Configurables en `config/alertRules.js`:

```javascript
ALERT_RULES = {
  RIEGO_NECESARIO: {
    condicion: (valor, tipo) => tipo === 'HUMEDAD' && valor < 30,
    severidad: 'ALTA',
    mensaje: (valor, ubicacion) => `Humedad baja: ${valor}%`,
    recomendacion: 'Activar sistema de riego'
  }
}
```

**Consumer de RabbitMQ:**
```javascript
// Escucha datos de sensores
rabbitClient.consume('sensor.data.received', async (dato) => {
  // Aplicar reglas
  const alertas = await analizarDato(dato);

  // Publicar alertas
  for (const alerta of alertas) {
    await rabbitClient.publish('alert.generated', alerta);
  }
});
```

---

### Notification Service (Puerto 3003)

**Responsabilidad:** Envío de notificaciones (SMS/Email simulados)

**Tecnologías:**
- Express.js
- Sequelize (ORM)
- RabbitMQ (consumer de alertas)

**Modelo de Datos:**
```javascript
Notification {
  id: UUID,
  usuarioId: UUID,
  alertaId: UUID,
  tipo: enum (SMS, EMAIL, PUSH),
  estado: enum (PENDIENTE, ENVIADA, FALLIDA),
  contenido: text,
  intentos: integer
}
```

**Consumer de RabbitMQ:**
```javascript
// Escucha alertas generadas
rabbitClient.consume('alert.generated', async (alerta) => {
  // Obtener preferencias usuario
  const preferencias = await getUserPreferences(alerta.usuarioId);

  // Enviar según preferencias
  if (preferencias.sms) {
    await enviarSMS(alerta); // Simulado
  }

  if (preferencias.email) {
    await enviarEmail(alerta); // Simulado
  }

  // Publicar confirmación
  await rabbitClient.publish('notification.sent', {
    notificacionId: notification.id,
    estado: 'ENVIADA'
  });
});
```

---

## MESSAGE BROKER

### Colas de RabbitMQ

| Cola | Productor | Consumidor | Payload |
|------|-----------|------------|---------|
| `sensor.data.received` | Sensor Service | Analysis Service | Datos de sensor |
| `alert.generated` | Analysis Service | Notification Service | Alerta generada |
| `notification.sent` | Notification Service | Frontend (WebSocket) | Confirmación |

### Configuración de Colas

En `shared/messagebroker/queueConfig.js`:

```javascript
QUEUE_CONFIG = {
  'sensor.data.received': {
    exchange: { name: 'riego-smart.sensor', type: 'topic' },
    routingKey: 'sensor.data.*',
    ttl: 3600000, // 1 hora
    deadLetterExchange: 'riego-smart.dlx'
  }
}
```

**Características:**
- ✅ **Durable**: Mensajes persisten en disco
- ✅ **ACK Manual**: Consumer confirma procesamiento
- ✅ **Reintentos**: Máximo 3 intentos con backoff
- ✅ **Dead Letter Queue**: Mensajes fallidos van a DLQ

---

## BASE DE DATOS

### Estrategia: Database per Service

Cada microservicio tiene su **propia base de datos** independiente.

```
PostgreSQL Server
├── auth_service        (User)
├── sensor_service      (Sensor, SensorData)
├── analysis_service    (Alert)
└── notification_service (Notification)
```

**Ventajas:**
- 🔓 **Desacoplamiento**: Cambios en una BD no afectan otros servicios
- 🚀 **Escalabilidad**: Escalar BDs independientemente
- 🛡️ **Aislamiento**: Fallos en una BD no afectan otras

**Desventajas:**
- ❌ Transacciones distribuidas complejas (solucionado con eventos)
- ❌ Joins entre servicios no posibles (se obtienen datos por API)

---

## SEGURIDAD

### 1. Autenticación JWT

```javascript
// Login
POST /api/auth/login
Response: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

// Usar token en peticiones
GET /api/sensores
Headers: Authorization: Bearer <token>
```

**Configuración:**
- Secret: Variable de entorno `JWT_SECRET`
- Expiración: 24 horas (configurable)
- Algoritmo: HS256

### 2. Password Hashing

```javascript
// bcrypt con 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);
```

### 3. Middleware de Autenticación

```javascript
// shared/middleware/authMiddleware.js
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = decoded;
  next();
};
```

### 4. CORS

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

### 5. Helmet

```javascript
app.use(helmet()); // Headers de seguridad HTTP
```

---

## ESCALABILIDAD

### Escalabilidad Horizontal

Cada servicio puede replicarse independientemente:

```
Load Balancer
      │
      ├─────┬─────┬─────┐
      │     │     │     │
   Sensor Sensor Sensor Sensor
   :3001  :3001  :3001  :3001
   (4 instancias)
```

### Escalabilidad con RabbitMQ

Múltiples consumers para una misma cola:

```
[sensor.data.received]
      │
      ├──────────┬──────────┐
      │          │          │
  Analysis   Analysis   Analysis
  :3002      :3002      :3002
  (3 consumers procesando en paralelo)
```

### Cache con Redis

```javascript
// Opcional: Cache de datos frecuentes
const cachedSensors = await redis.get(`user:${userId}:sensors`);

if (!cachedSensors) {
  const sensors = await Sensor.findAll({ where: { usuarioId } });
  await redis.setex(`user:${userId}:sensors`, 300, JSON.stringify(sensors));
}
```

---

## CONCLUSIÓN

La arquitectura de RIEGO-SMART implementa **patrones modernos** que garantizan:

✅ **Escalabilidad** - Crecer según demanda
✅ **Resiliencia** - Resistir fallos
✅ **Mantenibilidad** - Fácil de modificar y extender
✅ **Testabilidad** - Servicios aislados para testing
✅ **Flexibilidad** - Agregar nuevos servicios sin afectar existentes

---

**Siguiente:** [Ver ejemplos de API](API.md)
