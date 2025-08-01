# 🚀 Configuración del Proyecto Tienditas

## 📋 Requisitos Previos

1. **Node.js** (versión 16 o superior)
2. **MySQL** (versión 8.0 o superior)
3. **npm** o **yarn**

## 🛠️ Instalación Paso a Paso

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar MySQL Local

#### Opción A: Usando MySQL Workbench
1. Abrir MySQL Workbench
2. Conectar a tu servidor MySQL local
3. Ejecutar el archivo `database.sql` completo
4. Verificar que se creó la base de datos `tienditas`

#### Opción B: Usando línea de comandos
```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script
source database.sql;
```

### 3. Verificar Configuración
El archivo `config.env` ya está configurado para desarrollo local:
```env
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=
MYSQLDATABASE=tienditas
JWT_SECRET=tu_jwt_secret_super_seguro_2024
PORT=3000
```

### 4. Iniciar el Servidor
```bash
npm start
```

### 5. Acceder a la Aplicación
Abrir el navegador y ir a: `http://localhost:3000`

## 🔧 Solución de Problemas

### Error de Conexión a MySQL
- Verificar que MySQL esté ejecutándose
- Verificar credenciales en `config.env`
- Verificar que la base de datos `tienditas` exista

### Error de CORS
- Asegurarse de acceder a `http://localhost:3000` y no al archivo HTML directamente
- El servidor debe estar ejecutándose

### Error de Módulos
- Ejecutar `npm install` para instalar dependencias

## 📊 Estructura de la Base de Datos

El script `database.sql` crea:
- ✅ Base de datos `tienditas`
- ✅ Tabla `Dueño` para registro de dueños
- ✅ Tabla `Producto` con campos actualizados
- ✅ Tabla `Empleado` con turnos y estados
- ✅ Tabla `Venta` con métodos de pago
- ✅ Tabla `Pedido` para gestión de pedidos
- ✅ Triggers automáticos para inventario
- ✅ Índices para optimización

## 🎯 Funcionalidades Disponibles

1. **Registro de Dueños**: Crear cuenta nueva
2. **Login de Dueños**: Acceso para dueños existentes
3. **Login de Empleados**: Acceso para empleados (por nombre)
4. **Dashboard**: Estadísticas y gestión
5. **Gestión de Productos**: CRUD completo
6. **Gestión de Empleados**: CRUD completo
7. **Gestión de Ventas**: Crear ventas con métodos de pago
8. **Gestión de Pedidos**: Crear y administrar pedidos
9. **Reportes**: Estadísticas y análisis

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Tokens JWT para autenticación
- Aislamiento de datos por dueño
- Validaciones en frontend y backend

## 📝 Notas Importantes

- Los empleados se autentican por nombre (sin contraseña en esta versión)
- Las marcas y proveedores son globales (no por dueño)
- Los triggers automáticos gestionan el inventario
- El servidor debe estar ejecutándose para usar la aplicación

---

**¡Listo para usar! 🎉** 