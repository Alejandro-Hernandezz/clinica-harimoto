# 🌱 RIEGO-SMART - Sistema SOA con Microservicios

Sistema completo de gestión inteligente de riego agrícola con arquitectura SOA y microservicios. **Sin dependencias externas** - todo funciona localmente.

## 🎯 CARACTERÍSTICAS

✅ **Arquitectura SOA** - Service Oriented Architecture
✅ **4 Microservicios** independientes con bases de datos separadas
✅ **Comunicación HTTP/REST** - Sin Message Broker
✅ **SQLite local** - Sin MySQL, PostgreSQL ni Docker
✅ **Frontend Web** incluido
✅ **Simulador de sensores** - No requiere hardware Arduino
✅ **Sistema de alertas** automático
✅ **Notificaciones** SMS/Email simuladas

---

## 📦 REQUISITOS

- **Node.js** versión 16 o superior
- Navegador web moderno (Chrome, Firefox, Edge)

---

## 🚀 INSTALACIÓN Y USO

### PASO 1: Instalar Dependencias

Abre una terminal CMD en la carpeta del proyecto y ejecuta:

```cmd
cd backend\services\auth-service
npm install
cd ..\..\..

cd backend\services\sensor-service
npm install
cd ..\..\..

cd backend\services\analysis-service
npm install
cd ..\..\..

cd backend\services\notification-service
npm install
cd ..\..\..
```

> **Nota:** Esto solo se hace UNA VEZ. Las dependencias se instalan y quedan listas.

---

### PASO 2: Iniciar los Servicios

Abre **4 terminales CMD** diferentes (una para cada servicio):

**Terminal 1 - Auth Service:**
```cmd
cd backend\services\auth-service
node src\app-simple.js
```

**Terminal 2 - Sensor Service:**
```cmd
cd backend\services\sensor-service
node src\app-simple.js
```

**Terminal 3 - Analysis Service:**
```cmd
cd backend\services\analysis-service
node src\app-simple.js
```

**Terminal 4 - Notification Service:**
```cmd
cd backend\services\notification-service
node src\app-simple.js
```

✅ **Cada terminal debe mostrar:**
```
Iniciando [Nombre] Service...
Base de datos SQLite lista
[Nombre] Service escuchando en puerto XXXX
Base de datos: database.sqlite
```

> **Importante:** NO cierres estas terminales. Deben permanecer abiertas mientras uses el sistema.

---

### PASO 3: Abrir el Frontend

1. Navega a la carpeta `frontend`
2. Haz doble clic en `index.html`
3. Se abrirá en tu navegador por defecto

**O** abre manualmente:
```
frontend/index.html
```

---

## 🎮 CÓMO USAR EL SISTEMA

### 1️⃣ Registro e Inicio de Sesión

1. En el frontend, haz clic en **"Registrarse"**
2. Ingresa:
   - Email: `tu@email.com`
   - Password: `tu_password`
   - Nombre: `Tu Nombre`
3. Haz clic en **"Registrarse"**
4. Ahora inicia sesión con el mismo email y password

### 2️⃣ Crear un Sensor

1. Completa el formulario:
   - **Nombre:** `Sensor Parcela A`
   - **Tipo:** `Humedad`
   - **Ubicación:** `Parcela Norte`
   - **Umbral Mínimo:** `30` (genera alerta si la humedad es menor)
   - **Umbral Máximo:** `70` (genera alerta si la humedad es mayor)
2. Haz clic en **"Crear Sensor"**

### 3️⃣ Simular Datos

1. En tu sensor creado, haz clic en **"Simular Lectura"**
2. El sistema generará un dato automáticamente
3. **Si la humedad está fuera de los umbrales (muy baja o muy alta):**
   - ✅ Se crea una **ALERTA** automáticamente
   - ✅ Se envían **NOTIFICACIONES** (SMS y Email simuladas)

### 4️⃣ Ver Alertas y Notificaciones

1. Haz clic en la pestaña **"Alertas"**
2. Verás las alertas generadas con:
   - Tipo de alerta (RIEGO_NECESARIO, EXCESO_HUMEDAD)
   - Severidad (ALTA, MEDIA)
   - Mensaje descriptivo
   - Recomendaciones
3. Haz clic en la pestaña **"Notificaciones"**
4. Verás las notificaciones SMS/Email enviadas

### 5️⃣ Generar Más Alertas

El sistema genera alertas cuando:
- **Humedad < 30%** → Alerta RIEGO_NECESARIO (Severidad ALTA)
- **Humedad > 70%** → Alerta EXCESO_HUMEDAD (Severidad MEDIA)

Sigue simulando lecturas hasta que aparezcan alertas.

---

## 🏗️ ARQUITECTURA

### Microservicios

| Servicio | Puerto | Función | Base de Datos |
|----------|--------|---------|---------------|
| **Auth Service** | 3000 | Autenticación JWT, registro/login | `auth-service/database.sqlite` |
| **Sensor Service** | 3001 | Gestión de sensores, simulador de datos | `sensor-service/database.sqlite` |
| **Analysis Service** | 3002 | Análisis de datos, generación de alertas | `analysis-service/database.sqlite` |
| **Notification Service** | 3003 | Envío de notificaciones (simuladas) | `notification-service/database.sqlite` |

### Comunicación HTTP/REST

```
Frontend → Auth Service (Login/Register)
        ↓
Frontend → Sensor Service (Crear sensores, simular datos)
        ↓
Sensor Service → Analysis Service (Enviar dato para análisis)
        ↓
Analysis Service → Notification Service (Enviar alerta para notificar)
```

### Base de Datos

- **SQLite** - Cada servicio tiene su propia base de datos local
- **Autocontenido** - Las BDs se crean automáticamente al iniciar
- **Sin configuración** - No requiere instalación de MySQL/PostgreSQL

---

## 🛠️ TECNOLOGÍAS

### Backend
- Node.js + Express
- Sequelize ORM
- SQLite3
- JWT para autenticación
- Bcrypt para passwords
- Axios para comunicación entre servicios

### Frontend
- HTML5 + CSS3 + JavaScript vanilla
- Diseño responsivo
- Almacenamiento local (LocalStorage)

---

## 📂 ESTRUCTURA DEL PROYECTO

```
riego-smart/
│
├── frontend/
│   ├── index.html          # Interfaz web
│   └── app.js              # Lógica del frontend
│
├── backend/
│   └── services/
│       ├── auth-service/
│       │   ├── src/
│       │   │   └── app-simple.js
│       │   ├── package.json
│       │   └── database.sqlite (se crea automáticamente)
│       │
│       ├── sensor-service/
│       │   ├── src/
│       │   │   └── app-simple.js
│       │   ├── package.json
│       │   └── database.sqlite (se crea automáticamente)
│       │
│       ├── analysis-service/
│       │   ├── src/
│       │   │   └── app-simple.js
│       │   ├── package.json
│       │   └── database.sqlite (se crea automáticamente)
│       │
│       └── notification-service/
│           ├── src/
│           │   └── app-simple.js
│           ├── package.json
│           └── database.sqlite (se crea automáticamente)
│
└── README.md
```

---

## ❓ SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find module"
**Solución:** Ejecuta `npm install` en la carpeta del servicio que da error.

### Error: "EADDRINUSE" (puerto ocupado)
**Solución:** Otro proceso está usando el puerto. Cierra otras aplicaciones o reinicia tu PC.

### No se generan alertas
**Solución:** Los umbrales del sensor deben ser 30-70. Simula varias lecturas hasta que salga un valor fuera del rango.

### Frontend no se conecta
**Solución:** Verifica que los 4 servicios estén corriendo en sus 4 terminales.

---

## 🎓 CONCEPTOS IMPLEMENTADOS

✅ **SOA (Service Oriented Architecture)**
✅ **Microservicios** con responsabilidades únicas
✅ **APIs REST** para comunicación
✅ **Base de datos por servicio** (Database per Service pattern)
✅ **Autenticación JWT**
✅ **Simulación de hardware** (sensores sin Arduino)
✅ **Sistema de análisis y alertas**
✅ **Arquitectura event-driven** (a través de HTTP)

---

## 📝 NOTAS

- Las bases de datos se crean automáticamente la primera vez que inicias cada servicio
- Los datos persisten entre reinicios (almacenados en archivos `.sqlite`)
- El simulador genera valores realistas con variaciones naturales
- Las notificaciones son simuladas (no envía SMS/emails reales)
- Todo funciona sin internet - 100% local

---

## 🚀 PARA DESARROLLADORES

### API Endpoints

**Auth Service (3000):**
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Ver perfil (requiere token)

**Sensor Service (3001):**
- `GET /api/sensores` - Listar sensores
- `POST /api/sensores` - Crear sensor
- `POST /api/sensores/:id/simular` - Simular lectura
- `GET /api/sensores/:id/datos` - Ver datos históricos

**Analysis Service (3002):**
- `POST /api/analizar` - Analizar dato (uso interno)
- `GET /api/alertas` - Listar alertas
- `PUT /api/alertas/:id/leer` - Marcar alerta como leída

**Notification Service (3003):**
- `POST /api/notificar` - Enviar notificación (uso interno)
- `GET /api/notificaciones` - Listar notificaciones

---

¡Listo! Ahora tienes un sistema completo de gestión de riego funcionando. 🌱💧
