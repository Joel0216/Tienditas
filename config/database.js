const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

const dbConfig = {
  host: process.env.MYSQLHOST || 'yamanote.proxy.rlwy.net',
  port: process.env.MYSQLPORT || 25839,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'wEOqpNxfqYJZFcTmopEjspgSDyFdDOhJ',
  database: process.env.MYSQLDATABASE || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  },
  connectTimeout: 60000
};

const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
  }
}

module.exports = { pool, testConnection }; 