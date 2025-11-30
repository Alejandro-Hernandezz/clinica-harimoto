/**
 * SENSOR SERVICE - Aplicación principal
 *
 * Puerto: 3001
 * Funcionalidades:
 * - Gestión de sensores
 * - Almacenamiento de datos
 * - Simulador de sensores (SIN ARDUINO)
 * - Publicación a RabbitMQ
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const sensorRoutes = require('./routes/sensorRoutes');
const dataService = require('./services/dataService');
const simulatorService = require('./services/simulatorService');
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/errorHandler');
const { requestLogger } = require('../../../shared/middleware/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// ========== MIDDLEWARES ==========

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ========== RUTAS ==========

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'sensor-service',
    status: 'healthy',
    simulator: simulatorService.getEstadisticas(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api', sensorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// ========== INICIO DEL SERVIDOR ==========

const startServer = async () => {
  try {
    console.log('='.repeat(60));
    console.log('🚀 RIEGO-SMART - SENSOR SERVICE');
    console.log('='.repeat(60));

    // Conectar a BD
    console.log('\n[1/4] Conectando a la base de datos...');
    await testConnection();
    await syncDatabase();

    // Inicializar RabbitMQ para dataService
    console.log('\n[2/4] Inicializando RabbitMQ (Data Service)...');
    await dataService.initialize();

    // Inicializar RabbitMQ para simulatorService
    console.log('\n[3/4] Inicializando RabbitMQ (Simulator Service)...');
    await simulatorService.initialize();

    // Iniciar servidor
    console.log('\n[4/4] Iniciando servidor HTTP...');
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log(`✅ Sensor Service escuchando en puerto ${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log('='.repeat(60));
      console.log('\n📋 Endpoints disponibles:');
      console.log('   POST   /api/sensores');
      console.log('   GET    /api/sensores');
      console.log('   GET    /api/sensores/:id');
      console.log('   PUT    /api/sensores/:id');
      console.log('   DELETE /api/sensores/:id');
      console.log('\n📊 Endpoints de datos:');
      console.log('   POST   /api/sensores/:id/datos');
      console.log('   GET    /api/sensores/:id/datos/historial');
      console.log('   GET    /api/sensores/:id/estadisticas');
      console.log('\n🤖 Endpoints del SIMULADOR:');
      console.log('   POST   /api/sensores/:id/simular/bulk');
      console.log('   POST   /api/sensores/:id/simular/stream/start');
      console.log('   POST   /api/sensores/:id/simular/stream/stop');
      console.log('   POST   /api/sensores/:id/simular/evento');
      console.log('='.repeat(60));
    });

  } catch (error) {
    console.error('\n❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

startServer();

module.exports = app;
