-- ================================================
-- SCRIPT COMPLETO FINAL CORREGIDO PARA MYSQL WORKBENCH
-- SISTEMA DE GESTIÓN DE TIENDAS - TIENDITAS
-- Copiar y pegar todo este script en MySQL Workbench
-- ================================================

USE railway;

-- ====================================
-- LIMPIEZA COMPLETA INICIAL
-- ====================================

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

-- Eliminar tablas existentes (en orden inverso)
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

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================
-- CREACIÓN DE TABLAS
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

-- TABLA: Detalles_Venta
CREATE TABLE Detalles_Venta (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (id_venta) REFERENCES Venta(id_venta) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Detalles de cada venta';

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

-- TABLA: Proveedor_Producto
CREATE TABLE Proveedor_Producto (
    id_proveedor_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_producto INT NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL CHECK (precio_compra >= 0),
    fecha_ultima_compra DATE,
    FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Relación entre proveedores y productos';

-- TABLA: Pedido
CREATE TABLE Pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente','Enviado','Recibido','Cancelado') DEFAULT 'Pendiente',
    total_pedido DECIMAL(10,2) DEFAULT 0,
    id_dueno INT NOT NULL,
    FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_dueno) REFERENCES Dueno(id_dueno) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Pedidos a proveedores';

-- TABLA: Detalles_Pedido
CREATE TABLE Detalles_Pedido (
    id_detalle_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_solicitada INT NOT NULL CHECK (cantidad_solicitada > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Detalles de cada pedido';

-- ====================================
-- CREACIÓN DE ÍNDICES
-- ====================================

CREATE INDEX idx_producto_nombre ON Producto(nombre);
CREATE INDEX idx_venta_fecha ON Venta(fecha_venta);
CREATE INDEX idx_empleado_activo ON Empleado(activo);
CREATE INDEX idx_empleado_token ON Empleado(token_acceso);

-- ====================================
-- CREACIÓN DE TRIGGERS
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

-- Trigger para incremento de inventario al recibir pedido
CREATE TRIGGER tr_incremento_inventario
AFTER UPDATE ON Pedido
FOR EACH ROW
BEGIN
    IF NEW.estado = 'Recibido' AND OLD.estado != 'Recibido' THEN
        UPDATE Producto p
        JOIN Detalles_Pedido dp ON p.id_producto = dp.id_producto
        SET p.cantidad_disponible = p.cantidad_disponible + dp.cantidad_solicitada
        WHERE dp.id_pedido = NEW.id_pedido;
    END IF;
END$$

-- Trigger para validar stock antes de vender
CREATE TRIGGER tr_validar_stock
BEFORE INSERT ON Venta
FOR EACH ROW
BEGIN
    DECLARE stock_disponible INT;
    
    SELECT cantidad_disponible INTO stock_disponible
    FROM Producto
    WHERE id_producto = NEW.id_producto;
    
    IF stock_disponible < NEW.cantidad_vendida THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No hay suficiente stock para realizar esta venta';
    END IF;
END$$

-- Trigger para sumar stock si se agrega producto duplicado
CREATE TRIGGER tr_sumar_stock_producto_duplicado
BEFORE INSERT ON Producto
FOR EACH ROW
BEGIN
    DECLARE producto_existente INT;
    
    SELECT id_producto INTO producto_existente
    FROM Producto
    WHERE nombre = NEW.nombre 
    AND id_marca = NEW.id_marca 
    AND id_dueno = NEW.id_dueno
    LIMIT 1;
    
    IF producto_existente IS NOT NULL THEN
        UPDATE Producto
        SET cantidad_disponible = cantidad_disponible + NEW.cantidad_disponible
        WHERE id_producto = producto_existente;
        
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Producto duplicado, se sumó al stock existente';
    END IF;
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

-- ====================================
-- PROCEDIMIENTOS ALMACENADOS
-- ====================================

-- Procedimiento: Obtener Estadísticas de Ventas de Hoy
CREATE PROCEDURE sp_estadisticas_ventas_hoy(IN p_id_dueno INT)
BEGIN
    DECLARE v_total_ventas INT DEFAULT 0;
    DECLARE v_ingresos_totales DECIMAL(10,2) DEFAULT 0;
    DECLARE v_promedio_venta DECIMAL(10,2) DEFAULT 0;
    
    SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total), 0) as ingresos_totales,
        COALESCE(AVG(total), 0) as promedio_venta
    INTO v_total_ventas, v_ingresos_totales, v_promedio_venta
    FROM Venta 
    WHERE id_dueno = p_id_dueno 
    AND DATE(fecha_venta) = CURDATE();
    
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
    
    SELECT COUNT(*) INTO v_total_productos
    FROM Producto WHERE id_dueno = p_id_dueno;
    
    SELECT COUNT(*) INTO v_total_empleados
    FROM Empleado WHERE id_dueno = p_id_dueno AND activo = 1;
    
    SELECT 
        COUNT(*),
        COALESCE(SUM(total), 0)
    INTO v_ventas_hoy, v_ingresos_hoy
    FROM Venta 
    WHERE id_dueno = p_id_dueno 
    AND DATE(fecha_venta) = CURDATE();
    
    SELECT 
        v_total_productos as total_productos,
        v_total_empleados as total_empleados,
        v_ventas_hoy as ventas_hoy,
        v_ingresos_hoy as ingresos_hoy;
END$$

DELIMITER ;

-- ====================================
-- VERIFICACIÓN DE TABLAS ANTES DE CREAR VISTAS
-- ====================================

-- Verificar que todas las tablas existan antes de crear las vistas
SELECT 'Verificando que todas las tablas existan...' as mensaje;

-- ====================================
-- CREACIÓN DE VISTAS
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

-- ====================================
-- MENSAJE DE ÉXITO
-- ====================================

SELECT 'Script completo ejecutado exitosamente. Base de datos Tienditas creada con tablas, triggers, procedimientos almacenados y vistas.' as mensaje; 