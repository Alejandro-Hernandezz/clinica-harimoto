# RIEGO-SMART

## CONFIGURACION (SOLO UNA VEZ)

### 1. Edita el archivo `config.js` con tus credenciales:

Abre `config.js` y cambia estas lineas si es necesario:
```javascript
user: 'postgres',           // Tu usuario de PostgreSQL
password: 'Adezito666',     // Tu password de PostgreSQL
```

### 2. Crea las 4 bases de datos

Abre CMD y ejecuta:
```cmd
docker-compose exec postgres createdb -U TU_USUARIO auth_service
docker-compose exec postgres createdb -U TU_USUARIO sensor_service
docker-compose exec postgres createdb -U TU_USUARIO analysis_service
docker-compose exec postgres createdb -U TU_USUARIO notification_service
```

Reemplaza TU_USUARIO con tu usuario real de PostgreSQL.

### 3. Instala dependencias

En la raiz del proyecto:
```cmd
cd backend\services\auth-service && npm install && cd ..\..\..
cd backend\services\sensor-service && npm install && cd ..\..\..
cd backend\services\analysis-service && npm install && cd ..\..\..
cd backend\services\notification-service && npm install && cd ..\..\..
```

## INICIAR EL SISTEMA

Abre 4 terminales CMD y ejecuta en cada una:

Terminal 1:
```cmd
cd backend\services\auth-service
node src\app-simple.js
```

Terminal 2:
```cmd
cd backend\services\sensor-service
node src\app-simple.js
```

Terminal 3:
```cmd
cd backend\services\analysis-service
node src\app-simple.js
```

Terminal 4:
```cmd
cd backend\services\notification-service
node src\app-simple.js
```

## VERIFICAR

En cada terminal debes ver:
```
Conectado a BD
BD sincronizada
escuchando en puerto XXXX
```

## SI TIENES ERROR

El error mas comun es credenciales incorrectas.

1. Abre `config.js`
2. Cambia `user` y `password` con tus credenciales reales
3. Reinicia los servicios

Los servicios ahora muestran mensajes de error mas claros indicando que edites config.js
