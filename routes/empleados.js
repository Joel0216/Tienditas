const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Obtener todos los empleados del dueño
router.get('/', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id_empleado, nombre, turno, direccion, telefono, token_acceso, 
                   fecha_contratacion, activo
            FROM Empleado 
            WHERE id_dueno = ?
            ORDER BY nombre
        `, [req.usuario.id_dueno]);
        
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        res.status(500).json({ success: false, message: 'Error al obtener empleados' });
    }
});

// Obtener un empleado específico
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id_empleado, nombre, turno, direccion, telefono, token_acceso, 
                   fecha_contratacion, activo
            FROM Empleado 
            WHERE id_empleado = ? AND id_dueno = ?
        `, [req.params.id, req.usuario.id_dueno]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error al obtener empleado:', error);
        res.status(500).json({ success: false, message: 'Error al obtener empleado' });
    }
});

// Crear nuevo empleado
router.post('/', verificarToken, async (req, res) => {
    const { nombre, turno, direccion, telefono } = req.body;
    
    // Validaciones
    if (!nombre || !turno) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nombre y turno son obligatorios' 
        });
    }
    
    // Validar turno
    const turnosValidos = ['Mañana', 'Tarde', 'Noche'];
    if (!turnosValidos.includes(turno)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Turno debe ser: Mañana, Tarde o Noche' 
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
        const fechaContratacion = new Date().toISOString().split('T')[0];
        
        const [result] = await pool.execute(`
            INSERT INTO Empleado (nombre, turno, direccion, telefono, fecha_contratacion, id_dueno)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [nombre, turno, direccion, telefono, fechaContratacion, req.usuario.id_dueno]);
        
        // Obtener el empleado creado con su token
        const [empleadoCreado] = await pool.execute(`
            SELECT id_empleado, nombre, turno, direccion, telefono, token_acceso, 
                   fecha_contratacion, activo
            FROM Empleado 
            WHERE id_empleado = ?
        `, [result.insertId]);
        
        res.json({ 
            success: true, 
            message: 'Empleado creado exitosamente',
            data: empleadoCreado[0]
        });
    } catch (error) {
        console.error('Error al crear empleado:', error);
        res.status(500).json({ success: false, message: 'Error al crear empleado' });
    }
});

// Actualizar empleado
router.put('/:id', verificarToken, async (req, res) => {
    const { nombre, turno, direccion, telefono } = req.body;
    
    // Validaciones
    if (!nombre || !turno) {
        return res.status(400).json({ 
            success: false, 
            message: 'Nombre y turno son obligatorios' 
        });
    }
    
    // Validar que el turno sea válido
    const turnosValidos = ['Mañana', 'Tarde', 'Noche'];
    if (!turnosValidos.includes(turno)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Turno no válido' 
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
            UPDATE Empleado 
            SET nombre = ?, turno = ?, direccion = ?, telefono = ?
            WHERE id_empleado = ? AND id_dueno = ?
        `, [nombre, turno, direccion, telefono, req.params.id, req.usuario.id_dueno]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }
        
        res.json({ success: true, message: 'Empleado actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar empleado' });
    }
});

// Eliminar empleado
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const [result] = await pool.execute(`
            DELETE FROM Empleado 
            WHERE id_empleado = ? AND id_dueno = ?
        `, [req.params.id, req.usuario.id_dueno]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }
        
        res.json({ success: true, message: 'Empleado eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
    }
});

// Cambiar estado del empleado (activo/inactivo)
router.put('/:id/estado', verificarToken, async (req, res) => {
    const { activo } = req.body;
    
    if (activo === undefined || ![0, 1].includes(activo)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Estado debe ser 0 (inactivo) o 1 (activo)' 
        });
    }
    
    try {
        const [result] = await pool.execute(`
            UPDATE Empleado 
            SET activo = ?
            WHERE id_empleado = ? AND id_dueno = ?
        `, [activo, req.params.id, req.usuario.id_dueno]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        }
        
        res.json({ success: true, message: 'Estado del empleado actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar estado del empleado:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar estado del empleado' });
    }
});

// Obtener empleado por token (para login)
router.get('/token/:token', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id_empleado, nombre, turno, direccion, telefono, token_acceso, 
                   fecha_contratacion, activo, id_dueno
            FROM Empleado 
            WHERE token_acceso = ? AND activo = 1
        `, [req.params.token]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Empleado no encontrado o inactivo' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error al obtener empleado por token:', error);
        res.status(500).json({ success: false, message: 'Error al obtener empleado' });
    }
});

module.exports = router; 