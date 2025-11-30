/**
 * AUTH ROUTES - Rutas de autenticación
 *
 * Propósito:
 * Definir las rutas del servicio de autenticación
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { authenticate } = require('../../../../shared/middleware/authMiddleware');

// ========== RUTAS PÚBLICAS (sin autenticación) ==========

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/refresh-token
 * Refrescar token JWT
 */
router.post('/refresh-token', authController.refreshToken);

// ========== RUTAS PROTEGIDAS (requieren autenticación) ==========

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * PUT /api/auth/profile
 * Actualizar perfil del usuario autenticado
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * PUT /api/auth/change-password
 * Cambiar contraseña del usuario autenticado
 */
router.put('/change-password', authenticate, authController.changePassword);

/**
 * PUT /api/auth/preferences
 * Actualizar preferencias de notificación
 */
router.put('/preferences', authenticate, authController.updatePreferences);

// ========== RUTAS DE GESTIÓN DE USUARIOS ==========

/**
 * GET /api/usuarios
 * Listar usuarios (admin)
 */
router.get('/usuarios', authenticate, userController.getUsers);

/**
 * GET /api/usuarios/:id
 * Obtener usuario por ID
 */
router.get('/usuarios/:id', authenticate, userController.getUserById);

/**
 * PUT /api/usuarios/:id/activate
 * Activar usuario
 */
router.put('/usuarios/:id/activate', authenticate, userController.activateUser);

/**
 * PUT /api/usuarios/:id/deactivate
 * Desactivar usuario
 */
router.put('/usuarios/:id/deactivate', authenticate, userController.deactivateUser);

module.exports = router;
