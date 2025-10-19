// GUARDAR COMO: backend/src/persistence/models/index.js
// REEMPLAZA TODO EL CONTENIDO

const sequelize = require('../database');
const Paciente = require('./Paciente');
const Medico = require('./Medico');
const Especialidad = require('./Especialidad');
const Cita = require('./Cita');

// Relaciones Especialidad - Medico
Especialidad.hasMany(Medico, { foreignKey: 'especialidad_id', as: 'Medicos' });
Medico.belongsTo(Especialidad, { foreignKey: 'especialidad_id', as: 'Especialidad' });

// Relaciones Cita - Paciente
Cita.belongsTo(Paciente, { foreignKey: 'paciente_id', as: 'Paciente' });
Paciente.hasMany(Cita, { foreignKey: 'paciente_id', as: 'Citas' });

// Relaciones Cita - Medico
Cita.belongsTo(Medico, { foreignKey: 'medico_id', as: 'Medico' });
Medico.hasMany(Cita, { foreignKey: 'medico_id', as: 'Citas' });

module.exports = {
  sequelize,
  Paciente,
  Medico,
  Especialidad,
  Cita
};