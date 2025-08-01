const mysql = require('mysql2/promise');

async function testRenderConnection() {
    const config = {
        host: 'yamanote.proxy.rlwy.net',
        port: 25839,
        user: 'root',
        password: 'wEOqpNxfqYJZFcTmopEjspgSDyFdDOhJ',
        database: 'railway',
        ssl: {
            rejectUnauthorized: false
        },
        connectTimeout: 60000
    };

    try {
        console.log('🔍 Probando conexión desde Render.com...');
        console.log('📡 Configuración:', {
            host: config.host,
            port: config.port,
            user: config.user,
            database: config.database
        });

        const connection = await mysql.createConnection(config);
        console.log('✅ Conexión exitosa desde Render.com!');

        // Probar una consulta simple
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Consulta de prueba exitosa:', rows);

        await connection.end();
        console.log('🎉 Render.com puede conectarse a Railway correctamente');

    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        console.log('💡 Posibles soluciones:');
        console.log('1. Verificar que Railway permita conexiones externas');
        console.log('2. Verificar las credenciales de conexión');
        console.log('3. Verificar que el puerto esté abierto');
    }
}

testRenderConnection(); 