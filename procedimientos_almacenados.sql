-- ================================================
-- PROCEDIMIENTOS ALMACENADOS PARA TIENDITAS
-- ================================================

USE railway;

DELIMITER $$

-- ====================================
-- PROCEDIMIENTO: Obtener Estadísticas de Ventas de Hoy
-- ====================================
CREATE PROCEDURE sp_estadisticas_ventas_hoy(IN p_id_dueño INT)
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
    WHERE id_dueño = p_id_dueño 
    AND DATE(fecha_venta) = CURDATE();
    
    -- Retornar resultados
    SELECT 
        v_total_ventas as total_ventas,
        v_ingresos_totales as ingresos_totales,
        v_promedio_venta as promedio_venta;
END$$

-- ====================================
-- PROCEDIMIENTO: Obtener Ventas por Método de Pago de Hoy
-- ====================================
CREATE PROCEDURE sp_ventas_por_metodo_hoy(IN p_id_dueño INT)
BEGIN
    SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        SUM(total) as total_metodo
    FROM Venta 
    WHERE id_dueño = p_id_dueño 
    AND DATE(fecha_venta) = CURDATE()
    GROUP BY metodo_pago
    ORDER BY cantidad DESC;
END$$

-- ====================================
-- PROCEDIMIENTO: Obtener Productos Más Vendidos de Hoy
-- ====================================
CREATE PROCEDURE sp_productos_mas_vendidos_hoy(IN p_id_dueño INT, IN p_limite INT)
BEGIN
    SELECT 
        p.nombre,
        SUM(v.cantidad_vendida) as total_vendido,
        SUM(v.total) as ingresos_producto
    FROM Venta v
    JOIN Producto p ON v.id_producto = p.id_producto
    WHERE v.id_dueño = p_id_dueño 
    AND DATE(v.fecha_venta) = CURDATE()
    GROUP BY p.id_producto, p.nombre
    ORDER BY total_vendido DESC
    LIMIT p_limite;
END$$

-- ====================================
-- PROCEDIMIENTO: Obtener Todas las Ventas del Dueño
-- ====================================
CREATE PROCEDURE sp_obtener_ventas_dueno(IN p_id_dueño INT)
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
    WHERE v.id_dueño = p_id_dueño
    ORDER BY v.fecha_venta DESC;
END$$

-- ====================================
-- PROCEDIMIENTO: Registrar Nueva Venta
-- ====================================
CREATE PROCEDURE sp_registrar_venta(
    IN p_id_producto INT,
    IN p_cantidad_vendida INT,
    IN p_precio_unitario DECIMAL(10,2),
    IN p_total DECIMAL(10,2),
    IN p_metodo_pago VARCHAR(20),
    IN p_monto_pagado DECIMAL(10,2),
    IN p_cambio DECIMAL(10,2),
    IN p_id_empleado INT,
    IN p_id_dueño INT,
    OUT p_id_venta INT
)
BEGIN
    DECLARE v_stock_actual INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Verificar stock disponible
    SELECT cantidad_disponible INTO v_stock_actual
    FROM Producto 
    WHERE id_producto = p_id_producto;
    
    IF v_stock_actual < p_cantidad_vendida THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('Stock insuficiente. Disponible: ', v_stock_actual, ', Solicitado: ', p_cantidad_vendida);
    END IF;
    
    -- Insertar venta
    INSERT INTO Venta (
        id_producto, cantidad_vendida, precio_unitario, total,
        metodo_pago, monto_pagado, cambio, id_empleado, id_dueño
    ) VALUES (
        p_id_producto, p_cantidad_vendida, p_precio_unitario, p_total,
        p_metodo_pago, p_monto_pagado, p_cambio, p_id_empleado, p_id_dueño
    );
    
    SET p_id_venta = LAST_INSERT_ID();
    
    -- Actualizar stock (esto se hace automáticamente con el trigger)
    
    COMMIT;
END$$

-- ====================================
-- PROCEDIMIENTO: Obtener Dashboard del Dueño
-- ====================================
CREATE PROCEDURE sp_dashboard_dueno(IN p_id_dueño INT)
BEGIN
    DECLARE v_total_productos INT DEFAULT 0;
    DECLARE v_total_empleados INT DEFAULT 0;
    DECLARE v_ventas_hoy INT DEFAULT 0;
    DECLARE v_ingresos_hoy DECIMAL(10,2) DEFAULT 0;
    
    -- Contar productos
    SELECT COUNT(*) INTO v_total_productos
    FROM Producto 
    WHERE id_dueño = p_id_dueño;
    
    -- Contar empleados activos
    SELECT COUNT(*) INTO v_total_empleados
    FROM Empleado 
    WHERE id_dueño = p_id_dueño AND activo = 1;
    
    -- Contar ventas de hoy
    SELECT COUNT(*) INTO v_ventas_hoy
    FROM Venta 
    WHERE id_dueño = p_id_dueño 
    AND DATE(fecha_venta) = CURDATE();
    
    -- Sumar ingresos de hoy
    SELECT COALESCE(SUM(total), 0) INTO v_ingresos_hoy
    FROM Venta 
    WHERE id_dueño = p_id_dueño 
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
-- EJECUTAR PROCEDIMIENTOS DE PRUEBA
-- ====================================

-- Probar procedimiento de estadísticas (reemplaza 1 con el ID del dueño real)
-- CALL sp_estadisticas_ventas_hoy(1);

-- Probar procedimiento de dashboard (reemplaza 1 con el ID del dueño real)
-- CALL sp_dashboard_dueno(1);

SELECT '✅ Procedimientos almacenados creados exitosamente!' AS mensaje; 