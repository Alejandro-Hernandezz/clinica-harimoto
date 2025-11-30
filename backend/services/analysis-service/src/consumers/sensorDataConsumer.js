/**
 * SENSOR DATA CONSUMER - Consumer de datos de sensores
 *
 * Escucha: sensor.data.received
 * Procesa datos y genera alertas según reglas
 */

const analysisService = require('../services/analysisService');

async function startConsumer() {
  try {
    await analysisService.initialize();

    // Escuchar cola de datos de sensores
    await analysisService.rabbitClient.consume(
      'sensor.data.received',
      async (dato) => {
        console.log(`[Consumer] 📩 Dato recibido de sensor:`, dato);

        // Analizar dato y generar alertas si es necesario
        await analysisService.analizarDato(dato);
      }
    );

    console.log('[Consumer] ✅ Consumer de datos de sensores iniciado');

  } catch (error) {
    console.error('[Consumer] ❌ Error al iniciar consumer:', error.message);
  }
}

module.exports = { startConsumer };
