const express = require('express');
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

// Obtener todos los pedidos
router.get('/', verifyToken, async (req, res) => {
  try {
    const [pedidos] = await pool.execute(
      `SELECT p.*, pr.nombre as nombre_proveedor
       FROM Pedido p
       LEFT JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
       ORDER BY p.fecha_pedido DESC`
    );

    res.json({
      success: true,
      data: pedidos
    });

  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos'
    });
  }
});

// Obtener un pedido específico con detalles
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener pedido
    const [pedidos] = await pool.execute(
      `SELECT p.*, pr.nombre as nombre_proveedor
       FROM Pedido p
       LEFT JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
       WHERE p.id_pedido = ?`,
      [id]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Obtener detalles del pedido
    const [detalles] = await pool.execute(
      `SELECT dp.*, p.nombre as nombre_producto, p.precio_costo
       FROM Detalles_Pedido dp
       JOIN Producto p ON dp.id_producto = p.id_producto
       WHERE dp.id_pedido = ?`,
      [id]
    );

    const pedido = pedidos[0];
    pedido.detalles = detalles;

    res.json({
      success: true,
      data: pedido
    });

  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedido'
    });
  }
});

// Crear nuevo pedido (solo dueños)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { tipo } = req.user;
    
    if (tipo !== 'dueno') {
      return res.status(403).json({
        success: false,
        message: 'Solo los dueños pueden crear pedidos'
      });
    }

    const { fecha_pedido, fecha_entrega, notas, estado, id_proveedor, productos } = req.body;

    // Validaciones
    if (!fecha_pedido || !id_proveedor) {
      return res.status(400).json({
        success: false,
        message: 'Fecha de pedido y proveedor son requeridos'
      });
    }

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Productos son requeridos'
      });
    }

    // Validar estado
    const estadosValidos = ['Pendiente', 'Recibido', 'Parcial', 'Cancelado'];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado debe ser: Pendiente, Recibido, Parcial o Cancelado'
      });
    }

    // Iniciar transacción
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Crear pedido
      const [pedidoResult] = await connection.execute(
        'INSERT INTO Pedido (fecha_pedido, fecha_entrega, notas, estado, id_proveedor) VALUES (?, ?, ?, ?, ?)',
        [fecha_pedido, fecha_entrega || null, notas || null, estado || 'Pendiente', id_proveedor]
      );

      const id_pedido = pedidoResult.insertId;

      // Crear detalles del pedido
      for (const producto of productos) {
        const { id_producto, cantidad_pedida, precio_compra } = producto;

        if (!id_producto || !cantidad_pedida || !precio_compra) {
          throw new Error('Todos los campos del producto son requeridos: id_producto, cantidad_pedida, precio_compra');
        }

        // Insertar detalle
        await connection.execute(
          'INSERT INTO Detalles_Pedido (id_pedido, id_producto, cantidad_pedida, precio_compra) VALUES (?, ?, ?, ?)',
          [id_pedido, id_producto, cantidad_pedida, precio_compra]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Pedido creado exitosamente',
        data: {
          id_pedido,
          fecha_pedido,
          estado: estado || 'Pendiente',
          productos: productos.length
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear pedido'
    });
  }
});

// Actualizar estado del pedido (solo dueños)
router.put('/:id/estado', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.user;
    const { estado, fecha_entrega } = req.body;
    
    if (tipo !== 'dueno') {
      return res.status(403).json({
        success: false,
        message: 'Solo los dueños pueden actualizar pedidos'
      });
    }

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'Estado es requerido'
      });
    }

    // Validar estado
    const estadosValidos = ['Pendiente', 'Recibido', 'Parcial', 'Cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado debe ser: Pendiente, Recibido, Parcial o Cancelado'
      });
    }

    const [result] = await pool.execute(
      'UPDATE Pedido SET estado = ?, fecha_entrega = ? WHERE id_pedido = ?',
      [estado, fecha_entrega || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Estado del pedido actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar pedido'
    });
  }
});

// Eliminar pedido (solo dueños)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.user;
    
    if (tipo !== 'dueno') {
      return res.status(403).json({
        success: false,
        message: 'Solo los dueños pueden eliminar pedidos'
      });
    }

    // Verificar que el pedido no esté recibido
    const [pedido] = await pool.execute(
      'SELECT estado FROM Pedido WHERE id_pedido = ?',
      [id]
    );

    if (pedido.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    if (pedido[0].estado === 'Recibido') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un pedido que ya fue recibido'
      });
    }

    const [result] = await pool.execute(
      'DELETE FROM Pedido WHERE id_pedido = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Pedido eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar pedido'
    });
  }
});

// Obtener reporte de pedidos por fecha
router.get('/reporte/fecha', verifyToken, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let query = `
      SELECT DATE(p.fecha_pedido) as fecha, 
             COUNT(*) as total_pedidos,
             SUM(CASE WHEN p.estado = 'Recibido' THEN 1 ELSE 0 END) as pedidos_recibidos
      FROM Pedido p
      WHERE 1=1
    `;

    const params = [];

    if (fecha_inicio && fecha_fin) {
      query += ' AND DATE(p.fecha_pedido) BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    query += ' GROUP BY DATE(p.fecha_pedido) ORDER BY fecha DESC';

    const [reporte] = await pool.execute(query, params);

    res.json({
      success: true,
      data: reporte
    });

  } catch (error) {
    console.error('Error obteniendo reporte de pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte de pedidos'
    });
  }
});

module.exports = router; 