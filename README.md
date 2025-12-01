# RIEGO-SMART - Sistema Completo con Frontend

## INICIO RAPIDO

### 1. Configura MySQL en config.js

```javascript
user: 'root',
password: 'root',  // o '' si no tienes password
```

### 2. Inicia MySQL

```cmd
docker-compose up -d mysql
```

O si tienes MySQL instalado, asegúrate que esté corriendo.

### 3. Crea las bases de datos

```cmd
mysql -u root -proot -e "CREATE DATABASE auth_service;"
mysql -u root -proot -e "CREATE DATABASE sensor_service;"
mysql -u root -proot -e "CREATE DATABASE analysis_service;"
mysql -u root -proot -e "CREATE DATABASE notification_service;"
```

### 4. Instala dependencias

```cmd
cd backend\services\auth-service && npm install && cd ..\..\..
cd backend\services\sensor-service && npm install && cd ..\..\..
cd backend\services\analysis-service && npm install && cd ..\..\..
cd backend\services\notification-service && npm install && cd ..\..\..
```

### 5. Inicia los 4 servicios backend (4 terminales)

```cmd
cd backend\services\auth-service && node src\app-simple.js
cd backend\services\sensor-service && node src\app-simple.js
cd backend\services\analysis-service && node src\app-simple.js
cd backend\services\notification-service && node src\app-simple.js
```

### 6. Abre el frontend

Abre el archivo `frontend/index.html` en tu navegador.

## USO DEL SISTEMA

### Primera vez:
1. Haz click en "Registrarse"
2. Ingresa email, password y nombre
3. Después inicia sesión con esas credenciales

### Crear sensores:
1. Completa el formulario de "Crear Nuevo Sensor"
2. Haz click en "Crear Sensor"

### Simular datos:
1. En tu sensor, haz click en "Simular Lectura"
2. Esto generará datos automáticos
3. Si la humedad es baja, se creará una alerta

### Ver alertas y notificaciones:
1. Usa las pestañas superiores
2. Las alertas se generan automáticamente cuando la humedad está fuera de los umbrales
3. Las notificaciones se envían automáticamente (simuladas)

## ESTRUCTURA

```
frontend/
  index.html  - Interfaz web
  app.js      - Lógica del frontend

backend/
  services/
    auth-service/      - Puerto 3000
    sensor-service/    - Puerto 3001
    analysis-service/  - Puerto 3002
    notification-service/ - Puerto 3003

config.js - Configuración única
```

## NOTAS

- El frontend se conecta a los 4 backends automáticamente
- Todos los datos se guardan en MySQL
- El sistema simula sensores sin hardware real
- Las notificaciones son simuladas (SMS/Email)
