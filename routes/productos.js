const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener todos los productos del dueño
router.get('/', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.*, m.nombre_marca 
            FROM Producto p 
            JOIN Marca m ON p.id_marca = m.id_marca 
            WHERE p.id_dueno = ?
            ORDER BY p.nombre
        `, [req.usuario.id_dueno]);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener productos' });
    }
});

// Obtener un producto específico
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.*, m.nombre_marca 
            FROM Producto p 
            JOIN Marca m ON p.id_marca = m.id_marca 
            WHERE p.id_producto = ? AND p.id_dueno = ?
        `, [req.params.id, req.usuario.id_dueno]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ success: false, message: 'Error al obtener producto' });
    }
});

// Crear nuevo producto
router.post('/', verificarToken, async (req, res) => {
    const { nombre, precio, cantidad_disponible, fecha_caducidad, id_marca } = req.body;
    
    // Validaciones
    if (!nombre || !precio || !id_marca) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nombre, precio y marca son obligatorios' 
        });
    }
    
    // Validar que cantidad sea un número positivo
    if (cantidad_disponible && (isNaN(cantidad_disponible) || cantidad_disponible < 0)) {
        return res.status(400).json({ 
            success: false, 
            message: 'La cantidad debe ser un número positivo' 
        });
    }
    
    // Validar que precio sea un número positivo
    if (isNaN(precio) || precio < 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'El precio debe ser un número positivo' 
        });
    }
    
    try {
        // Verificar si ya existe un producto con el mismo nombre, precio y marca
        const [existing] = await pool.execute(`
            SELECT id_producto, cantidad_disponible 
            FROM Producto 
            WHERE nombre = ? AND precio = ? AND id_marca = ? AND id_dueno = ?
        `, [nombre, precio, id_marca, req.usuario.id_dueno]);
        
        if (existing.length > 0) {
            // Sumar al stock existente
            const nuevaCantidad = existing[0].cantidad_disponible + (cantidad_disponible || 0);
            await pool.execute(`
                UPDATE Producto 
                SET cantidad_disponible = ? 
                WHERE id_producto = ?
            `, [nuevaCantidad, existing[0].id_producto]);
            
            return res.json({ 
                success: true, 
                message: 'Producto duplicado. Stock sumado al producto existente.',
                data: { id_producto: existing[0].id_producto, cantidad_actualizada: nuevaCantidad }
            });
        }
        
        // Crear nuevo producto
        const [result] = await pool.execute(`
            INSERT INTO Producto (nombre, precio, cantidad_disponible, fecha_caducidad, id_marca, id_dueno)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [nombre, precio, cantidad_disponible || 0, fecha_caducidad, id_marca, req.usuario.id_dueno]);
        
        res.json({ 
            success: true, 
            message: 'Producto creado exitosamente',
            data: { id_producto: result.insertId }
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ success: false, message: 'Error al crear producto' });
    }
});

// Actualizar producto
router.put('/:id', verificarToken, async (req, res) => {
    const { nombre, precio, cantidad_disponible, fecha_caducidad, id_marca } = req.body;
    
    // Validaciones
    if (cantidad_disponible && (isNaN(cantidad_disponible) || cantidad_disponible < 0)) {
        return res.status(400).json({ 
            success: false, 
            message: 'La cantidad debe ser un número positivo' 
        });
    }
    
    if (precio && (isNaN(precio) || precio < 0)) {
        return res.status(400).json({ 
            success: false, 
            message: 'El precio debe ser un número positivo' 
        });
    }
    
    try {
        const [result] = await pool.execute(`
            UPDATE Producto 
            SET nombre = ?, precio = ?, cantidad_disponible = ?, fecha_caducidad = ?, id_marca = ?
            WHERE id_producto = ? AND id_dueno = ?
        `, [nombre, precio, cantidad_disponible, fecha_caducidad, id_marca, req.params.id, req.usuario.id_dueno]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        res.json({ success: true, message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar producto' });
    }
});

// Eliminar producto
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const [result] = await pool.execute(`
            DELETE FROM Producto 
            WHERE id_producto = ? AND id_dueno = ?
        `, [req.params.id, req.usuario.id_dueno]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        
        res.json({ success: true, message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar producto' });
    }
});

// Buscar productos
router.get('/buscar/:termino', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.*, m.nombre_marca 
            FROM Producto p 
            JOIN Marca m ON p.id_marca = m.id_marca 
            WHERE p.id_dueno = ? AND (p.nombre LIKE ? OR m.nombre_marca LIKE ?)
            ORDER BY p.nombre
        `, [req.usuario.id_dueno, `%${req.params.termino}%`, `%${req.params.termino}%`]);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).json({ success: false, message: 'Error al buscar productos' });
    }
});

module.exports = router; 