# 🔧 SOLUCIÓN: Error de autenticación PostgreSQL

## ❌ Error que ves:
```
Error: la autentificación password falló para el usuario "riego_admin"
```

## 🎯 Causa
El script original `init-db.sql` tenía un error que impedía crear las bases de datos correctamente.

## ✅ SOLUCIÓN RÁPIDA

### Windows:
```cmd
fix-database.bat
```

### Linux/Mac:
```bash
chmod +x fix-database.sh
./fix-database.sh
```

Este script:
1. Detiene PostgreSQL
2. Elimina el contenedor y datos antiguos
3. Recrea PostgreSQL con el script corregido
4. Crea las 4 bases de datos correctamente

---

## 🔍 SOLUCIÓN MANUAL (si el script no funciona)

### Paso 1: Limpiar PostgreSQL
```bash
docker-compose stop postgres
docker-compose rm -f postgres
docker volume rm clinica-harimoto_postgres_data
```

### Paso 2: Reemplazar script de inicialización
```bash
# Windows
copy /Y init-db-fixed.sql init-db.sql

# Linux/Mac
cp init-db-fixed.sql init-db.sql
```

### Paso 3: Iniciar PostgreSQL
```bash
docker-compose up -d postgres
```

### Paso 4: Esperar 15 segundos
```bash
# Windows
timeout /t 15

# Linux/Mac
sleep 15
```

### Paso 5: Verificar
```bash
docker-compose exec postgres psql -U riego_admin -d postgres -c "\l"
```

Deberías ver:
- `auth_service`
- `sensor_service`
- `analysis_service`
- `notification_service`

---

## 🧪 VERIFICAR QUE FUNCIONA

### Opción 1: Conectarse a PostgreSQL
```bash
docker-compose exec postgres psql -U riego_admin -d auth_service
```

Si ves `auth_service=#`, ¡funciona! Escribe `\q` para salir.

### Opción 2: Probar un servicio
```bash
cd backend/services/auth-service
npm start
```

Si ves:
```
✅ Conectado a BD
✅ BD sincronizada
✅ Auth Service escuchando en puerto 3000
```

¡Problema resuelto!

---

## 📋 SIGUIENTE PASO

Una vez que PostgreSQL esté funcionando correctamente:

```bash
# Windows
start-all.bat

# Linux/Mac
./start-all.sh
```

Esto iniciará los 4 servicios automáticamente.

---

## 🆘 SI SIGUE SIN FUNCIONAR

### Verificar que Docker está corriendo
```bash
docker ps
```

### Verificar logs de PostgreSQL
```bash
docker-compose logs postgres
```

### Verificar puerto 5432 no esté ocupado
**Windows:**
```cmd
netstat -ano | findstr :5432
```

**Linux/Mac:**
```bash
lsof -ti:5432
```

Si el puerto está ocupado, detén el proceso o cambia el puerto en `docker-compose.yml`.

---

## 💡 ¿QUÉ SE CORRIGIÓ?

**Antes (init-db.sql - incorrecto):**
```sql
CREATE DATABASE auth_service;
-- ...
\c riego_smart;  -- ❌ Esta DB no existe!
CREATE USER riego_app WITH PASSWORD '...';  -- ❌ Usuario incorrecto
```

**Ahora (init-db-fixed.sql - correcto):**
```sql
CREATE DATABASE auth_service;
CREATE DATABASE sensor_service;
CREATE DATABASE analysis_service;
CREATE DATABASE notification_service;

GRANT ALL PRIVILEGES ON DATABASE auth_service TO riego_admin;
-- ... permisos para todas las BDs
```

El usuario `riego_admin` ya es creado automáticamente por Docker, solo necesitamos crear las bases de datos y otorgar permisos.
