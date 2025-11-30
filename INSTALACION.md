# 🚀 GUÍA DE INSTALACIÓN - RIEGO-SMART

## PROBLEMA COMÚN: Módulos no encontrados

Si al ejecutar los servicios ves errores como:
```
Error: Cannot find module 'amqplib'
Error: Cannot find module 'jsonwebtoken'
```

**Solución:** Necesitas instalar las dependencias de cada servicio.

---

## 📋 INSTALACIÓN RÁPIDA

### Opción 1: Script Automático (Recomendado)

#### Windows:
```cmd
install-dependencies.bat
```

#### Linux/Mac:
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### Opción 2: Manual

Ejecuta en cada servicio:

```bash
# Auth Service
cd backend/services/auth-service
npm install

# Sensor Service
cd ../sensor-service
npm install

# Analysis Service
cd ../analysis-service
npm install

# Notification Service
cd ../notification-service
npm install
```

---

## 🐳 PASOS COMPLETOS PARA EJECUTAR EL SISTEMA

### 1. Levantar Infraestructura (Docker)

```bash
docker-compose up -d
```

Espera ~30 segundos a que PostgreSQL y RabbitMQ estén listos.

**Verificar:**
```bash
docker-compose ps
```

Deberías ver:
- `riego-smart-postgres` - RUNNING
- `riego-smart-rabbitmq` - RUNNING
- `riego-smart-redis` - RUNNING

### 2. Instalar Dependencias

Usa el script automático o instala manualmente (ver arriba).

### 3. Ejecutar Servicios

Abre **4 terminales** y ejecuta en cada una:

**Terminal 1 - Auth Service:**
```bash
cd backend/services/auth-service
npm start
```

**Terminal 2 - Sensor Service:**
```bash
cd backend/services/sensor-service
npm start
```

**Terminal 3 - Analysis Service:**
```bash
cd backend/services/analysis-service
npm start
```

**Terminal 4 - Notification Service:**
```bash
cd backend/services/notification-service
npm start
```

### 4. Verificar que todo funciona

Deberías ver en cada terminal:
```
✅ [Servicio] escuchando en puerto [XXXX]
```

---

## 🧪 PROBAR EL SISTEMA

### Registrar Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@ejemplo.com\", \"password\": \"password123\", \"nombre\": \"Test User\"}"
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@ejemplo.com\", \"password\": \"password123\"}"
```

Guarda el `token` de la respuesta.

### Crear Sensor

```bash
curl -X POST http://localhost:3001/api/sensores \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"nombre\": \"Sensor 1\", \"tipo\": \"HUMEDAD\", \"ubicacion\": \"Parcela A\", \"umbralMinimo\": 30, \"umbralMaximo\": 70}"
```

### Generar Datos Simulados

```bash
curl -X POST http://localhost:3001/api/sensores/<SENSOR_ID>/simular/bulk \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"cantidad\": 288}"
```

Esto generará 288 datos (24 horas) y si alguno tiene humedad < 30%, se generarán alertas automáticamente.

### Ver Alertas

```bash
curl -X GET http://localhost:3002/api/alertas \
  -H "Authorization: Bearer <TU_TOKEN>"
```

### Ver Notificaciones

```bash
curl -X GET http://localhost:3003/api/notificaciones \
  -H "Authorization: Bearer <TU_TOKEN>"
```

---

## ❌ SOLUCIÓN DE PROBLEMAS

### Error: ECONNREFUSED al conectar a BD

**Problema:** PostgreSQL no está corriendo.

**Solución:**
```bash
docker-compose up -d postgres
docker-compose logs postgres
```

### Error: Cannot connect to RabbitMQ

**Problema:** RabbitMQ no está corriendo.

**Solución:**
```bash
docker-compose up -d rabbitmq
docker-compose logs rabbitmq
```

### Puerto ya en uso

**Problema:** Un servicio ya está corriendo en ese puerto.

**Solución Windows:**
```cmd
netstat -ano | findstr :<PUERTO>
taskkill /PID <PID> /F
```

**Solución Linux/Mac:**
```bash
lsof -ti:<PUERTO> | xargs kill -9
```

### No se pueden instalar dependencias

**Problema:** npm tiene problemas de permisos o caché.

**Solución:**
```bash
npm cache clean --force
npm install
```

---

## 📝 DEPENDENCIAS NECESARIAS

Cada servicio necesita:

| Dependencia | Versión | Uso |
|-------------|---------|-----|
| express | ^4.18.2 | Framework web |
| sequelize | ^6.35.1 | ORM para PostgreSQL |
| pg | ^8.11.3 | Driver PostgreSQL |
| pg-hstore | ^2.3.4 | Serialización JSONB |
| amqplib | ^0.10.3 | Cliente RabbitMQ |
| jsonwebtoken | ^9.0.2 | Autenticación JWT |
| bcrypt | ^5.1.1 | Hash de passwords |
| cors | ^2.8.5 | CORS |
| dotenv | ^16.3.1 | Variables de entorno |

---

## ✅ CHECKLIST DE INSTALACIÓN

- [ ] Node.js 18+ instalado
- [ ] Docker y Docker Compose instalados
- [ ] `docker-compose up -d` ejecutado
- [ ] Dependencias instaladas en los 4 servicios
- [ ] 4 terminales abiertas con los servicios corriendo
- [ ] Todos los servicios muestran "✅ escuchando en puerto..."
- [ ] RabbitMQ Management accesible en http://localhost:15672

---

¿Todo listo? ¡Empieza a usar RIEGO-SMART! 🌱💧
