-- Script de inicialización de base de datos para RIEGO-SMART
-- Se ejecuta automáticamente al crear el contenedor de PostgreSQL

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Crear bases de datos para cada servicio (arquitectura de microservicios)
CREATE DATABASE auth_service;
CREATE DATABASE sensor_service;
CREATE DATABASE analysis_service;
CREATE DATABASE notification_service;

-- Conectar a cada base de datos y crear esquemas básicos

-- AUTH SERVICE
\c auth_service;
CREATE SCHEMA IF NOT EXISTS auth;
COMMENT ON SCHEMA auth IS 'Esquema para autenticación y usuarios';

-- SENSOR SERVICE
\c sensor_service;
CREATE SCHEMA IF NOT EXISTS sensors;
COMMENT ON SCHEMA sensors IS 'Esquema para gestión de sensores y datos';

-- ANALYSIS SERVICE
\c analysis_service;
CREATE SCHEMA IF NOT EXISTS analysis;
COMMENT ON SCHEMA analysis IS 'Esquema para análisis y alertas';

-- NOTIFICATION SERVICE
\c notification_service;
CREATE SCHEMA IF NOT EXISTS notifications;
COMMENT ON SCHEMA notifications IS 'Esquema para notificaciones';

-- Volver a la base de datos principal
\c riego_smart;

-- Crear usuario de aplicación con permisos
CREATE USER riego_app WITH PASSWORD 'riego_app_password_2024';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE auth_service TO riego_app;
GRANT ALL PRIVILEGES ON DATABASE sensor_service TO riego_app;
GRANT ALL PRIVILEGES ON DATABASE analysis_service TO riego_app;
GRANT ALL PRIVILEGES ON DATABASE notification_service TO riego_app;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Base de datos RIEGO-SMART inicializada correctamente';
END $$;
