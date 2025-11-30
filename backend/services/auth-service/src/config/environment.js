/**
 * ENVIRONMENT CONFIG - Configuración de variables de entorno
 *
 * Propósito:
 * Centralizar acceso a variables de entorno
 */

require('dotenv').config();

module.exports = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'auth_service',
  DB_USER: process.env.DB_USER || 'riego_admin',
  DB_PASSWORD: process.env.DB_PASSWORD || 'riego_password_2024',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'riego_smart_secret_key_2024_ultra_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100')
};
