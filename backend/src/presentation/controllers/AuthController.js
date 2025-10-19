// GUARDAR COMO: backend/src/presentation/controllers/AuthController.js

const AuthService = require('../../business/services/AuthService');

class AuthController {
  
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Validar formato de password (4 dígitos)
      if (!/^\d{4}$/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe ser 4 dígitos'
        });
      }

      // Autenticar
      const resultado = await AuthService.autenticar(email, password);

      if (resultado.success) {
        return res.status(200).json({
          success: true,
          message: 'Inicio de sesión exitoso',
          data: {
            tipo: resultado.tipo,
            usuario: resultado.usuario
          }
        });
      }

      return res.status(401).json({
        success: false,
        message: resultado.message
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async verificarEmail(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email es requerido'
        });
      }

      const resultado = await AuthService.verificarEmail(email);

      res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();