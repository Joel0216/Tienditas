# 🎯 GUÍA COMPLETA PARA USAR LA APLICACIÓN

## ✅ FLUJO CORRECTO DE USO

### 1. **Iniciar el Servidor**
```bash
npm start
```

**Deberías ver:**
```
🔍 Probando conexión a la base de datos...
✅ Conexión a MySQL establecida correctamente
🚀 Servidor corriendo en http://localhost:3001
📱 Abre tu navegador y ve a: http://localhost:3001
```

### 2. **Abrir la Aplicación Web**
- Abre tu navegador (Chrome, Firefox, Edge, etc.)
- En la barra de direcciones, escribe exactamente:
  ```
  http://localhost:3001
  ```
- Presiona Enter

### 3. **Usar la Aplicación**
- Verás la página principal con 3 opciones:
  - **Registrar Dueño**
  - **Iniciar sesión Dueño**
  - **Iniciar sesión Empleado**

### 4. **Registrar un Dueño**
- Haz clic en **"Registrar Dueño"**
- Llena el formulario:
  - **Nombre Completo:** Tu nombre
  - **Correo Electrónico:** Tu email
  - **Contraseña:** Una contraseña segura
  - **Confirmar Contraseña:** La misma contraseña
- Haz clic en **"Registrarse"**

### 5. **Verificar en Railway/MySQL**
- Los datos se guardan automáticamente en Railway
- Puedes verificar en MySQL Workbench conectándote a Railway

## 🔧 CONFIGURACIÓN ACTUAL

### **Base de Datos:** Railway
- **Host:** yamanote.proxy.rlwy.net:25839
- **Base de datos:** railway
- **Usuario:** root
- **Contraseña:** wEOqpNxfqYJZFcTmopEjspgSDyFdDOhJ

### **Servidor:** Local
- **URL:** http://localhost:3001
- **Puerto:** 3001

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### **Error de CORS**
**Síntoma:** Error en consola del navegador sobre CORS
**Causa:** Abrir el archivo HTML directamente
**Solución:** Usar `http://localhost:3001` en lugar de `file:///C:/...`

### **Servidor no responde**
**Síntoma:** No se puede acceder a `http://localhost:3001`
**Solución:**
```bash
# Detener servidor (Ctrl+C)
# Reiniciar
npm start
```

### **Error de conexión a base de datos**
**Síntoma:** Error al registrar dueño
**Solución:** Verificar que Railway esté activo y las credenciales sean correctas

## 📱 FUNCIONALIDADES DISPONIBLES

### **Para Dueños:**
- ✅ Registrar cuenta
- ✅ Iniciar sesión
- ✅ Gestionar productos
- ✅ Ver inventario
- ✅ Registrar empleados
- ✅ Ver reportes de ventas
- ✅ Gestionar proveedores
- ✅ Gestionar pedidos

### **Para Empleados:**
- ✅ Iniciar sesión (sin contraseña)
- ✅ Registrar ventas
- ✅ Ver productos disponibles

## 🎯 RESULTADO ESPERADO

1. **Servidor corriendo** en `http://localhost:3001`
2. **Página web funcionando** con formularios
3. **Registros exitosos** sin errores
4. **Datos guardados** en Railway
5. **Verificación** en MySQL Workbench

## 🚀 ¡LISTO PARA USAR!

Una vez que sigas estos pasos, podrás:
- ✅ Registrar dueños desde la web
- ✅ Ver los datos en Railway
- ✅ Conectarte desde MySQL Workbench
- ✅ Gestionar toda la tienda desde la interfaz web

---

**¡La aplicación está lista! Solo necesitas acceder a `http://localhost:3001` y empezar a usar las funcionalidades.** 