const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');

// Cargar variables de entorno
require('dotenv').config({ path: './config.env' });

// Debug: Mostrar variables de entorno en producción
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Modo producción detectado');
  console.log('📡 Variables de entorno cargadas');
  console.log('🔍 Verificando configuración de base de datos...');
  console.log('MYSQLHOST:', process.env.MYSQLHOST);
  console.log('MYSQLPORT:', process.env.MYSQLPORT);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/duenos', require('./routes/duenos'));
app.use('/api/empleados', require('./routes/empleados'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/marcas', require('./routes/marcas'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/pedidos', require('./routes/pedidos'));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Función para iniciar el servidor
async function iniciarServidor() {
  try {
    // Probar conexión a la base de datos
    console.log('🔍 Probando conexión a la base de datos...');
    await testConnection();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📱 Abre tu navegador y ve a: http://localhost:${PORT}`);
      console.log(`💡 Para detener el servidor, presiona Ctrl+C`);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    console.log('\n🔧 Soluciones posibles:');
    console.log('1. Verifica que MySQL esté ejecutándose');
    console.log('2. Verifica las credenciales en config.env');
    console.log('3. Ejecuta el script database.sql en MySQL');
    console.log('4. Asegúrate de que la base de datos "tienditas" exista');
    process.exit(1);
  }
}

// Iniciar servidor
iniciarServidor(); 