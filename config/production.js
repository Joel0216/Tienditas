// Configuración específica para producción
const productionConfig = {
  host: process.env.MYSQLHOST || 'yamanote.proxy.rlwy.net',
  port: parseInt(process.env.MYSQLPORT) || 25839,
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

console.log('🚀 Configuración de producción cargada');
console.log('📡 Host:', productionConfig.host);
console.log('🔌 Puerto:', productionConfig.port);

module.exports = productionConfig; 