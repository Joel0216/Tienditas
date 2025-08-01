-- ================================================
-- SCRIPT MEJORADO PARA MYSQL WORKBENCH
-- SISTEMA DE GESTIÓN DE TIENDAS - TIENDITAS
-- ================================================

USE railway;

-- ====================================
-- LIMPIEZA INICIAL
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

-- Eliminar tablas existentes (en orden inverso)
DROP TABLE IF EXISTS Detalles_Pedido;
DROP TABLE IF EXISTS Pedido;
DROP TABLE IF EXISTS Proveedor_Producto;
DROP TABLE IF EXISTS Detalles_Venta;
DROP TABLE IF EXISTS Venta;
DROP TABLE IF EXISTS Empleado;
DROP TABLE IF EXISTS Producto;
DROP TABLE IF EXISTS Proveedor;
DROP TABLE IF EXISTS Marca;
DROP TABLE IF EXISTS Dueño;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ====================================
-- CREACIÓN DE TABLAS
-- ====================================

-- TABLA: Dueño
CREATE TABLE Dueño (
    id_dueño INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Información de los dueños de tiendas';

-- TABLA: Marca
CREATE TABLE Marca (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre_marca VARCHAR(80) NOT NULL,
    id_dueño INT NOT NULL,
    UNIQUE KEY unique_marca_dueno (nombre_marca, id_dueño),
    FOREIGN KEY (id_dueño) REFERENCES Dueño(id_dueño) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Marcas de productos por dueño';

-- TABLA: Producto
CREATE TABLE Producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    cantidad_disponible INT DEFAULT 0 CHECK (cantidad_disponible >= 0),
    fecha_caducidad DATE,
    id_marca INT NOT NULL,
    id_dueño INT NOT NULL,
    UNIQUE KEY unique_producto (nombre, precio, id_marca, id_dueño),
    FOREIGN KEY (id_marca) REFERENCES Marca(id_marca) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_dueño) REFERENCES Dueño(id_dueño) ON UPDATE CASCADE ON DELETE CASCADE
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
    id_dueño INT NOT NULL,
    FOREIGN KEY (id_dueño) REFERENCES Dueño(id_dueño) ON UPDATE CASCADE ON DELETE CASCADE
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
    id_dueño INT NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_empleado) REFERENCES Empleado(id_empleado) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_dueño) REFERENCES Dueño(id_dueño) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Registro de ventas realizadas';

-- TABLA: Detalles_Venta
CREATE TABLE Detalles_Venta (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_vendida INT NOT NULL CHECK (cantidad_vendida > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    FOREIGN KEY (id_venta) REFERENCES Venta(id_venta)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Productos asociados a cada venta';

-- TABLA: Proveedor
CREATE TABLE Proveedor (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(20),
    productos_distribuye TEXT,
    frecuencia VARCHAR(100),
    id_dueño INT NOT NULL,
    FOREIGN KEY (id_dueño) REFERENCES Dueño(id_dueño) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Información de proveedores';

-- TABLA: Proveedor_Producto (N:M)
CREATE TABLE Proveedor_Producto (
    id_proveedor INT NOT NULL,
    id_producto INT NOT NULL,
    PRIMARY KEY (id_proveedor, id_producto),
    FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Relación muchos-a-muchos entre proveedores y productos';

-- TABLA: Pedido
CREATE TABLE Pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    fecha_pedido DATE NOT NULL,
    fecha_entrega DATE,
    notas TEXT,
    estado ENUM('Pendiente','Recibido','Parcial','Cancelado') DEFAULT 'Pendiente',
    id_proveedor INT NOT NULL,
    id_dueño INT NOT NULL,
    FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_dueño) REFERENCES Dueño(id_dueño)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Pedidos realizados a proveedores';

-- TABLA: Detalles_Pedido
CREATE TABLE Detalles_Pedido (
    id_detalle_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_pedida INT NOT NULL CHECK (cantidad_pedida > 0),
    precio_compra DECIMAL(10,2) NOT NULL CHECK (precio_compra >= 0),
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Productos asociados a un pedido';

-- ====================================
-- ÍNDICES
-- ====================================
CREATE INDEX idx_producto_nombre ON Producto(nombre);
CREATE INDEX idx_venta_fecha ON Venta(fecha_venta);
CREATE INDEX idx_empleado_activo ON Empleado(activo);
CREATE INDEX idx_empleado_token ON Empleado(token_acceso);
CREATE INDEX idx_proveedor_dueno ON Proveedor(id_dueño);
CREATE INDEX idx_pedido_dueno ON Pedido(id_dueño);

-- ====================================
-- TRIGGERS
-- ====================================

DELIMITER $$

-- Trigger para generar token automático al crear empleado
CREATE TRIGGER tr_generar_token_empleado
BEFORE INSERT ON Empleado
FOR EACH ROW
BEGIN
    IF NEW.token_acceso IS NULL OR NEW.token_acceso = '' THEN
        SET NEW.token_acceso = CONCAT('EMP_', UUID_SHORT(), '_', UNIX_TIMESTAMP());
    END IF;
END$$

-- Trigger para validar stock antes de vender
CREATE TRIGGER tr_validar_stock
BEFORE INSERT ON Venta
FOR EACH ROW
BEGIN
    DECLARE stock_actual INT DEFAULT 0;
    
    SELECT cantidad_disponible INTO stock_actual
    FROM Producto 
    WHERE id_producto = NEW.id_producto;
    
    IF stock_actual IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Producto no encontrado.';
    ELSEIF stock_actual < NEW.cantidad_vendida THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('Stock insuficiente. Disponible: ', stock_actual, ', Solicitado: ', NEW.cantidad_vendida);
    END IF;
END$$

-- Trigger para calcular total y cambio automáticamente
CREATE TRIGGER tr_calcular_total_cambio
BEFORE INSERT ON Venta
FOR EACH ROW
BEGIN
    -- Calcular total si no se proporciona
    IF NEW.total IS NULL OR NEW.total = 0 THEN
        SET NEW.total = NEW.cantidad_vendida * NEW.precio_unitario;
    END IF;
    
    -- Calcular cambio si no se proporciona
    IF NEW.cambio IS NULL THEN
        SET NEW.cambio = NEW.monto_pagado - NEW.total;
    END IF;
END$$

-- Trigger para descontar inventario después de vender
CREATE TRIGGER tr_descuento_inventario
AFTER INSERT ON Venta
FOR EACH ROW
BEGIN
    UPDATE Producto 
    SET cantidad_disponible = cantidad_disponible - NEW.cantidad_vendida
    WHERE id_producto = NEW.id_producto;
END$$

-- Trigger para incrementar inventario después de recibir pedido
CREATE TRIGGER tr_incremento_inventario
AFTER INSERT ON Detalles_Pedido
FOR EACH ROW
BEGIN
    UPDATE Producto
    SET cantidad_disponible = cantidad_disponible + NEW.cantidad_pedida
    WHERE id_producto = NEW.id_producto;
END$$

DELIMITER ;

-- ====================================
-- DATOS DE EJEMPLO
-- ====================================

-- Insertar dueño de ejemplo
INSERT INTO Dueño (nombre, correo, password) VALUES 
('Juan Pérez', 'juan@tienda.com', '$2b$10$ejemplo');

-- Insertar marca de ejemplo
INSERT INTO Marca (nombre_marca, id_dueño) VALUES 
('Marca Ejemplo', 1);

-- Insertar producto de ejemplo
INSERT INTO Producto (nombre, precio, cantidad_disponible, id_marca, id_dueño) VALUES 
('Producto Ejemplo', 10.50, 100, 1, 1);

-- Insertar empleado de ejemplo
INSERT INTO Empleado (nombre, turno, direccion, telefono, fecha_contratacion, id_dueño) VALUES 
('María García', 'Mañana', 'Calle Ejemplo 123', '555-1234', '2024-01-15', 1);

-- Insertar proveedor de ejemplo
INSERT INTO Proveedor (nombre, telefono, productos_distribuye, frecuencia, id_dueño) VALUES 
('Proveedor Ejemplo', '555-5678', 'Productos varios', 'Semanal', 1);

SELECT '✅ Base de datos creada exitosamente!' AS mensaje; 