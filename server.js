const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/empleados', require('./routes/empleados'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/marcas', require('./routes/marcas'));
app.use('/api/proveedores', require('./routes/proveedores'));

// Ruta para el dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Ruta para el panel de empleados
app.get('/empleado', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'empleado.html'));
});

// Ruta para limpiar sesión
app.get('/limpiar', (req, res) => {
    res.sendFile(path.join(__dirname, 'limpiar_sesion.html'));
});

// Servir archivos estáticos
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  await testConnection();
});

module.exports = app; 