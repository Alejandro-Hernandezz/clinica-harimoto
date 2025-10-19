// GUARDAR COMO: backend/src/persistence/database.js
// REEMPLAZA TODO EL CONTENIDO

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'clinica_harimoto',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Conexión a BD exitosa'))
  .catch(err => console.error('❌ Error de conexión:', err.message));

module.exports = sequelize;