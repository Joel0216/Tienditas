# 🔄 INSTRUCCIONES PARA ACTUALIZAR LA BASE DE DATOS

## 📋 **PASOS PARA ACTUALIZAR**

### **1. Conectar a MySQL Workbench**
- Abrir MySQL Workbench
- Conectar a Railway usando las credenciales:
  - **Host:** yamanote.proxy.rlwy.net:25839
  - **Usuario:** root
  - **Contraseña:** wEOqpNxfqYJZFcTmopEjspgSDyFdDOhJ
  - **Base de datos:** railway

### **2. Ejecutar el Script de Actualización**
- Copiar todo el contenido del archivo `database_actualizado.sql`
- Pegarlo en MySQL Workbench
- Ejecutar el script completo

### **3. Verificar la Actualización**
- Verificar que todas las tablas se crearon correctamente
- Verificar que los triggers funcionan

## 🗂️ **ARCHIVOS ACTUALIZADOS**

### **Backend (Rutas):**
- ✅ `routes/productos.js` - Suma automática de stocks
- ✅ `routes/empleados.js` - Token automático y validaciones
- ✅ `routes/ventas.js` - Fecha automática, cálculo de total y cambio
- ✅ `routes/proveedores.js` - Nuevas funcionalidades
- ✅ `middleware/auth.js` - Middleware de autenticación

### **Base de Datos:**
- ✅ `database_actualizado.sql` - Script completo actualizado

## 🎯 **NUEVAS FUNCIONALIDADES**

### **Productos:**
- ✅ **Validación de cantidad:** Solo números positivos
- ✅ **Suma automática de stocks:** Si nombre, precio y marca son iguales
- ✅ **Campos:** Nombre, precio, cantidad, fecha de caducidad, marca

### **Empleados:**
- ✅ **Validación de teléfono:** Solo números
- ✅ **Token automático:** Se genera al crear empleado
- ✅ **Campos:** Nombre, turno, dirección, teléfono

### **Ventas:**
- ✅ **Fecha automática:** Se registra automáticamente
- ✅ **Cálculo automático:** Total y cambio
- ✅ **Validaciones:** Solo números positivos
- ✅ **Campos:** Fecha, producto, cantidad, total, método, monto pagado, cambio

### **Proveedores:**
- ✅ **Validación de teléfono:** Solo números
- ✅ **Campos:** Nombre, teléfono, productos, frecuencia

## 🚨 **COMANDOS PARA LIMPIAR BASE DE DATOS**

Si necesitas limpiar completamente la base de datos:

```sql
-- Desactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas
DROP TABLE IF EXISTS Detalles_Venta;
DROP TABLE IF EXISTS Detalles_Pedido;
DROP TABLE IF EXISTS Proveedor_Producto;
DROP TABLE IF EXISTS Venta;
DROP TABLE IF EXISTS Pedido;
DROP TABLE IF EXISTS Producto;
DROP TABLE IF EXISTS Empleado;
DROP TABLE IF EXISTS Marca;
DROP TABLE IF EXISTS Proveedor;
DROP TABLE IF EXISTS Dueño;

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;
```

## ✅ **VERIFICACIÓN FINAL**

Después de ejecutar el script:

1. **Verificar tablas creadas:**
   ```sql
   SHOW TABLES;
   ```

2. **Verificar triggers:**
   ```sql
   SHOW TRIGGERS;
   ```

3. **Probar funcionalidades:**
   - Registrar un dueño
   - Crear productos (probar suma de stocks)
   - Crear empleados (verificar token)
   - Registrar ventas (verificar cálculos)
   - Crear proveedores

## 🎉 **¡LISTO!**

Una vez ejecutado el script, todas las nuevas funcionalidades estarán disponibles en la aplicación web.

---

**¡La aplicación estará completamente actualizada con todas las mejoras solicitadas!** 