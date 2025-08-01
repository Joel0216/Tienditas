-- ================================================
-- RECREAR PROCEDIMIENTOS ALMACENADOS
-- ================================================

USE railway;

-- ====================================
-- ELIMINAR PROCEDIMIENTOS EXISTENTES
-- ====================================

DROP PROCEDURE IF EXISTS sp_estadisticas_ventas_hoy;
DROP PROCEDURE IF EXISTS sp_ventas_por_metodo_hoy;
DROP PROCEDURE IF EXISTS sp_productos_mas_vendidos_hoy;
DROP PROCEDURE IF EXISTS sp_obtener_ventas_dueno;
DROP PROCEDURE IF EXISTS sp_registrar_venta;
DROP PROCEDURE IF EXISTS sp_dashboard_dueno;

-- ====================================
-- CREAR PROCEDIMIENTOS ALMACENADOS
-- ====================================

DELIMITER $$

-- Procedimiento: Obtener Estadísticas de Ventas de Hoy
CREATE PROCEDURE sp_estadisticas_ventas_hoy(IN p_id_dueno INT)
BEGIN
    DECLARE v_total_ventas INT DEFAULT 0;
    DECLARE v_ingresos_totales DECIMAL(10,2) DEFAULT 0;
    DECLARE v_promedio_venta DECIMAL(10,2) DEFAULT 0;
    
    -- Obtener estadísticas generales de hoy
    SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as ingresos_totales,
        COALESCE(AVG(total), 0) as promedio_venta
    INTO v_total_ventas, v_ingresos_totales, v_promedio_venta
    FROM Venta 
    WHERE id_dueno = p_id_dueno 
    AND DATE(fecha_venta) = CURDATE();
    
    -- Retornar resultados
    SELECT 
        v_total_ventas as total_ventas,
        v_ingresos_totales as ingresos_totales,
        v_promedio_venta as promedio_venta;
END$$

-- Procedimiento: Obtener Ventas por Método de Pago de Hoy
CREATE PROCEDURE sp_ventas_por_metodo_hoy(IN p_id_dueno INT)
BEGIN
    SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        SUM(total) as total_metodo
    FROM Venta 
    WHERE id_dueno = p_id_dueno 
    AND DATE(fecha_venta) = CURDATE()
    GROUP BY metodo_pago
    ORDER BY cantidad DESC;
END$$

-- Procedimiento: Obtener Productos Más Vendidos de Hoy
CREATE PROCEDURE sp_productos_mas_vendidos_hoy(IN p_id_dueno INT, IN p_limite INT)
BEGIN
    SELECT 
        p.nombre,
        SUM(v.cantidad_vendida) as total_vendido,
        SUM(v.total) as ingresos_producto
    FROM Venta v
    JOIN Producto p ON v.id_producto = p.id_producto
    WHERE v.id_dueno = p_id_dueno 
    AND DATE(v.fecha_venta) = CURDATE()
    GROUP BY p.id_producto, p.nombre
    ORDER BY total_vendido DESC
    LIMIT p_limite;
END$$

-- Procedimiento: Obtener Todas las Ventas del Dueño
CREATE PROCEDURE sp_obtener_ventas_dueno(IN p_id_dueno INT)
BEGIN
    SELECT 
        v.id_venta,
        v.fecha_venta,
        p.nombre as nombre_producto,
        v.cantidad_vendida,
        v.precio_unitario,
        v.total,
        v.metodo_pago,
        v.monto_pagado,
        v.cambio,
        e.nombre as nombre_empleado
    FROM Venta v
    JOIN Producto p ON v.id_producto = p.id_producto
    JOIN Empleado e ON v.id_empleado = e.id_empleado
    WHERE v.id_dueno = p_id_dueno
    ORDER BY v.fecha_venta DESC;
END$$

-- Procedimiento: Registrar Nueva Venta
CREATE PROCEDURE sp_registrar_venta(
    IN p_id_producto INT,
    IN p_cantidad_vendida INT,
    IN p_precio_unitario DECIMAL(10,2),
    IN p_total DECIMAL(10,2),
    IN p_metodo_pago VARCHAR(20),
    IN p_monto_pagado DECIMAL(10,2),
    IN p_id_empleado INT,
    IN p_id_dueno INT,
    OUT p_id_venta INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insertar la venta
    INSERT INTO Venta (
        id_producto, cantidad_vendida, precio_unitario, 
        total, metodo_pago, monto_pagado, id_empleado, id_dueno
    ) VALUES (
        p_id_producto, p_cantidad_vendida, p_precio_unitario,
        p_total, p_metodo_pago, p_monto_pagado, p_id_empleado, p_id_dueno
    );
    
    SET p_id_venta = LAST_INSERT_ID();
    
    COMMIT;
END$$

-- Procedimiento: Dashboard del Dueño
CREATE PROCEDURE sp_dashboard_dueno(IN p_id_dueno INT)
BEGIN
    DECLARE v_total_productos INT DEFAULT 0;
    DECLARE v_total_empleados INT DEFAULT 0;
    DECLARE v_ventas_hoy INT DEFAULT 0;
    DECLARE v_ingresos_hoy DECIMAL(10,2) DEFAULT 0;
    
    -- Contar productos
    SELECT COUNT(*) INTO v_total_productos
    FROM Producto WHERE id_dueno = p_id_dueno;
    
    -- Contar empleados activos
    SELECT COUNT(*) INTO v_total_empleados
    FROM Empleado WHERE id_dueno = p_id_dueno AND activo = 1;
    
    -- Ventas de hoy
    SELECT 
        COUNT(*),
        COALESCE(SUM(total), 0)
    INTO v_ventas_hoy, v_ingresos_hoy
    FROM Venta 
    WHERE id_dueno = p_id_dueno 
    AND DATE(fecha_venta) = CURDATE();
    
    -- Retornar resultados
    SELECT 
        v_total_productos as total_productos,
        v_total_empleados as total_empleados,
        v_ventas_hoy as ventas_hoy,
        v_ingresos_hoy as ingresos_hoy;
END$$

DELIMITER ;

-- ====================================
-- MENSAJE DE ÉXITO
-- ====================================

SELECT 'Procedimientos almacenados recreados exitosamente' as mensaje; 