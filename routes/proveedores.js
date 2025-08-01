const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener todos los proveedores del dueño
router.get('/', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id_proveedor, nombre, telefono, productos_distribuye, frecuencia
            FROM Proveedor 
            WHERE id_dueno = ?
            ORDER BY nombre
        `, [req.usuario.id_dueno]);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ success: false, message: 'Error al obtener proveedores' });
    }
});

// Obtener un proveedor específico
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id_proveedor, nombre, telefono, productos_distribuye, frecuencia
            FROM Proveedor 
            WHERE id_proveedor = ? AND id_dueno = ?
        `, [req.params.id, req.usuario.id_dueno]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error al obtener proveedor:', error);
        res.status(500).json({ success: false, message: 'Error al obtener proveedor' });
    }
});

// Crear nuevo proveedor
router.post('/', verificarToken, async (req, res) => {
    const { nombre, telefono, productos_distribuye, frecuencia } = req.body;
    
    // Validaciones
    if (!nombre) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nombre es obligatorio' 
        });
    }
    
    // Validar teléfono (solo números)
    if (telefono && !/^\d+$/.test(telefono)) {
        return res.status(400).json({ 
            success: false, 
            message: 'El teléfono solo debe contener números' 
        });
    }
    
    try {
        const [result] = await pool.execute(`
            INSERT INTO Proveedor (nombre, telefono, productos_distribuye, frecuencia, id_dueno)
            VALUES (?, ?, ?, ?, ?)
        `, [nombre, telefono, productos_distribuye, frecuencia, req.usuario.id_dueno]);
        
        res.json({ 
            success: true, 
            message: 'Proveedor creado exitosamente',
            data: { id_proveedor: result.insertId }
        });
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({ success: false, message: 'Error al crear proveedor' });
    }
});

// Actualizar proveedor
router.put('/:id', verificarToken, async (req, res) => {
    const { nombre, telefono, productos_distribuye, frecuencia } = req.body;
    
    // Validaciones
    if (!nombre) {
        return res.status(400).json({ 
            success: false, 
            message: 'El nombre es obligatorio' 
        });
    }
    
    // Validar que el teléfono solo contenga números
    if (telefono && !/^\d+$/.test(telefono)) {
        return res.status(400).json({ 
            success: false, 
            message: 'El teléfono solo debe contener números' 
        });
    }
    
    try {
        const [result] = await pool.execute(`
            UPDATE Proveedor 
            SET nombre = ?, telefono = ?, productos_distribuye = ?, frecuencia = ?
            WHERE id_proveedor = ?
        `, [nombre, telefono, productos_distribuye, frecuencia, req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
        }
        
        res.json({ success: true, message: 'Proveedor actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar proveedor' });
    }
});

// Eliminar proveedor
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        // Verificar si el proveedor tiene pedidos asociados
        const [pedidos] = await pool.execute(`
            SELECT COUNT(*) as total
            FROM Pedido 
            WHERE id_proveedor = ?
        `, [req.params.id]);
        
        if (pedidos[0].total > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar el proveedor porque tiene pedidos asociados' 
            });
        }
        
        const [result] = await pool.execute(`
            DELETE FROM Proveedor 
            WHERE id_proveedor = ? AND id_dueño = ?
        `, [req.params.id, req.usuario.id_dueño]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
        }
        
        res.json({ success: true, message: 'Proveedor eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar proveedor' });
    }
});

// Buscar proveedores
router.get('/buscar/:termino', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id_proveedor, nombre, telefono, productos_distribuye, frecuencia
            FROM Proveedor 
            WHERE id_dueño = ? AND (nombre LIKE ? OR productos_distribuye LIKE ?)
            ORDER BY nombre
        `, [req.usuario.id_dueño, `%${req.params.termino}%`, `%${req.params.termino}%`]);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al buscar proveedores:', error);
        res.status(500).json({ success: false, message: 'Error al buscar proveedores' });
    }
});

module.exports = router; 