# 🏪 Tienditas - Sistema de Gestión de Tiendas

## 📋 Descripción

Tienditas es un sistema completo de gestión de tiendas desarrollado en **Node.js** con **MySQL** como base de datos. Permite a los dueños de tiendas gestionar productos, empleados, ventas y proveedores de manera eficiente.

## ✨ Características Principales

### 🔐 **Autenticación**
- Registro e inicio de sesión para dueños
- Sistema de tokens JWT
- Acceso diferenciado para empleados

### 📦 **Gestión de Productos**
- Catálogo de productos con marcas
- Control de inventario automático
- Alertas de stock bajo
- Fechas de caducidad

### 👥 **Gestión de Empleados**
- Registro de empleados por dueño
- Asignación de turnos (Mañana, Tarde, Noche)
- Tokens de acceso únicos
- Control de empleados activos

### 💰 **Sistema de Ventas**
- Registro de ventas con múltiples métodos de pago
- Cálculo automático de totales y cambio
- Descuento automático de inventario
- Estadísticas de ventas en tiempo real

### 📊 **Dashboard y Reportes**
- Estadísticas de ventas del día
- Productos más vendidos
- Empleados activos
- Ingresos totales

### 🚚 **Gestión de Proveedores**
- Registro de proveedores
- Información de contacto
- Productos que distribuye

## 🛠️ Tecnologías Utilizadas

- **Backend:** Node.js, Express.js
- **Base de Datos:** MySQL
- **Autenticación:** JWT (JSON Web Tokens)
- **Frontend:** HTML, CSS, JavaScript
- **Encriptación:** bcryptjs

## 📁 Estructura del Proyecto

```
Tienditas/
├── config/
│   └── database.js          # Configuración de base de datos
├── middleware/
│   └── auth.js              # Middleware de autenticación
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── duenos.js            # Gestión de dueños
│   ├── empleados.js         # Gestión de empleados
│   ├── marcas.js            # Gestión de marcas
│   ├── productos.js         # Gestión de productos
│   ├── proveedores.js       # Gestión de proveedores
│   └── ventas.js            # Gestión de ventas
├── public/
│   ├── index.html           # Página principal
│   ├── dashboard.html       # Dashboard del dueño
│   ├── empleado.html        # Panel del empleado
│   ├── app.js              # JavaScript principal
│   ├── dashboard.js        # JavaScript del dashboard
│   ├── empleado.js         # JavaScript del empleado
│   └── styles.css          # Estilos CSS
├── server.js               # Servidor principal
├── start.js               # Script de inicio
└── script_final_completo.sql # Script SQL completo
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- Cuenta en Railway (para base de datos)

### **Pasos de Instalación**

1. **Clonar el repositorio**
```bash
   git clone https://github.com/Joel0216/Tienditas.git
cd Tienditas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
   - Crear archivo `config.env`
   - Configurar credenciales de MySQL

4. **Ejecutar script SQL**
   - Abrir MySQL Workbench
   - Ejecutar `script_final_completo.sql`

5. **Iniciar el servidor**
```bash
npm start
```

6. **Acceder a la aplicación**
   - Abrir navegador
   - Ir a: `http://localhost:3002`

## 📊 Base de Datos

### **Tablas Principales**
- `Dueno` - Información de dueños
- `Empleado` - Información de empleados
- `Marca` - Marcas de productos
- `Producto` - Catálogo de productos
- `Venta` - Registro de ventas
- `Proveedor` - Información de proveedores

### **Vistas Disponibles**
- `v_ventas_detalladas` - Ventas con información completa
- `v_productos_stock_bajo` - Productos con stock bajo
- `v_empleados_activos` - Empleados activos
- `v_estadisticas_ventas` - Estadísticas por día
- `v_productos_mas_vendidos` - Top 10 productos

### **Procedimientos Almacenados**
- `sp_estadisticas_ventas_hoy` - Estadísticas del día
- `sp_obtener_ventas_dueno` - Ventas por dueño

## 🔧 Funcionalidades

### **Para Dueños**
- ✅ Registro e inicio de sesión
- ✅ Gestión de productos y marcas
- ✅ Gestión de empleados
- ✅ Visualización de ventas
- ✅ Estadísticas en tiempo real
- ✅ Gestión de proveedores

### **Para Empleados**
- ✅ Inicio de sesión con token
- ✅ Registro de ventas
- ✅ Consulta de productos
- ✅ Cálculo automático de totales

## 🎯 Características Técnicas

- **Seguridad:** Contraseñas encriptadas con bcrypt
- **Autenticación:** JWT tokens
- **Validación:** Validación de datos en frontend y backend
- **Responsive:** Interfaz adaptable a diferentes dispositivos
- **Real-time:** Estadísticas actualizadas en tiempo real

## 📝 Licencia

Este proyecto es de uso educativo y comercial.

## 👨‍💻 Autor

**Joel Antonio Pool** - Desarrollador Full Stack

---

## 🎉 ¡Gracias por usar Tienditas!

Para soporte técnico o consultas, contacta al desarrollador. 