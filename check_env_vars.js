require('dotenv').config({ path: './config.env' });

console.log('🔍 Verificando variables de entorno...\n');

const vars = [
  'MYSQLHOST',
  'MYSQLPORT', 
  'MYSQLUSER',
  'MYSQLPASSWORD',
  'MYSQLDATABASE',
  'JWT_SECRET',
  'PORT',
  'NODE_ENV'
];

vars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value}`);
  
  // Verificar si hay duplicación
  if (value && value.includes(`${varName}=`)) {
    console.log(`❌ ERROR: ${varName} está duplicado!`);
    console.log(`   Valor actual: ${value}`);
    console.log(`   Debería ser: ${value.split('=')[1]}`);
  }
});

console.log('\n📡 Configuración de base de datos:');
console.log(`Host: ${process.env.MYSQLHOST}`);
console.log(`Port: ${process.env.MYSQLPORT}`);
console.log(`User: ${process.env.MYSQLUSER}`);
console.log(`Database: ${process.env.MYSQLDATABASE}`);

// Verificar que no esté usando mysql.railway.internal
if (process.env.MYSQLHOST === 'mysql.railway.internal') {
  console.log('\n❌ ERROR: mysql.railway.internal no es accesible desde Render.com');
  console.log('💡 Debería ser: yamanote.proxy.rlwy.net');
} 