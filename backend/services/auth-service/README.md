# Auth Service - RIEGO-SMART

Servicio de autenticación y gestión de usuarios para el sistema RIEGO-SMART.

## 🎯 Propósito

Gestionar la autenticación, autorización y perfiles de usuarios del sistema.

## 🏗️ Arquitectura

- **Patrón**: Microservicio
- **Puerto**: 3000
- **Base de datos**: PostgreSQL (auth_service)
- **Autenticación**: JWT (JSON Web Tokens)

## 📋 Funcionalidades

### Autenticación
- ✅ Registro de usuarios
- ✅ Inicio de sesión
- ✅ Cierre de sesión
- ✅ Refresh de tokens JWT

### Gestión de Usuarios
- ✅ Obtener perfil
- ✅ Actualizar perfil
- ✅ Cambiar contraseña
- ✅ Actualizar preferencias de notificación
- ✅ Activar/desactivar usuarios

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev

# Iniciar en producción
npm start
```

## 📡 API Endpoints

### Públicos (sin autenticación)

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
```

### Protegidos (requieren token JWT)

```
POST /api/auth/logout
GET  /api/auth/profile
PUT  /api/auth/profile
PUT  /api/auth/change-password
PUT  /api/auth/preferences
GET  /api/usuarios
GET  /api/usuarios/:id
```

## 📦 Modelo de Datos

### User

```javascript
{
  id: UUID,
  email: string (unique),
  password: string (hashed),
  nombre: string,
  telefonoPropiedad: string,
  emailPropiedad: string,
  preferenciasNotificacion: {
    sms: boolean,
    email: boolean,
    push: boolean
  },
  activo: boolean,
  fechaRegistro: Date,
  ultimoAcceso: Date
}
```

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Tokens JWT con expiración configurable
- Rate limiting para prevenir ataques de fuerza bruta
- Helmet para headers de seguridad HTTP
- CORS configurado

## 🧪 Ejemplo de Uso

### Registro

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123",
    "nombre": "Juan Pérez",
    "telefonoPropiedad": "8123456789",
    "emailPropiedad": "juan@propiedad.com"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }'
```

### Obtener Perfil

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

## 📝 Variables de Entorno

Ver archivo `.env.example` para todas las variables configurables.
