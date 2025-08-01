const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener todas las marcas del dueño
router.get('/', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM Marca WHERE id_dueno = ? ORDER BY nombre_marca',
            [req.usuario.id_dueno]
        );
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener marcas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener marcas' });
    }
});

// Obtener una marca específica
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM Marca WHERE id_marca = ? AND id_dueno = ?',
            [req.params.id, req.usuario.id_dueno]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Marca no encontrada' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error al obtener marca:', error);
        res.status(500).json({ success: false, message: 'Error al obtener marca' });
    }
});

// Crear nueva marca
router.post('/', verificarToken, async (req, res) => {
    const { nombre_marca } = req.body;
    
    if (!nombre_marca) {
        return res.status(400).json({ 
            success: false, 
            message: 'El nombre de la marca es obligatorio' 
        });
    }
    
    try {
        const [result] = await pool.execute(
            'INSERT INTO Marca (nombre_marca, id_dueno) VALUES (?, ?)',
            [nombre_marca, req.usuario.id_dueno]
        );
        
        res.json({ 
            success: true, 
            message: 'Marca creada exitosamente',
            data: { id_marca: result.insertId }
        });
    } catch (error) {
        console.error('Error al crear marca:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Esta marca ya existe' });
        } else {
            res.status(500).json({ success: false, message: 'Error al crear marca' });
        }
    }
});

// Actualizar marca
router.put('/:id', verificarToken, async (req, res) => {
    const { nombre_marca } = req.body;
    
    if (!nombre_marca) {
        return res.status(400).json({ 
            success: false, 
            message: 'El nombre de la marca es obligatorio' 
        });
    }
    
    try {
        const [result] = await pool.execute(
            'UPDATE Marca SET nombre_marca = ? WHERE id_marca = ? AND id_dueno = ?',
            [nombre_marca, req.params.id, req.usuario.id_dueno]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Marca no encontrada' });
        }
        
        res.json({ success: true, message: 'Marca actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar marca:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Esta marca ya existe' });
        } else {
            res.status(500).json({ success: false, message: 'Error al actualizar marca' });
        }
    }
});

// Eliminar marca
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        // Verificar si la marca está siendo usada por algún producto
        const [productos] = await pool.execute(
            'SELECT COUNT(*) as count FROM Producto WHERE id_marca = ? AND id_dueno = ?',
            [req.params.id, req.usuario.id_dueno]
        );
        
        if (productos[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar la marca porque está siendo usada por productos' 
            });
        }
        
        const [result] = await pool.execute(
            'DELETE FROM Marca WHERE id_marca = ? AND id_dueno = ?',
            [req.params.id, req.usuario.id_dueno]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Marca no encontrada' });
        }
        
        res.json({ success: true, message: 'Marca eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar marca:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar marca' });
    }
});

module.exports = router; 