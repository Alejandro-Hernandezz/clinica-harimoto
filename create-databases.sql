CREATE DATABASE auth_service;
CREATE DATABASE sensor_service;
CREATE DATABASE analysis_service;
CREATE DATABASE notification_service;

GRANT ALL PRIVILEGES ON DATABASE auth_service TO riego_admin;
GRANT ALL PRIVILEGES ON DATABASE sensor_service TO riego_admin;
GRANT ALL PRIVILEGES ON DATABASE analysis_service TO riego_admin;
GRANT ALL PRIVILEGES ON DATABASE notification_service TO riego_admin;
