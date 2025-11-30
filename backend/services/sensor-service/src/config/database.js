/**
 * DATABASE CONFIG - Configuración de base de datos para Sensor Service
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sensor_service',
  process.env.DB_USER || 'riego_admin',
  process.env.DB_PASSWORD || 'riego_password_2024',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('[Database] ✅ Conexión establecida correctamente');
    return true;
  } catch (error) {
    console.error('[Database] ❌ Error al conectar:', error.message);
    return false;
  }
};

const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log(`[Database] ✅ Base de datos sincronizada`);
    return true;
  } catch (error) {
    console.error('[Database] ❌ Error al sincronizar:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection, syncDatabase };
