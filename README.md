# RIEGO-SMART - Sistema con MySQL

## PASO 1: Edita config.js

Abre `config.js` y configura:
```javascript
user: 'root',        // Tu usuario MySQL (generalmente 'root')
password: '',        // Tu password MySQL (puede estar vacio)
```

## PASO 2: Inicia MySQL

Opcion A - Si tienes MySQL instalado localmente:
Ya esta listo, solo verifica que este corriendo.

Opcion B - Con Docker:
```cmd
docker-compose up -d mysql
```

## PASO 3: Crea las bases de datos

Abre MySQL y ejecuta:
```sql
CREATE DATABASE auth_service;
CREATE DATABASE sensor_service;
CREATE DATABASE analysis_service;
CREATE DATABASE notification_service;
```

O desde CMD:
```cmd
mysql -u root -p -e "CREATE DATABASE auth_service;"
mysql -u root -p -e "CREATE DATABASE sensor_service;"
mysql -u root -p -e "CREATE DATABASE analysis_service;"
mysql -u root -p -e "CREATE DATABASE notification_service;"
```

## PASO 4: Instala dependencias

```cmd
cd backend\services\auth-service && npm install && cd ..\..\..
cd backend\services\sensor-service && npm install && cd ..\..\..
cd backend\services\analysis-service && npm install && cd ..\..\..
cd backend\services\notification-service && npm install && cd ..\..\..
```

## PASO 5: Inicia los servicios

Abre 4 terminales CMD:

Terminal 1: `cd backend\services\auth-service && node src\app-simple.js`
Terminal 2: `cd backend\services\sensor-service && node src\app-simple.js`
Terminal 3: `cd backend\services\analysis-service && node src\app-simple.js`
Terminal 4: `cd backend\services\notification-service && node src\app-simple.js`

Debes ver en cada terminal:
```
Conectado a MySQL
Auth/Sensor/Analysis/Notification Service escuchando en puerto XXXX
```

## VENTAJAS DE MYSQL

- Sin problemas de autenticacion
- Password puede estar vacio por defecto
- Mas facil de configurar
- Las tablas se crean automaticamente

## SI TIENES ERROR

El unico error posible es credenciales incorrectas.
Edita `config.js` con tu usuario/password real de MySQL.
