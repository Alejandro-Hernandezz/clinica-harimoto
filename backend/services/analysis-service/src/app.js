/**
 * ANALYSIS SERVICE - Aplicación principal
 *
 * Puerto: 3002
 * Funcionalidades:
 * - Análisis de datos de sensores
 * - Generación de alertas según reglas
 * - Consumer de RabbitMQ
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./config/database');
const analysisService = require('./services/analysisService');
const { startConsumer } = require('./consumers/sensorDataConsumer');
const { authenticate } = require('../../../shared/middleware/authMiddleware');
const { asyncHandler } = require('../../../shared/middleware/errorHandler');
const { successResponse } = require('../../../shared/utils/helpers');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// ========== RUTAS ==========

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'analysis-service', status: 'healthy' });
});

// Obtener alertas
app.get('/api/alertas', authenticate, asyncHandler(async (req, res) => {
  const usuarioId = req.user.id;
  const alertas = await analysisService.getAlertas(usuarioId, req.query);
  res.json(successResponse(alertas, 'Alertas obtenidas exitosamente'));
}));

// Marcar alerta como leída
app.put('/api/alertas/:id/leer', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.user.id;
  const alerta = await analysisService.marcarLeida(id, usuarioId);
  res.json(successResponse(alerta, 'Alerta marcada como leída'));
}));

// Resolver alerta
app.put('/api/alertas/:id/resolver', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.user.id;
  const alerta = await analysisService.resolverAlerta(id, usuarioId);
  res.json(successResponse(alerta, 'Alerta resuelta'));
}));

// ========== INICIO ==========

const startServer = async () => {
  try {
    console.log('='.repeat(60));
    console.log('🚀 RIEGO-SMART - ANALYSIS SERVICE');
    console.log('='.repeat(60));

    // Conectar BD
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('[Database] ✅ Conectado');

    // Iniciar consumer
    await startConsumer();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Analysis Service escuchando en puerto ${PORT}`);
      console.log('='.repeat(60));
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
