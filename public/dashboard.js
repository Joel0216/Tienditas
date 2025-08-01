// Configuración
const API_BASE = '/api';
let token = localStorage.getItem('token');
let usuario = null;

// Obtener usuario de manera segura
try {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
        usuario = JSON.parse(usuarioStr);
    }
} catch (error) {
    console.error('Error al parsear usuario:', error);
    localStorage.removeItem('usuario');
    usuario = null;
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    // Verificar el tipo de usuario de manera más robusta
    if (usuario) {
        // Si el usuario tiene id_empleado, es un empleado
        if (usuario.id_empleado && !usuario.id_dueño) {
            window.location.href = '/empleado.html';
            return;
        }
        // Si el usuario tiene id_dueño y no id_empleado, es un dueño
        else if (usuario.id_dueño && !usuario.id_empleado) {
            // Continuar con el dashboard del dueño
        }
        // Si tiene ambos o ninguno, verificar por el tipo
        else if (usuario.tipo === 'empleado') {
            window.location.href = '/empleado.html';
            return;
        }
        else if (usuario.tipo === 'dueno') {
            // Continuar con el dashboard del dueño
        }
        else {
            // Si no se puede determinar, ir al login
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
            return;
        }
    } else {
        // Si no hay usuario, ir al login
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/';
        return;
    }
    
    mostrarNombreUsuario();
    cargarDashboard();
    cargarMarcas();
});

// Navegación
function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(s => s.style.display = 'none');
    
    // Mostrar la sección seleccionada
    document.getElementById(seccion).style.display = 'block';
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
    
    // Cargar datos según la sección
    switch(seccion) {
        case 'dashboard':
            cargarDashboard();
            break;
        case 'productos':
            cargarProductos();
            break;
        case 'empleados':
            cargarEmpleados();
            break;
        case 'ventas':
            cargarVentas();
            break;
        case 'marcas':
            cargarMarcas();
            break;
        case 'proveedores':
            cargarProveedores();
            break;
    }
}

// Dashboard
function cargarDashboard() {
    // Verificar que el token existe antes de hacer las llamadas
    if (!token) {
        console.log('No hay token disponible, redirigiendo al login...');
        window.location.href = '/';
        return;
    }
    
    Promise.all([
        fetch(`${API_BASE}/productos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/empleados`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/ventas/estadisticas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
    ]).then(responses => Promise.all(responses.map(r => r.json())))
    .then(([productos, empleados, estadisticas]) => {
        document.getElementById('totalProductos').textContent = productos.data?.length || 0;
        document.getElementById('totalEmpleados').textContent = empleados.data?.length || 0;
        document.getElementById('ventasHoy').textContent = estadisticas.data?.estadisticas_generales?.total_ventas || 0;
        document.getElementById('ingresosHoy').textContent = `$${estadisticas.data?.estadisticas_generales?.ingresos_totales || 0}`;
    }).catch(error => {
        console.error('Error cargando dashboard:', error);
        // Si hay error de autenticación, redirigir al login
        if (error.message && error.message.includes('401')) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
        }
    });
}

// Productos
function cargarProductos() {
    fetch(`${API_BASE}/productos`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarProductos(data.data);
        }
    })
    .catch(error => {
        console.error('Error cargando productos:', error);
        mostrarNotificacion('Error al cargar productos', 'error');
    });
}

function mostrarProductos(productos) {
    const tbody = document.getElementById('tablaProductos');
    tbody.innerHTML = '';
    
    productos.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.nombre}</td>
            <td>$${producto.precio}</td>
            <td>${producto.cantidad_disponible}</td>
            <td>${producto.fecha_caducidad || 'N/A'}</td>
            <td>${producto.nombre_marca}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarProducto(${producto.id_producto})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id_producto})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarModalProducto() {
    cargarMarcasSelect();
    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

function guardarProducto() {
    const producto = {
        nombre: document.getElementById('nombreProducto').value,
        precio: parseFloat(document.getElementById('precioProducto').value),
        cantidad_disponible: parseInt(document.getElementById('cantidadProducto').value),
        fecha_caducidad: document.getElementById('fechaCaducidad').value || null,
        id_marca: parseInt(document.getElementById('marcaProducto').value)
    };
    
    fetch(`${API_BASE}/productos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(producto)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalProducto'));
            modal.hide();
            document.getElementById('formProducto').reset();
            cargarProductos();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error guardando producto:', error);
        mostrarNotificacion('Error al guardar producto', 'error');
    });
}

// Funciones de edición y eliminación
function editarProducto(id) {
    // Cargar datos del producto
    fetch(`${API_BASE}/productos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const producto = data.data;
            
            // Llenar el formulario
            document.getElementById('nombreProducto').value = producto.nombre;
            document.getElementById('precioProducto').value = producto.precio;
            document.getElementById('cantidadProducto').value = producto.cantidad_disponible;
            document.getElementById('fechaCaducidad').value = producto.fecha_caducidad || '';
            
            // Cargar marcas y seleccionar la correcta
            cargarMarcasSelect().then(() => {
                document.getElementById('marcaProducto').value = producto.id_marca;
            });
            
            // Cambiar el comportamiento del botón guardar
            const btnGuardar = document.querySelector('#modalProducto .btn-primary');
            btnGuardar.onclick = () => actualizarProducto(id);
            btnGuardar.textContent = 'Actualizar';
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
            modal.show();
        } else {
            mostrarNotificacion('Error al cargar producto', 'error');
        }
    })
    .catch(error => {
        console.error('Error cargando producto:', error);
        mostrarNotificacion('Error al cargar producto', 'error');
    });
}

function actualizarProducto(id) {
    const producto = {
        nombre: document.getElementById('nombreProducto').value,
        precio: parseFloat(document.getElementById('precioProducto').value),
        cantidad_disponible: parseInt(document.getElementById('cantidadProducto').value),
        fecha_caducidad: document.getElementById('fechaCaducidad').value || null,
        id_marca: parseInt(document.getElementById('marcaProducto').value)
    };
    
    fetch(`${API_BASE}/productos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(producto)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Producto actualizado exitosamente', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalProducto'));
            modal.hide();
            document.getElementById('formProducto').reset();
            
            // Restaurar el comportamiento original del botón
            const btnGuardar = document.querySelector('#modalProducto .btn-primary');
            btnGuardar.onclick = guardarProducto;
            btnGuardar.textContent = 'Guardar';
            
            cargarProductos();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error actualizando producto:', error);
        mostrarNotificacion('Error al actualizar producto', 'error');
    });
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        fetch(`${API_BASE}/productos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Producto eliminado exitosamente', 'success');
                cargarProductos();
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error eliminando producto:', error);
            mostrarNotificacion('Error al eliminar producto', 'error');
        });
    }
}

// Empleados
function cargarEmpleados() {
    fetch(`${API_BASE}/empleados`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarEmpleados(data.data);
        }
    })
    .catch(error => {
        console.error('Error cargando empleados:', error);
        mostrarNotificacion('Error al cargar empleados', 'error');
    });
}

function mostrarEmpleados(empleados) {
    const tbody = document.getElementById('tablaEmpleados');
    tbody.innerHTML = '';
    
    empleados.forEach(empleado => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${empleado.nombre}</td>
            <td>${empleado.turno}</td>
            <td>${empleado.direccion || 'N/A'}</td>
            <td>${empleado.telefono || 'N/A'}</td>
            <td><code>${empleado.token_acceso}</code></td>
            <td>
                <span class="badge ${empleado.activo ? 'bg-success' : 'bg-danger'}">
                    ${empleado.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarEmpleado(${empleado.id_empleado})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarEmpleado(${empleado.id_empleado})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarModalEmpleado() {
    const modal = new bootstrap.Modal(document.getElementById('modalEmpleado'));
    modal.show();
}

function guardarEmpleado() {
    const empleado = {
        nombre: document.getElementById('nombreEmpleado').value,
        turno: document.getElementById('turnoEmpleado').value,
        direccion: document.getElementById('direccionEmpleado').value,
        telefono: document.getElementById('telefonoEmpleado').value
    };
    
    fetch(`${API_BASE}/empleados`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(empleado)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEmpleado'));
            modal.hide();
            document.getElementById('formEmpleado').reset();
            cargarEmpleados();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error guardando empleado:', error);
        mostrarNotificacion('Error al guardar empleado', 'error');
    });
}

function editarEmpleado(id) {
    // Cargar datos del empleado
    fetch(`${API_BASE}/empleados/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const empleado = data.data;
            
            // Llenar el formulario
            document.getElementById('nombreEmpleado').value = empleado.nombre;
            document.getElementById('turnoEmpleado').value = empleado.turno;
            document.getElementById('direccionEmpleado').value = empleado.direccion || '';
            document.getElementById('telefonoEmpleado').value = empleado.telefono || '';
            
            // Cambiar el comportamiento del botón guardar
            const btnGuardar = document.querySelector('#modalEmpleado .btn-primary');
            btnGuardar.onclick = () => actualizarEmpleado(id);
            btnGuardar.textContent = 'Actualizar';
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('modalEmpleado'));
            modal.show();
        } else {
            mostrarNotificacion('Error al cargar empleado', 'error');
        }
    })
    .catch(error => {
        console.error('Error cargando empleado:', error);
        mostrarNotificacion('Error al cargar empleado', 'error');
    });
}

function actualizarEmpleado(id) {
    const empleado = {
        nombre: document.getElementById('nombreEmpleado').value,
        turno: document.getElementById('turnoEmpleado').value,
        direccion: document.getElementById('direccionEmpleado').value,
        telefono: document.getElementById('telefonoEmpleado').value
    };
    
    fetch(`${API_BASE}/empleados/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(empleado)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Empleado actualizado exitosamente', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalEmpleado'));
            modal.hide();
            document.getElementById('formEmpleado').reset();
            
            // Restaurar el comportamiento original del botón
            const btnGuardar = document.querySelector('#modalEmpleado .btn-primary');
            btnGuardar.onclick = guardarEmpleado;
            btnGuardar.textContent = 'Guardar';
            
            cargarEmpleados();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error actualizando empleado:', error);
        mostrarNotificacion('Error al actualizar empleado', 'error');
    });
}

function eliminarEmpleado(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
        fetch(`${API_BASE}/empleados/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Empleado eliminado exitosamente', 'success');
                cargarEmpleados();
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error eliminando empleado:', error);
            mostrarNotificacion('Error al eliminar empleado', 'error');
        });
    }
}

// Ventas
function cargarVentas() {
    fetch(`${API_BASE}/ventas`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarVentas(data.data);
        }
    })
    .catch(error => {
        console.error('Error cargando ventas:', error);
        mostrarNotificacion('Error al cargar ventas', 'error');
    });
}

function mostrarVentas(ventas) {
    const tbody = document.getElementById('tablaVentas');
    tbody.innerHTML = '';
    
    ventas.forEach(venta => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(venta.fecha_venta).toLocaleString()}</td>
            <td>${venta.nombre_producto}</td>
            <td>${venta.cantidad_vendida}</td>
            <td>$${venta.total}</td>
            <td>${venta.metodo_pago}</td>
            <td>$${venta.monto_pagado}</td>
            <td>$${venta.cambio}</td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarModalVenta() {
    cargarProductosSelect();
    const modal = new bootstrap.Modal(document.getElementById('modalVenta'));
    modal.show();
}

function guardarVenta() {
    const venta = {
        id_producto: parseInt(document.getElementById('productoVenta').value),
        cantidad_vendida: parseInt(document.getElementById('cantidadVenta').value),
        metodo_pago: document.getElementById('metodoPago').value,
        monto_pagado: parseFloat(document.getElementById('montoPagado').value)
    };
    
    fetch(`${API_BASE}/ventas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(venta)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalVenta'));
            modal.hide();
            document.getElementById('formVenta').reset();
            cargarVentas();
            cargarDashboard();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error guardando venta:', error);
        mostrarNotificacion('Error al guardar venta', 'error');
    });
}

// Marcas
function cargarMarcas() {
    fetch(`${API_BASE}/marcas`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMarcas(data.data);
        }
    })
    .catch(error => {
        console.error('Error cargando marcas:', error);
        mostrarNotificacion('Error al cargar marcas', 'error');
    });
}

function mostrarMarcas(marcas) {
    const tbody = document.getElementById('tablaMarcas');
    tbody.innerHTML = '';
    
    marcas.forEach(marca => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${marca.nombre_marca}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarMarca(${marca.id_marca})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarMarca(${marca.id_marca})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function cargarMarcasSelect() {
    return fetch(`${API_BASE}/marcas`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const select = document.getElementById('marcaProducto');
            select.innerHTML = '<option value="">Seleccionar marca...</option>';
            data.data.forEach(marca => {
                select.innerHTML += `<option value="${marca.id_marca}">${marca.nombre_marca}</option>`;
            });
        }
    })
    .catch(error => {
        console.error('Error cargando marcas para select:', error);
    });
}

function mostrarModalMarca() {
    const modal = new bootstrap.Modal(document.getElementById('modalMarca'));
    modal.show();
}

function guardarMarca() {
    const marca = {
        nombre_marca: document.getElementById('nombreMarca').value
    };
    
    fetch(`${API_BASE}/marcas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(marca)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalMarca'));
            modal.hide();
            document.getElementById('formMarca').reset();
            cargarMarcas();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error guardando marca:', error);
        mostrarNotificacion('Error al guardar marca', 'error');
    });
}

function editarMarca(id) {
    // Cargar datos de la marca
    fetch(`${API_BASE}/marcas/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const marca = data.data;
            
            // Llenar el formulario
            document.getElementById('nombreMarca').value = marca.nombre_marca;
            
            // Cambiar el comportamiento del botón guardar
            const btnGuardar = document.querySelector('#modalMarca .btn-primary');
            btnGuardar.onclick = () => actualizarMarca(id);
            btnGuardar.textContent = 'Actualizar';
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('modalMarca'));
            modal.show();
        } else {
            mostrarNotificacion('Error al cargar marca', 'error');
        }
    })
    .catch(error => {
        console.error('Error cargando marca:', error);
        mostrarNotificacion('Error al cargar marca', 'error');
    });
}

function actualizarMarca(id) {
    const marca = {
        nombre_marca: document.getElementById('nombreMarca').value
    };
    
    fetch(`${API_BASE}/marcas/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(marca)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Marca actualizada exitosamente', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalMarca'));
            modal.hide();
            document.getElementById('formMarca').reset();
            
            // Restaurar el comportamiento original del botón
            const btnGuardar = document.querySelector('#modalMarca .btn-primary');
            btnGuardar.onclick = guardarMarca;
            btnGuardar.textContent = 'Guardar';
            
            cargarMarcas();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error actualizando marca:', error);
        mostrarNotificacion('Error al actualizar marca', 'error');
    });
}

function eliminarMarca(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta marca?')) {
        fetch(`${API_BASE}/marcas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Marca eliminada exitosamente', 'success');
                cargarMarcas();
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error eliminando marca:', error);
            mostrarNotificacion('Error al eliminar marca', 'error');
        });
    }
}

// Proveedores
function cargarProveedores() {
    fetch(`${API_BASE}/proveedores`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarProveedores(data.data);
        }
    })
    .catch(error => {
        console.error('Error cargando proveedores:', error);
        mostrarNotificacion('Error al cargar proveedores', 'error');
    });
}

function mostrarProveedores(proveedores) {
    const tbody = document.getElementById('tablaProveedores');
    tbody.innerHTML = '';
    
    proveedores.forEach(proveedor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${proveedor.nombre}</td>
            <td>${proveedor.telefono || 'N/A'}</td>
            <td>${proveedor.productos_distribuye || 'N/A'}</td>
            <td>${proveedor.frecuencia || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarProveedor(${proveedor.id_proveedor})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProveedor(${proveedor.id_proveedor})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarModalProveedor() {
    const modal = new bootstrap.Modal(document.getElementById('modalProveedor'));
    modal.show();
}

function guardarProveedor() {
    const proveedor = {
        nombre: document.getElementById('nombreProveedor').value,
        telefono: document.getElementById('telefonoProveedor').value,
        productos_distribuye: document.getElementById('productosProveedor').value,
        frecuencia: document.getElementById('frecuenciaProveedor').value
    };
    
    fetch(`${API_BASE}/proveedores`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(proveedor)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion(data.message, 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalProveedor'));
            modal.hide();
            document.getElementById('formProveedor').reset();
            cargarProveedores();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error guardando proveedor:', error);
        mostrarNotificacion('Error al guardar proveedor', 'error');
    });
}

function editarProveedor(id) {
    // Cargar datos del proveedor
    fetch(`${API_BASE}/proveedores/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const proveedor = data.data;
            
            // Llenar el formulario
            document.getElementById('nombreProveedor').value = proveedor.nombre;
            document.getElementById('telefonoProveedor').value = proveedor.telefono || '';
            document.getElementById('productosProveedor').value = proveedor.productos_distribuye || '';
            document.getElementById('frecuenciaProveedor').value = proveedor.frecuencia || '';
            
            // Cambiar el comportamiento del botón guardar
            const btnGuardar = document.querySelector('#modalProveedor .btn-primary');
            btnGuardar.onclick = () => actualizarProveedor(id);
            btnGuardar.textContent = 'Actualizar';
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('modalProveedor'));
            modal.show();
        } else {
            mostrarNotificacion('Error al cargar proveedor', 'error');
        }
    })
    .catch(error => {
        console.error('Error cargando proveedor:', error);
        mostrarNotificacion('Error al cargar proveedor', 'error');
    });
}

function actualizarProveedor(id) {
    const proveedor = {
        nombre: document.getElementById('nombreProveedor').value,
        telefono: document.getElementById('telefonoProveedor').value,
        productos_distribuye: document.getElementById('productosProveedor').value,
        frecuencia: document.getElementById('frecuenciaProveedor').value
    };
    
    fetch(`${API_BASE}/proveedores/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(proveedor)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion('Proveedor actualizado exitosamente', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalProveedor'));
            modal.hide();
            document.getElementById('formProveedor').reset();
            
            // Restaurar el comportamiento original del botón
            const btnGuardar = document.querySelector('#modalProveedor .btn-primary');
            btnGuardar.onclick = guardarProveedor;
            btnGuardar.textContent = 'Guardar';
            
            cargarProveedores();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error actualizando proveedor:', error);
        mostrarNotificacion('Error al actualizar proveedor', 'error');
    });
}

function eliminarProveedor(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
        fetch(`${API_BASE}/proveedores/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion('Proveedor eliminado exitosamente', 'success');
                cargarProveedores();
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error eliminando proveedor:', error);
            mostrarNotificacion('Error al eliminar proveedor', 'error');
        });
    }
}

// Funciones auxiliares
function cargarProductosSelect() {
    fetch(`${API_BASE}/productos`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const select = document.getElementById('productoVenta');
            select.innerHTML = '<option value="">Seleccionar producto...</option>';
            data.data.forEach(producto => {
                select.innerHTML += `<option value="${producto.id_producto}">${producto.nombre} - $${producto.precio}</option>`;
            });
        }
    })
    .catch(error => {
        console.error('Error cargando productos para select:', error);
    });
}

function mostrarNombreUsuario() {
    if (usuario) {
        document.getElementById('nombreUsuario').textContent = usuario.nombre;
    }
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/';
}

function mostrarNotificacion(mensaje, tipo) {
    // Crear notificación
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
    notificacion.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notificacion.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notificacion);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 5000);
} 