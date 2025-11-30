/**
 * ANALYSIS SERVICE - Servicio de análisis de datos
 */

const Alert = require('../models/Alert');
const RabbitMQClient = require('../../../../shared/messagebroker/RabbitMQClient');
const { ALERT_RULES } = require('../config/alertRules');

class AnalysisService {
  constructor() {
    this.rabbitClient = null;
  }

  async initialize() {
    this.rabbitClient = new RabbitMQClient();
    await this.rabbitClient.connect();
  }

  /**
   * Analizar dato de sensor y generar alertas si es necesario
   */
  async analizarDato(dato) {
    const { sensorId, usuarioId, tipo, valor, ubicacion } = dato;
    const alertasGeneradas = [];

    // Aplicar cada regla
    for (const ruleName in ALERT_RULES) {
      const rule = ALERT_RULES[ruleName];

      if (rule.condicion(valor, tipo)) {
        // Crear alerta
        const alerta = await Alert.create({
          usuarioId,
          sensorId,
          tipo: rule.tipo,
          severidad: rule.severidad,
          mensaje: rule.mensaje(valor, ubicacion || 'Ubicación desconocida'),
          recomendacion: rule.recomendacion
        });

        console.log(`[Analysis] 🚨 Alerta generada: ${rule.tipo} - ${alerta.mensaje}`);

        // Publicar a RabbitMQ
        if (this.rabbitClient && this.rabbitClient.isConnected) {
          await this.rabbitClient.publish('alert.generated', {
            alertaId: alerta.id,
            usuarioId: alerta.usuarioId,
            sensorId: alerta.sensorId,
            tipo: alerta.tipo,
            severidad: alerta.severidad,
            mensaje: alerta.mensaje,
            recomendacion: alerta.recomendacion,
            timestamp: new Date()
          });
        }

        alertasGeneradas.push(alerta);
      }
    }

    return alertasGeneradas;
  }

  async getAlertas(usuarioId, filters = {}) {
    const where = { usuarioId };

    if (filters.leida !== undefined) where.leida = filters.leida === 'true';
    if (filters.resuelta !== undefined) where.resuelta = filters.resuelta === 'true';
    if (filters.tipo) where.tipo = filters.tipo;

    const alertas = await Alert.findAll({
      where,
      order: [['fecha_generacion', 'DESC']],
      limit: filters.limit || 50
    });

    return alertas;
  }

  async marcarLeida(alertaId, usuarioId) {
    const alerta = await Alert.findOne({ where: { id: alertaId, usuarioId } });
    if (!alerta) throw new Error('Alerta no encontrada');

    alerta.leida = true;
    await alerta.save();

    return alerta;
  }

  async resolverAlerta(alertaId, usuarioId) {
    const alerta = await Alert.findOne({ where: { id: alertaId, usuarioId } });
    if (!alerta) throw new Error('Alerta no encontrada');

    alerta.resuelta = true;
    alerta.fechaResolucion = new Date();
    await alerta.save();

    return alerta;
  }
}

module.exports = new AnalysisService();
