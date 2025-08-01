-- SCRIPT PARA LIMPIAR TODOS LOS DATOS REGISTRADOS
-- ================================================

-- Desactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar todas las tablas
DELETE FROM Venta;
DELETE FROM Empleado;
DELETE FROM Producto;
DELETE FROM Proveedor;
DELETE FROM Dueño;

-- Reiniciar los auto-increment
ALTER TABLE Venta AUTO_INCREMENT = 1;
ALTER TABLE Empleado AUTO_INCREMENT = 1;
ALTER TABLE Producto AUTO_INCREMENT = 1;
ALTER TABLE Proveedor AUTO_INCREMENT = 1;
ALTER TABLE Dueño AUTO_INCREMENT = 1;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Verificar que las tablas estén vacías
SELECT 'Venta' as tabla, COUNT(*) as registros FROM Venta
UNION ALL
SELECT 'Empleado' as tabla, COUNT(*) as registros FROM Empleado
UNION ALL
SELECT 'Producto' as tabla, COUNT(*) as registros FROM Producto
UNION ALL
SELECT 'Proveedor' as tabla, COUNT(*) as registros FROM Proveedor
UNION ALL
SELECT 'Dueño' as tabla, COUNT(*) as registros FROM Dueño;

-- Mensaje de confirmación
SELECT 'Datos limpiados exitosamente' as mensaje; 