// CONFIGURACION UNICA DEL SISTEMA
// EDITA ESTE ARCHIVO CON TUS CREDENCIALES REALES

module.exports = {
  // CREDENCIALES DE TU POSTGRESQL
  database: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',           // CAMBIA ESTO si tu usuario es diferente
    password: 'Adezito666',     // CAMBIA ESTO con tu password real

    // Nombres de las bases de datos (NO cambies estos)
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
