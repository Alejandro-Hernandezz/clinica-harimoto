/**
 * DATABASE CONFIG - Configuración de base de datos
 *
 * Propósito:
 * Configurar Sequelize ORM para el servicio de autenticación
 *
 * Patrones aplicados:
 * - Microservicios: Base de datos independiente por servicio
 * - Configuration: Centralizar configuración de BD
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'auth_service',
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
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    }
  }
);

/**
 * Probar conexión a la base de datos
 */
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

/**
 * Sincronizar modelos con la base de datos
 *
 * @param {boolean} force - Si es true, elimina y recrea las tablas
 */
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log(`[Database] ✅ Base de datos sincronizada ${force ? '(force)' : '(alter)'}`);
    return true;
  } catch (error) {
    console.error('[Database] ❌ Error al sincronizar:', error.message);
    return false;
  }
};

/**
 * Cerrar conexión
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('[Database] 👋 Conexión cerrada');
  } catch (error) {
    console.error('[Database] ❌ Error al cerrar conexión:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  closeConnection
};
