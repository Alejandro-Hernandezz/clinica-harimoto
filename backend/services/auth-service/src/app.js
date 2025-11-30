/**
 * AUTH SERVICE - Aplicación principal
 *
 * Propósito:
 * Servicio de autenticación y gestión de usuarios
 *
 * Patrón aplicado:
 * - Microservicio: Servicio independiente con BD propia
 * - API REST: Endpoints HTTP para CRUD de usuarios
 *
 * Puerto: 3000
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/errorHandler');
const { requestLogger } = require('../../../shared/middleware/logger');
const env = require('./config/environment');

const app = express();

// ========== MIDDLEWARES ==========

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// ========== RUTAS ==========

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Para /api/usuarios

// ========== MANEJO DE ERRORES ==========

// Ruta no encontrada
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// ========== INICIO DEL SERVIDOR ==========

const startServer = async () => {
  try {
    console.log('='.repeat(60));
    console.log('🚀 RIEGO-SMART - AUTH SERVICE');
    console.log('='.repeat(60));

    // Conectar a la base de datos
    console.log('\n[1/3] Conectando a la base de datos...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Sincronizar modelos
    console.log('\n[2/3] Sincronizando modelos...');
    await syncDatabase();

    // Iniciar servidor
    console.log('\n[3/3] Iniciando servidor HTTP...');
    app.listen(env.PORT, () => {
      console.log('='.repeat(60));
      console.log(`✅ Auth Service escuchando en puerto ${env.PORT}`);
      console.log(`📝 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${env.PORT}`);
      console.log(`🏥 Health: http://localhost:${env.PORT}/health`);
      console.log('='.repeat(60));
      console.log('\n📋 Endpoints disponibles:');
      console.log('   POST   /api/auth/register');
      console.log('   POST   /api/auth/login');
      console.log('   POST   /api/auth/logout');
      console.log('   POST   /api/auth/refresh-token');
      console.log('   GET    /api/auth/profile');
      console.log('   PUT    /api/auth/profile');
      console.log('   PUT    /api/auth/change-password');
      console.log('   PUT    /api/auth/preferences');
      console.log('   GET    /api/usuarios');
      console.log('   GET    /api/usuarios/:id');
      console.log('='.repeat(60));
    });

  } catch (error) {
    console.error('\n❌ Error al iniciar el servidor:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app;
