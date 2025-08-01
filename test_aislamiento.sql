-- SCRIPT PARA PROBAR AISLAMIENTO DE DATOS
-- =======================================

-- 1. Crear dos dueños diferentes
INSERT INTO Dueño (nombre, correo, password) VALUES 
('Dueño 1', 'dueno1@test.com', '$2a$10$hashedpassword1'),
('Dueño 2', 'dueno2@test.com', '$2a$10$hashedpassword2');

-- 2. Crear empleados para cada dueño
INSERT INTO Empleado (nombre, turno, direccion, telefono, fecha_contratacion, activo, id_dueño) VALUES 
('Empleado Dueño 1', 'Mañana', 'Dirección 1', '1234567890', CURDATE(), 1, 1),
('Empleado Dueño 2', 'Tarde', 'Dirección 2', '0987654321', CURDATE(), 1, 2);

-- 3. Crear productos para cada dueño
INSERT INTO Producto (nombre, precio, cantidad_disponible, id_marca, id_dueño) VALUES 
('Producto Dueño 1', 10.00, 5, 1, 1),
('Producto Dueño 2', 20.00, 3, 1, 2);

-- 4. Crear ventas para cada dueño
INSERT INTO Venta (id_producto, cantidad_vendida, precio_unitario, total, metodo_pago, monto_pagado, cambio, id_empleado, id_dueño) VALUES 
(1, 2, 10.00, 20.00, 'Efectivo', 25.00, 5.00, 1, 1),
(2, 1, 20.00, 20.00, 'Tarjeta', 20.00, 0.00, 2, 2);

-- 5. Verificar aislamiento - Mostrar datos por dueño
SELECT '=== DATOS DEL DUEÑO 1 ===' as separador;
SELECT 'Dueños:' as tipo, id_dueño, nombre, correo FROM Dueño WHERE id_dueño = 1;
SELECT 'Empleados:' as tipo, id_empleado, nombre, id_dueño FROM Empleado WHERE id_dueño = 1;
SELECT 'Productos:' as tipo, id_producto, nombre, precio, id_dueño FROM Producto WHERE id_dueño = 1;
SELECT 'Ventas:' as tipo, id_venta, total, id_dueño FROM Venta WHERE id_dueño = 1;

SELECT '=== DATOS DEL DUEÑO 2 ===' as separador;
SELECT 'Dueños:' as tipo, id_dueño, nombre, correo FROM Dueño WHERE id_dueño = 2;
SELECT 'Empleados:' as tipo, id_empleado, nombre, id_dueño FROM Empleado WHERE id_dueño = 2;
SELECT 'Productos:' as tipo, id_producto, nombre, precio, id_dueño FROM Producto WHERE id_dueño = 2;
SELECT 'Ventas:' as tipo, id_venta, total, id_dueño FROM Venta WHERE id_dueño = 2;

-- 6. Verificar que no hay mezcla de datos
SELECT '=== VERIFICACIÓN DE AISLAMIENTO ===' as separador;
SELECT 'Total dueños:' as tipo, COUNT(*) as cantidad FROM Dueño;
SELECT 'Total empleados:' as tipo, COUNT(*) as cantidad FROM Empleado;
SELECT 'Total productos:' as tipo, COUNT(*) as cantidad FROM Producto;
SELECT 'Total ventas:' as tipo, COUNT(*) as cantidad FROM Venta; 