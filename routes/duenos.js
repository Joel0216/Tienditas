const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const router = express.Router();

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Obtener perfil del dueño
router.get('/perfil', verifyToken, async (req, res) => {
  try {
    const { id_dueno, tipo } = req.user;

    if (tipo !== 'dueno') {
      return res.status(403).json({
        success: false,
        message: 'Solo los dueños pueden acceder a esta información'
      });
    }

    const [duenos] = await pool.execute(
      'SELECT id_dueno, nombre, correo, fecha_registro FROM Dueno WHERE id_dueno = ?',
      [id_dueno]
    );

    if (duenos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dueno no encontrado'
      });
    }

    res.json({
      success: true,
      data: duenos[0]
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
});

// Actualizar perfil del dueño
router.put('/perfil', verifyToken, async (req, res) => {
  try {
    const { id_dueno, tipo } = req.user;
    
    if (tipo !== 'dueno') {
      return res.status(403).json({
        success: false,
        message: 'Solo los dueños pueden actualizar su perfil'
      });
    }

    const { nombre, correo } = req.body;

    // Verificar si el correo ya existe (excluyendo el dueño actual)
    if (correo) {
      const [existingUser] = await pool.execute(
        'SELECT id_dueno FROM Dueno WHERE correo = ? AND id_dueno != ?',
        [correo, id_dueno]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El correo ya está registrado'
        });
      }
    }

    await pool.execute(
      'UPDATE Dueno SET nombre = ?, correo = ? WHERE id_dueno = ?',
      [nombre, correo, id_dueno]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
});

// Cambiar contraseña del dueño
router.put('/cambiar-password', verifyToken, async (req, res) => {
  try {
    const { id_dueno, tipo } = req.user;
    const { password_actual, password_nuevo } = req.body;
    
    if (tipo !== 'dueno') {
      return res.status(403).json({
        success: false,
        message: 'Solo los dueños pueden cambiar su contraseña'
      });
    }

    if (!password_actual || !password_nuevo) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }

    // Obtener contraseña actual
    const [duenos] = await pool.execute(
      'SELECT password FROM Dueno WHERE id_dueno = ?',
      [id_dueno]
    );

    if (duenos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dueno no encontrado'
      });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(password_actual, duenos[0].password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(password_nuevo, 10);

    await pool.execute(
      'UPDATE Dueno SET password = ? WHERE id_dueno = ?',
      [hashedPassword, id_dueno]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña'
    });
  }
});

// Obtener dashboard del dueño
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const { id_dueno, tipo } = req.user;

    if (tipo !== 'dueno') {
      return res.status(403).json({
        success: false,
        message: 'Solo los dueños pueden acceder al dashboard'
      });
    }

    // Estadísticas generales
    const [totalProductos] = await pool.execute(
      'SELECT COUNT(*) as total FROM Producto WHERE id_dueno = ?',
      [id_dueno]
    );

    const [totalEmpleados] = await pool.execute(
      'SELECT COUNT(*) as total FROM Empleado WHERE id_dueno = ?',
      [id_dueno]
    );

    const [totalVentas] = await pool.execute(
      'SELECT COUNT(*) as total, SUM(total) as ingresos FROM Venta WHERE id_dueno = ?',
      [id_dueno]
    );

    const [ventasHoy] = await pool.execute(
      'SELECT COUNT(*) as total, SUM(total) as ingresos FROM Venta WHERE id_dueno = ? AND DATE(fecha_venta) = CURDATE()',
      [id_dueno]
    );

    const [productosBajoStock] = await pool.execute(
      'SELECT COUNT(*) as total FROM Producto WHERE id_dueno = ? AND stock <= 10',
      [id_dueno]
    );

    // Últimas ventas
    const [ultimasVentas] = await pool.execute(
      `SELECT v.*, e.nombre as nombre_empleado, e.apellido as apellido_empleado
       FROM Venta v
       LEFT JOIN Empleado e ON v.id_empleado = e.id_empleado
       WHERE v.id_dueno = ?
       ORDER BY v.fecha_venta DESC
       LIMIT 5`,
      [id_dueno]
    );

    // Productos más vendidos
    const [productosPopulares] = await pool.execute(
      `SELECT p.nombre, SUM(dv.cantidad) as total_vendido
       FROM Detalles_Venta dv
       JOIN Producto p ON dv.id_producto = p.id_producto
       JOIN Venta v ON dv.id_venta = v.id_venta
       WHERE v.id_dueno = ?
       GROUP BY p.id_producto, p.nombre
       ORDER BY total_vendido DESC
       LIMIT 5`,
      [id_dueno]
    );

    res.json({
      success: true,
      data: {
        estadisticas: {
          totalProductos: totalProductos[0].total || 0,
          totalEmpleados: totalEmpleados[0].total || 0,
          totalVentas: totalVentas[0].total || 0,
          totalIngresos: totalVentas[0].ingresos || 0,
          ventasHoy: ventasHoy[0].total || 0,
          ingresosHoy: ventasHoy[0].ingresos || 0,
          productosBajoStock: productosBajoStock[0].total || 0
        },
        ultimasVentas,
        productosPopulares
      }
    });

  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener dashboard'
    });
  }
});

module.exports = router; 