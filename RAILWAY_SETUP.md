# 🚀 Configuración para Railway

## ✅ Estado Actual
- ✅ Conexión a Railway configurada
- ✅ Base de datos `railway` conectada
- ✅ Servidor ejecutándose en `http://localhost:3000`

## 📋 Configuración Actual

### Variables de Entorno (config.env)
```env
MYSQLHOST=yamanote.proxy.rlwy.net
MYSQLPORT=25839
MYSQLUSER=root
MYSQLPASSWORD=wEOqpNxfqYJZFcTmopEjspgSDyFdDOhJ
MYSQLDATABASE=railway
JWT_SECRET=tu_jwt_secret_super_seguro_2024
PORT=3000
```

## 🎯 Cómo Usar la Aplicación

### 1. Iniciar el Servidor
```bash
npm start
```

### 2. Acceder a la Aplicación
Abrir el navegador y ir a: `http://localhost:3000`

### 3. Configurar la Base de Datos
Ejecutar el archivo `database.sql` en MySQL Workbench conectado a Railway:
- Host: `yamanote.proxy.rlwy.net`
- Port: `25839`
- User: `root`
- Password: `wEOqpNxfqYJZFcTmopEjspgSDyFdDOhJ`
- Database: `railway`

## 🔧 Funcionalidades Disponibles

### Registro de Dueños
- ✅ Crear cuenta nueva
- ✅ Validación de campos
- ✅ Encriptación de contraseñas

### Login de Dueños
- ✅ Acceso con correo y contraseña
- ✅ Tokens JWT

### Login de Empleados
- ✅ Acceso por nombre (sin contraseña)
- ✅ Verificación de estado activo

### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Gestión de productos
- ✅ Gestión de empleados
- ✅ Reportes de ventas

## 📊 Estructura de Base de Datos

### Tablas Creadas:
- ✅ `Dueño` - Información de dueños
- ✅ `Producto` - Catálogo con categorías y precios
- ✅ `Empleado` - Empleados con turnos
- ✅ `Venta` - Ventas con métodos de pago
- ✅ `Detalles_Venta` - Productos por venta
- ✅ `Marca` - Marcas de productos
- ✅ `Proveedor` - Información de proveedores
- ✅ `Pedido` - Pedidos a proveedores
- ✅ `Detalles_Pedido` - Productos por pedido

### Triggers Automáticos:
- ✅ Descuento automático de inventario al vender
- ✅ Incremento automático de inventario al recibir pedidos
- ✅ Validación de stock antes de vender

## 🎨 Interfaz de Usuario

### Pantallas Principales:
1. **Pantalla de Selección** - Elegir tipo de acceso
2. **Registro de Dueño** - Crear cuenta nueva
3. **Login de Dueño** - Acceso para dueños
4. **Login de Empleado** - Acceso para empleados
5. **Dashboard Dueño** - Panel completo de gestión
6. **Dashboard Empleado** - Panel para ventas

## 🔒 Seguridad

- ✅ Contraseñas encriptadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Aislamiento de datos por dueño
- ✅ Validaciones en frontend y backend

## 🚨 Solución de Problemas

### Error de CORS
- ✅ Asegúrate de acceder a `http://localhost:3000`
- ❌ NO abrir directamente el archivo HTML

### Error de Conexión
- ✅ Verificar que el servidor esté ejecutándose
- ✅ Verificar configuración en `config.env`

### Error de Base de Datos
- ✅ Ejecutar `database.sql` en Railway
- ✅ Verificar que las tablas existan

## 📱 URLs de la API

- **Registro Dueño:** `POST /api/auth/registrar-dueno`
- **Login Dueño:** `POST /api/auth/login-dueno`
- **Login Empleado:** `POST /api/auth/login-empleado`
- **Productos:** `GET /api/productos`
- **Ventas:** `GET /api/ventas`
- **Empleados:** `GET /api/empleados`

---

**¡La aplicación está lista para usar con Railway! 🎉** 

# 🚂 Configuración de Railway para Render.com

## 🔧 Problema
Railway por defecto tiene restricciones de IP que impiden conexiones desde Render.com.

## 🛠️ Solución

### **Paso 1: Ir a Railway Dashboard**
1. Ve a [railway.app](https://railway.app)
2. Selecciona tu proyecto
3. Ve a la pestaña "Settings"

### **Paso 2: Configurar Variables de Entorno**
1. En la sección "Variables", agrega:
   ```
   ALLOW_EXTERNAL_CONNECTIONS=true
   ```

### **Paso 3: Configurar Networking (si está disponible)**
1. Ve a la pestaña "Networking"
2. Busca la opción "Allow external connections"
3. Actívala

### **Paso 4: Verificar la configuración**
1. Reinicia tu servicio en Railway
2. Prueba la conexión desde Render.com

## 🔄 Alternativa: Usar Railway para el despliegue completo

Si no puedes configurar Railway, considera desplegar todo en Railway:

### **Ventajas:**
- ✅ Base de datos y aplicación en la misma red
- ✅ Sin problemas de conectividad
- ✅ Más fácil de configurar

### **Pasos:**
1. Ve a Railway Dashboard
2. Crea un nuevo servicio "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura las variables de entorno
5. Despliega

## 📋 Variables de Entorno para Railway

```env
PORT=3000
JWT_SECRET=tu_jwt_secret_super_seguro_2024
MYSQLHOST=mysql.railway.internal
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=wEOqpNxfqYJZFcTmopEjspgSDyFdDOhJ
MYSQLDATABASE=railway
```

## 🎯 Recomendación

**Usa Railway para todo el proyecto** - es más simple y confiable. 