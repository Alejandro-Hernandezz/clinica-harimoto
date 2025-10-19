const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const { sequelize } = require('./src/persistence/models');
const citaRoutes = require('./src/presentation/routes/citaRoutes');
const medicoRoutes = require('./src/presentation/routes/MedicoRoutes');
const especialidadRoutes = require('./src/presentation/routes/especialidadRoutes');
const authRoutes = require('./src/presentation/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (dist)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Rutas API
app.use('/api', citaRoutes);
app.use('/api', medicoRoutes); 
app.use('/api', especialidadRoutes);
app.use('/api', authRoutes);

// Servir el frontend para cualquier ruta no-API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor ejecutandose en puerto ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos exitosa');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
});