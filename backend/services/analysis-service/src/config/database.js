const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'analysis_service',
  process.env.DB_USER || 'riego_admin',
  process.env.DB_PASSWORD || 'riego_password_2024',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

module.exports = { sequelize };
