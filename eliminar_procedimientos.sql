-- ================================================
-- ELIMINAR PROCEDIMIENTOS ALMACENADOS EXISTENTES
-- ================================================

USE railway;

-- Eliminar procedimientos almacenados existentes
DROP PROCEDURE IF EXISTS sp_estadisticas_ventas_hoy;
DROP PROCEDURE IF EXISTS sp_ventas_por_metodo_hoy;
DROP PROCEDURE IF EXISTS sp_productos_mas_vendidos_hoy;
DROP PROCEDURE IF EXISTS sp_obtener_ventas_dueno;
DROP PROCEDURE IF EXISTS sp_registrar_venta;
DROP PROCEDURE IF EXISTS sp_dashboard_dueno;

SELECT 'Procedimientos almacenados eliminados exitosamente' as mensaje; 