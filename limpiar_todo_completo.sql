-- SCRIPT COMPLETO PARA LIMPIAR TODO
-- ==================================

-- Seleccionar base de datos
USE railway;

-- ====================================
-- LIMPIEZA COMPLETA
-- ====================================

-- Desactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS tr_descuento_inventario;
DROP TRIGGER IF EXISTS tr_incremento_inventario;
DROP TRIGGER IF EXISTS tr_validar_stock;
DROP TRIGGER IF EXISTS tr_sumar_stock_producto_duplicado;
DROP TRIGGER IF EXISTS tr_generar_token_empleado;
DROP TRIGGER IF EXISTS tr_calcular_total_cambio;

-- Eliminar tablas existentes
DROP TABLE IF EXISTS Venta;
DROP TABLE IF EXISTS Empleado;
DROP TABLE IF EXISTS Producto;
DROP TABLE IF EXISTS Proveedor;
DROP TABLE IF EXISTS Dueño;
DROP TABLE IF EXISTS Marca;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ====================================
-- VERIFICACIÓN DE LIMPIEZA
-- ====================================

-- Verificar que no hay tablas
SHOW TABLES;

-- Mensaje de confirmación
SELECT 'Limpieza completada. Todas las tablas han sido eliminadas.' as mensaje; 