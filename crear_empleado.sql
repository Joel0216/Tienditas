-- SCRIPT PARA CREAR UN EMPLEADO DE PRUEBA
-- ========================================

-- Primero, asegurarse de que existe un dueño
INSERT INTO Dueño (nombre, correo, password) 
VALUES ('Joel Dueño', 'joel@tienda.com', '$2a$10$hashedpassword')
ON DUPLICATE KEY UPDATE id_dueño = id_dueño;

-- Obtener el ID del dueño
SET @id_dueno = (SELECT id_dueño FROM Dueño WHERE correo = 'joel@tienda.com' LIMIT 1);

-- Crear empleado de prueba
INSERT INTO Empleado (nombre, turno, direccion, telefono, fecha_contratacion, activo, id_dueño) 
VALUES ('Joel Empleado', 'Mañana', 'Dirección del empleado', '1234567890', CURDATE(), 1, @id_dueno);

-- Verificar que se creó correctamente
SELECT 
    e.id_empleado,
    e.nombre as nombre_empleado,
    e.token_acceso,
    d.nombre as nombre_dueno
FROM Empleado e
JOIN Dueño d ON e.id_dueño = d.id_dueño
WHERE e.nombre = 'Joel Empleado';

-- Mostrar el token para iniciar sesión
SELECT 
    'Para iniciar sesión como empleado, usa:' as instruccion,
    e.nombre as nombre_empleado,
    e.token_acceso as token
FROM Empleado e
WHERE e.nombre = 'Joel Empleado'; 