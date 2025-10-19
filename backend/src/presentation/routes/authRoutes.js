// GUARDAR COMO: backend/src/presentation/routes/authRoutes.js

const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Login
router.post('/auth/login', AuthController.login.bind(AuthController));

// Verificar si un email existe
router.get('/auth/verificar-email', AuthController.verificarEmail.bind(AuthController));

module.exports = router;