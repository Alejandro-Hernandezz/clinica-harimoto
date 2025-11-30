-- EJECUTA ESTO EN pgAdmin QUERY TOOL
-- Conectado a la base de datos: postgres

DROP DATABASE IF EXISTS auth_service;
DROP DATABASE IF EXISTS sensor_service;
DROP DATABASE IF EXISTS analysis_service;
DROP DATABASE IF EXISTS notification_service;

CREATE DATABASE auth_service;
CREATE DATABASE sensor_service;
CREATE DATABASE analysis_service;
CREATE DATABASE notification_service;

-- LISTO. Ahora ejecuta: install-all.bat y luego start-all.bat
