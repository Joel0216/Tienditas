const mysql = require('mysql2/promise');

async function testRailwayConnection() {
    const config = {
        host: 'yamanote.proxy.rlwy.net',
        port: 25839,
        user: 'root',
        password: 'wEOqpNxfqYJZFcTmopEjspgSDyFdDOhJ',
        database: 'railway',
        ssl: {
            rejectUnauthorized: false
        }
    };

    try {
        console.log('🔍 Probando conexión a Railway...');
        console.log('📡 Configuración:', {
            host: config.host,
            port: config.port,
            user: config.user,
            database: config.database
        });

        const connection = await mysql.createConnection(config);
        console.log('✅ Conexión exitosa a Railway!');

        // Probar una consulta simple
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Consulta de prueba exitosa:', rows);

        await connection.end();
        console.log('🎉 Railway está configurado correctamente para conexiones externas');

    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        console.log('💡 Posibles soluciones:');
        console.log('1. Verificar que ALLOW_EXTERNAL_CONNECTIONS=true en Railway');
        console.log('2. Verificar que el servicio esté reiniciado');
        console.log('3. Verificar las credenciales de conexión');
    }
}

testRailwayConnection(); 