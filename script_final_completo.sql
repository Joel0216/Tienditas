-- ====================================
-- SCRIPT FINAL COMPLETO - TIENDITAS
-- Sistema de Gestión de Tiendas
-- ====================================

USE railway;

-- ====================================
-- PASO 1: LIMPIEZA COMPLETA
-- ====================================

-- Desactivar verificación de foreign keys
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar vistas existentes
DROP VIEW IF EXISTS v_ventas_detalladas;
DROP VIEW IF EXISTS v_productos_stock_bajo;
DROP VIEW IF EXISTS v_empleados_activos;
DROP VIEW IF EXISTS v_estadisticas_ventas;
DROP VIEW IF EXISTS v_productos_mas_vendidos;

-- Eliminar procedimientos almacenados existentes
DROP PROCEDURE IF EXISTS sp_estadisticas_ventas_hoy;
DROP PROCEDURE IF EXISTS sp_ventas_por_metodo_hoy;
DROP PROCEDURE IF EXISTS sp_productos_mas_vendidos_hoy;
DROP PROCEDURE IF EXISTS sp_obtener_ventas_dueno;
DROP PROCEDURE IF EXISTS sp_registrar_venta;
DROP PROCEDURE IF EXISTS sp_dashboard_dueno;

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS tr_descuento_inventario;
DROP TRIGGER IF EXISTS tr_incremento_inventario;
DROP TRIGGER IF EXISTS tr_validar_stock;
DROP TRIGGER IF EXISTS tr_sumar_stock_producto_duplicado;
DROP TRIGGER IF EXISTS tr_generar_token_empleado;
DROP TRIGGER IF EXISTS tr_calcular_total_cambio;

-- Eliminar tablas existentes (en orden correcto)
DROP TABLE IF EXISTS Detalles_Pedido;
DROP TABLE IF EXISTS Pedido;
DROP TABLE IF EXISTS Proveedor_Producto;
DROP TABLE IF EXISTS Detalles_Venta;
DROP TABLE IF EXISTS Venta;
DROP TABLE IF EXISTS Empleado;
DROP TABLE IF EXISTS Producto;
DROP TABLE IF EXISTS Marca;
DROP TABLE IF EXISTS Proveedor;
DROP TABLE IF EXISTS Dueno;

-- Reactivar verificación de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Limpieza completada exitosamente' as mensaje;

-- ====================================
-- PASO 2: CREAR TABLAS
-- ====================================

-- TABLA: Dueno
CREATE TABLE Dueno (
    id_dueno INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Información de los dueños de tiendas';

-- TABLA: Marca
CREATE TABLE Marca (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre_marca VARCHAR(80) NOT NULL,
    id_dueno INT NOT NULL,
    UNIQUE KEY unique_marca_dueno (nombre_marca, id_dueno),
    FOREIGN KEY (id_dueno) REFERENCES Dueno(id_dueno) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Marcas de productos por dueño';

-- TABLA: Producto
CREATE TABLE Producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    cantidad_disponible INT DEFAULT 0 CHECK (cantidad_disponible >= 0),
    fecha_caducidad DATE,
    id_marca INT NOT NULL,
    id_dueno INT NOT NULL,
    UNIQUE KEY unique_producto (nombre, precio, id_marca, id_dueno),
    FOREIGN KEY (id_marca) REFERENCES Marca(id_marca) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_dueno) REFERENCES Dueno(id_dueno) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Catálogo de productos';

-- TABLA: Empleado
CREATE TABLE Empleado (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    turno ENUM('Mañana','Tarde','Noche') NOT NULL,
    direccion VARCHAR(150),
    telefono VARCHAR(20),
    token_acceso VARCHAR(255) UNIQUE,
    fecha_contratacion DATE NOT NULL,
    activo BOOLEAN DEFAULT 1,
    id_dueno INT NOT NULL,
    FOREIGN KEY (id_dueno) REFERENCES Dueno(id_dueno) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Información de empleados';

-- TABLA: Venta
CREATE TABLE Venta (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    cantidad_vendida INT NOT NULL CHECK (cantidad_vendida > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    metodo_pago ENUM('Efectivo','Tarjeta','Transferencia','Mixto') NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL CHECK (monto_pagado >= 0),
    cambio DECIMAL(10,2) DEFAULT 0,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_empleado INT NOT NULL,
    id_dueno INT NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_empleado) REFERENCES Empleado(id_empleado) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_dueno) REFERENCES Dueno(id_dueno) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Registro de ventas';

-- TABLA: Proveedor
CREATE TABLE Proveedor (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(20),
    productos_distribuye TEXT,
    frecuencia VARCHAR(100),
    id_dueno INT NOT NULL,
    FOREIGN KEY (id_dueno) REFERENCES Dueno(id_dueno) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Información de proveedores';

SELECT 'Tablas creadas exitosamente' as mensaje;

-- ====================================
-- PASO 3: CREAR ÍNDICES
-- ====================================

CREATE INDEX idx_producto_nombre ON Producto(nombre);
CREATE INDEX idx_venta_fecha ON Venta(fecha_venta);
CREATE INDEX idx_empleado_activo ON Empleado(activo);
CREATE INDEX idx_empleado_token ON Empleado(token_acceso);

SELECT 'Índices creados exitosamente' as mensaje;

-- ====================================
-- PASO 4: CREAR TRIGGERS
-- ====================================

DELIMITER $$

-- Trigger para descuento de inventario al vender
CREATE TRIGGER tr_descuento_inventario
BEFORE INSERT ON Venta
FOR EACH ROW
BEGIN
    DECLARE stock_actual INT;
    
    SELECT cantidad_disponible INTO stock_actual
    FROM Producto 
    WHERE id_producto = NEW.id_producto;
    
    IF stock_actual < NEW.cantidad_vendida THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para realizar la venta';
    END IF;
    
    UPDATE Producto 
    SET cantidad_disponible = cantidad_disponible - NEW.cantidad_vendida
    WHERE id_producto = NEW.id_producto;
END$$

-- Trigger para generar token de acceso automático
CREATE TRIGGER tr_generar_token_empleado
BEFORE INSERT ON Empleado
FOR EACH ROW
BEGIN
    IF NEW.token_acceso IS NULL OR NEW.token_acceso = '' THEN
        SET NEW.token_acceso = CONCAT('EMP_', NEW.id_dueno, '_', UNIX_TIMESTAMP(), '_', FLOOR(RAND() * 1000));
    END IF;
END$$

-- Trigger para calcular total y cambio
CREATE TRIGGER tr_calcular_total_cambio
BEFORE INSERT ON Venta
FOR EACH ROW
BEGIN
    IF NEW.total = 0 THEN
        SET NEW.total = NEW.cantidad_vendida * NEW.precio_unitario;
    END IF;
    
    SET NEW.cambio = NEW.monto_pagado - NEW.total;
    
    IF NEW.monto_pagado < NEW.total THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El monto pagado debe ser mayor o igual al total';
    END IF;
END$$

DELIMITER ;

SELECT 'Triggers creados exitosamente' as mensaje;

-- ====================================
-- PASO 5: CREAR PROCEDIMIENTOS ALMACENADOS
-- ====================================

DELIMITER $$

-- Procedimiento: Obtener Estadísticas de Ventas de Hoy
CREATE PROCEDURE sp_estadisticas_ventas_hoy(IN p_id_dueno INT)
BEGIN
    SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as ingresos_totales,
        COALESCE(AVG(total), 0) as promedio_venta
    FROM Venta 
    WHERE id_dueno = p_id_dueno 
    AND DATE(fecha_venta) = CURDATE();
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

DELIMITER ;

SELECT 'Procedimientos almacenados creados exitosamente' as mensaje;

-- ====================================
-- PASO 6: CREAR VISTAS
-- ====================================

-- Vista: Ventas Detalladas
CREATE VIEW v_ventas_detalladas AS
SELECT 
    v.id_venta,
    v.fecha_venta,
    p.nombre as nombre_producto,
    m.nombre_marca,
    v.cantidad_vendida,
    v.precio_unitario,
    v.total,
    v.metodo_pago,
    v.monto_pagado,
    v.cambio,
    e.nombre as nombre_empleado,
    d.nombre as nombre_dueno
FROM Venta v
JOIN Producto p ON v.id_producto = p.id_producto
JOIN Marca m ON p.id_marca = m.id_marca
JOIN Empleado e ON v.id_empleado = e.id_empleado
JOIN Dueno d ON v.id_dueno = d.id_dueno
ORDER BY v.fecha_venta DESC;

-- Vista: Productos con Stock Bajo
CREATE VIEW v_productos_stock_bajo AS
SELECT 
    p.id_producto,
    p.nombre,
    p.precio,
    p.cantidad_disponible,
    m.nombre_marca,
    d.nombre as nombre_dueno,
    CASE 
        WHEN p.cantidad_disponible = 0 THEN 'Sin stock'
        WHEN p.cantidad_disponible <= 5 THEN 'Stock bajo'
        ELSE 'Stock normal'
    END as estado_stock
FROM Producto p
JOIN Marca m ON p.id_marca = m.id_marca
JOIN Dueno d ON p.id_dueno = d.id_dueno
WHERE p.cantidad_disponible <= 10
ORDER BY p.cantidad_disponible ASC;

-- Vista: Empleados Activos
CREATE VIEW v_empleados_activos AS
SELECT 
    e.id_empleado,
    e.nombre,
    e.turno,
    e.direccion,
    e.telefono,
    e.fecha_contratacion,
    d.nombre as nombre_dueno,
    DATEDIFF(CURDATE(), e.fecha_contratacion) as dias_empleado
FROM Empleado e
JOIN Dueno d ON e.id_dueno = d.id_dueno
WHERE e.activo = 1
ORDER BY e.nombre;

-- Vista: Estadísticas de Ventas por Día
CREATE VIEW v_estadisticas_ventas AS
SELECT 
    DATE(v.fecha_venta) as fecha,
    COUNT(*) as total_ventas,
    SUM(v.total) as ingresos_totales,
    AVG(v.total) as promedio_venta,
    COUNT(DISTINCT v.id_empleado) as empleados_activos,
    COUNT(DISTINCT v.id_producto) as productos_vendidos
FROM Venta v
GROUP BY DATE(v.fecha_venta)
ORDER BY fecha DESC;

-- Vista: Productos Más Vendidos (Top 10)
CREATE VIEW v_productos_mas_vendidos AS
SELECT 
    p.nombre,
    m.nombre_marca,
    SUM(v.cantidad_vendida) as total_vendido,
    SUM(v.total) as ingresos_totales,
    AVG(v.precio_unitario) as precio_promedio,
    COUNT(*) as veces_vendido
FROM Venta v
JOIN Producto p ON v.id_producto = p.id_producto
JOIN Marca m ON p.id_marca = m.id_marca
GROUP BY p.id_producto, p.nombre, m.nombre_marca
ORDER BY total_vendido DESC
LIMIT 10;

SELECT 'Vistas creadas exitosamente' as mensaje;

-- ====================================
-- PASO 7: VERIFICACIÓN FINAL
-- ====================================

SELECT 'SCRIPT FINAL COMPLETADO EXITOSAMENTE' as mensaje;
SELECT 'Base de datos Tienditas recreada completamente' as estado;
SELECT 'Puedes ahora registrar nuevos dueños y usar la aplicación' as siguiente_paso; 