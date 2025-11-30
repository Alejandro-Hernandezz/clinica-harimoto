/**
 * USER MODEL - Modelo de Usuario
 *
 * Propósito:
 * Representar un usuario del sistema RIEGO-SMART
 *
 * Campos:
 * - id: UUID único
 * - email: Email único (usado para login)
 * - password: Contraseña hasheada con bcrypt
 * - nombre: Nombre completo del usuario
 * - telefonoPropiedad: Teléfono de contacto
 * - emailPropiedad: Email secundario para notificaciones
 * - preferenciasNotificacion: JSON con preferencias
 * - activo: Si el usuario está activo
 * - fechaRegistro: Fecha de registro
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Debe ser un email válido'
      }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },

  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [8, 255],
        msg: 'La contraseña debe tener al menos 8 caracteres'
      }
    }
  },

  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El nombre no puede estar vacío'
      }
    }
  },

  telefonoPropiedad: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'telefono_propiedad'
  },

  emailPropiedad: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'email_propiedad',
    validate: {
      isEmail: {
        msg: 'Debe ser un email válido'
      }
    }
  },

  preferenciasNotificacion: {
    type: DataTypes.JSONB,
    defaultValue: {
      sms: true,
      email: true,
      push: false
    },
    field: 'preferencias_notificacion'
  },

  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },

  fechaRegistro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    field: 'fecha_registro'
  },

  ultimoAcceso: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'ultimo_acceso'
  }

}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',

  // Índices
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['activo']
    }
  ],

  // Hooks
  hooks: {
    // Hash de contraseña antes de crear
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },

    // Hash de contraseña antes de actualizar (si cambió)
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

/**
 * Métodos de instancia
 */

/**
 * Comparar contraseña
 *
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<boolean>}
 */
User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * Obtener datos públicos (sin contraseña)
 *
 * @returns {Object}
 */
User.prototype.toPublicJSON = function() {
  const { password, ...publicData } = this.toJSON();

  return {
    ...publicData,
    preferenciasNotificacion: publicData.preferencias_notificacion
  };
};

/**
 * Actualizar último acceso
 */
User.prototype.updateLastAccess = async function() {
  this.ultimoAcceso = new Date();
  await this.save();
};

/**
 * Métodos estáticos
 */

/**
 * Buscar usuario por email
 *
 * @param {string} email
 * @returns {Promise<User|null>}
 */
User.findByEmail = async function(email) {
  return await this.findOne({
    where: {
      email: email.toLowerCase().trim()
    }
  });
};

/**
 * Buscar usuarios activos
 *
 * @returns {Promise<Array<User>>}
 */
User.findActive = async function() {
  return await this.findAll({
    where: {
      activo: true
    },
    order: [['created_at', 'DESC']]
  });
};

module.exports = User;
