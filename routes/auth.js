const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const router = express.Router();

// Registrar Dueño
router.post('/registrar-dueno', async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    console.log('Datos recibidos:', { nombre, correo, password: password ? '***' : 'undefined' });

    // Validaciones
    if (!nombre || !correo || !password) {
      console.log('Validación fallida:', { nombre: !!nombre, correo: !!correo, password: !!password });
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Verificar si el correo ya existe
    const [existingUser] = await pool.execute(
      'SELECT id_dueno, nombre FROM Dueno WHERE correo = ?',
      [correo]
    );

    console.log('Usuarios existentes con este correo:', existingUser.length);
    if (existingUser.length > 0) {
      console.log('Correo duplicado:', { correo, usuario_existente: existingUser[0] });
      return res.status(400).json({
        success: false,
        message: `El correo ${correo} ya está registrado`
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo dueño
            const [result] = await pool.execute(
            'INSERT INTO Dueno (nombre, correo, password) VALUES (?, ?, ?)',
            [nombre, correo, hashedPassword]
        );

    const id_dueno = result.insertId;

    // Generar token
    const token = jwt.sign(
      { id_dueno: id_dueno, tipo: 'dueno', nombre },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Dueño registrado exitosamente:', { id_dueno, nombre, correo });

    res.status(201).json({
      success: true,
      message: 'Dueño registrado exitosamente',
      data: {
        id_dueno,
        nombre,
        correo,
        token
      }
    });

  } catch (error) {
    console.error('Error registrando dueño:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar dueño'
    });
  }
});

// Iniciar sesión Dueño
router.post('/login-dueno', async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Validaciones
    if (!correo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos'
      });
    }

    // Buscar dueño
    const [duenos] = await pool.execute(
      'SELECT id_dueno, nombre, correo, password FROM Dueno WHERE correo = ?',
      [correo]
    );

    if (duenos.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const dueno = duenos[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, dueno.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = jwt.sign(
      { id_dueno: dueno.id_dueno, tipo: 'dueno', nombre: dueno.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        id_dueno: dueno.id_dueno,
        nombre: dueno.nombre,
        correo: dueno.correo,
        token
      }
    });

  } catch (error) {
    console.error('Error en login de dueño:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
});

// Iniciar sesión Empleado
router.post('/login-empleado', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar empleado - Nota: Los empleados no tienen email/password en la nueva estructura
    // Por ahora, vamos a buscar por nombre y verificar que esté activo
    const [empleados] = await pool.execute(
      `SELECT e.id_empleado, e.nombre, e.id_dueno, d.nombre as nombre_dueno 
       FROM Empleado e 
       JOIN Dueno d ON e.id_dueno = d.id_dueno 
       WHERE e.nombre = ? AND e.activo = 1`,
      [email] // Usamos email como nombre temporalmente
    );

    if (empleados.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Empleado no encontrado o inactivo'
      });
    }

    const empleado = empleados[0];

    // En la nueva estructura, los empleados no tienen contraseñas
    // Por ahora, permitimos el acceso sin verificación de contraseña
    // En un entorno real, se debería implementar un sistema de autenticación para empleados

    // Generar token
    const token = jwt.sign(
      { 
        id_empleado: empleado.id_empleado, 
        id_dueno: empleado.id_dueno,
        tipo: 'empleado', 
        nombre: empleado.nombre,
        nombre_dueno: empleado.nombre_dueno
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        id_empleado: empleado.id_empleado,
        nombre: empleado.nombre,
        id_dueno: empleado.id_dueno,
        nombre_dueno: empleado.nombre_dueno,
        token
      }
    });

  } catch (error) {
    console.error('Error en login de empleado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      success: true,
      data: decoded
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

module.exports = router; 