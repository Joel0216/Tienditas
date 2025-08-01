const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener todas las ventas del dueño
router.get('/', verificarToken, async (req, res) => {
    try {
        // Usar procedimiento almacenado para obtener ventas
        const [rows] = await pool.execute('CALL sp_obtener_ventas_dueno(?)', [req.usuario.id_dueno]);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener ventas' });
    }
});

// Obtener una venta específica
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT v.*, p.nombre as nombre_producto, e.nombre as nombre_empleado
            FROM Venta v
            JOIN Producto p ON v.id_producto = p.id_producto
            JOIN Empleado e ON v.id_empleado = e.id_empleado
            WHERE v.id_venta = ? AND v.id_dueno = ?
        `, [req.params.id, req.usuario.id_dueno]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Venta no encontrada' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ success: false, message: 'Error al obtener venta' });
    }
});

// Registrar nueva venta
router.post('/', verificarToken, async (req, res) => {
    try {
        const { id_producto, cantidad_vendida, metodo_pago, monto_pagado } = req.body;
        const id_dueno = req.usuario.id_dueno;
        
        // Obtener el empleado del token
        let id_empleado;
        if (req.usuario.tipo === 'empleado') {
            id_empleado = req.usuario.id_empleado;
        } else {
            // Si es dueño, buscar el empleado con el nombre del dueño o crear uno
            const [empleados] = await pool.execute(
                'SELECT id_empleado FROM Empleado WHERE id_dueno = ? AND activo = 1 LIMIT 1',
                [id_dueno]
            );
            if (empleados.length > 0) {
                id_empleado = empleados[0].id_empleado;
            } else {
                // Si no hay empleados, crear uno con el nombre del dueño
                const [result] = await pool.execute(
                    'INSERT INTO Empleado (nombre, turno, fecha_contratacion, activo, id_dueno) VALUES (?, ?, CURDATE(), 1, ?)',
                    [req.usuario.nombre, 'Mañana', id_dueno]
                );
                id_empleado = result.insertId;
            }
        }
        
        // Validaciones
        if (!id_producto || !cantidad_vendida || !metodo_pago || !monto_pagado) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }
        
        if (cantidad_vendida <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad debe ser mayor a 0'
            });
        }
        
        if (monto_pagado <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto pagado debe ser mayor a 0'
            });
        }
        
        // Verificar que el método de pago sea válido
        const metodosValidos = ['Efectivo', 'Tarjeta', 'Transferencia', 'Mixto'];
        if (!metodosValidos.includes(metodo_pago)) {
            return res.status(400).json({
                success: false,
                message: 'Método de pago no válido'
            });
        }
        
        // Obtener información del producto
        const [productos] = await pool.execute(
            'SELECT precio, cantidad_disponible FROM Producto WHERE id_producto = ? AND id_dueno = ?',
            [id_producto, id_dueno]
        );
        
        if (productos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        const producto = productos[0];
        
        // Verificar stock
        if (producto.cantidad_disponible < cantidad_vendida) {
            return res.status(400).json({
                success: false,
                message: 'No hay suficiente stock disponible'
            });
        }
        
        // Calcular total
        const total = producto.precio * cantidad_vendida;
        const cambio = monto_pagado - total;
        
        if (cambio < 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto pagado es insuficiente'
            });
        }
        
        // Insertar venta
        const [result] = await pool.execute(
            `INSERT INTO Venta (id_producto, cantidad_vendida, precio_unitario, total, 
             metodo_pago, monto_pagado, cambio, id_empleado, id_dueno) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_producto, cantidad_vendida, producto.precio, total, 
             metodo_pago, monto_pagado, cambio, id_empleado, id_dueno]
        );
        
        res.json({
            success: true,
            message: 'Venta registrada exitosamente',
            data: {
                id_venta: result.insertId,
                total: total,
                cambio: cambio
            }
        });
        
    } catch (error) {
        console.error('Error registrando venta:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Obtener reporte de ventas por fecha
router.get('/reporte/fecha', verificarToken, async (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;
    
    try {
        let query = `
            SELECT v.*, p.nombre as nombre_producto, e.nombre as nombre_empleado
            FROM Venta v
            JOIN Producto p ON v.id_producto = p.id_producto
            JOIN Empleado e ON v.id_empleado = e.id_empleado
            WHERE v.id_dueno = ?
        `;
        
        const params = [req.usuario.id_dueno];
        
        if (fecha_inicio && fecha_fin) {
            query += ` AND DATE(v.fecha_venta) BETWEEN ? AND ?`;
            params.push(fecha_inicio, fecha_fin);
        }
        
        query += ` ORDER BY v.fecha_venta DESC`;
        
        const [rows] = await pool.execute(query, params);
        
        // Calcular estadísticas
        const totalVentas = rows.length;
        const totalIngresos = rows.reduce((sum, venta) => sum + parseFloat(venta.total), 0);
        
        res.json({ 
            success: true, 
            data: rows,
            estadisticas: {
                total_ventas: totalVentas,
                total_ingresos: totalIngresos
            }
        });
    } catch (error) {
        console.error('Error al obtener reporte de ventas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener reporte de ventas' });
    }
});

// Obtener productos más vendidos
router.get('/reporte/productos-populares', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.nombre, p.precio, SUM(v.cantidad_vendida) as total_vendido,
                   SUM(v.total) as ingresos_totales
            FROM Venta v
            JOIN Producto p ON v.id_producto = p.id_producto
            WHERE v.id_dueno = ?
            GROUP BY v.id_producto
            ORDER BY total_vendido DESC
            LIMIT 10
        `, [req.usuario.id_dueno]);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener productos populares:', error);
        res.status(500).json({ success: false, message: 'Error al obtener productos populares' });
    }
});

// Obtener estadísticas de ventas
router.get('/estadisticas', verificarToken, async (req, res) => {
    try {
        const id_dueno = req.usuario.id_dueno;
        
        // Usar procedimiento almacenado para estadísticas generales
        const [estadisticas] = await pool.execute('CALL sp_estadisticas_ventas_hoy(?)', [id_dueno]);
        
        // Usar procedimiento almacenado para ventas por método
        const [ventasPorMetodo] = await pool.execute('CALL sp_ventas_por_metodo_hoy(?)', [id_dueno]);
        
        // Usar procedimiento almacenado para productos más vendidos
        const [productosMasVendidos] = await pool.execute('CALL sp_productos_mas_vendidos_hoy(?, ?)', [id_dueno, 5]);
        
        res.json({
            success: true,
            data: {
                estadisticas_generales: estadisticas[0],
                ventas_por_metodo: ventasPorMetodo,
                productos_mas_vendidos: productosMasVendidos
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router; 