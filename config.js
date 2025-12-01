// CONFIGURACION UNICA - MYSQL

module.exports = {
  // MYSQL - Mas simple que PostgreSQL
  database: {
    host: 'localhost',
    port: 3306,
    user: 'root',              // Usuario por defecto de MySQL
    password: '',              // CAMBIA ESTO: tu password de MySQL (puede estar vacio)

    // Nombres de las bases de datos
    databases: {
      auth: 'auth_service',
      sensor: 'sensor_service',
      analysis: 'analysis_service',
      notification: 'notification_service'
    }
  },

  // Puertos de los servicios
  ports: {
    auth: 3000,
    sensor: 3001,
    analysis: 3002,
    notification: 3003
  },

  // JWT Secret
  jwtSecret: 'riego_smart_secret_2024'
};
