// Configuración
const API_BASE = '/api';
let token = localStorage.getItem('token');
let usuario = JSON.parse(localStorage.getItem('usuario'));

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    // Verificar que sea un empleado de manera más robusta
    if (usuario) {
        // Si el usuario tiene id_dueño y no id_empleado, es un dueño
        if (usuario.id_dueño && !usuario.id_empleado) {
            window.location.href = '/dashboard.html';
            return;
        }
        // Si el usuario tiene id_empleado, es un empleado
        else if (usuario.id_empleado) {
            // Continuar con el dashboard del empleado
        }
        // Si tiene tipo específico
        else if (usuario.tipo === 'dueno') {
            window.location.href = '/dashboard.html';
            return;
        }
        else if (usuario.tipo === 'empleado') {
            // Continuar con el dashboard del empleado
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
    
    mostrarNombreEmpleado();
    cargarDashboard();
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
        case 'ventas':
            cargarVentas();
            break;
    }
}

// Dashboard
function cargarDashboard() {
    Promise.all([
        fetch(`${API_BASE}/productos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/ventas/estadisticas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
    ]).then(responses => Promise.all(responses.map(r => r.json())))
    .then(([productos, estadisticas]) => {
        document.getElementById('totalProductos').textContent = productos.data?.length || 0;
        document.getElementById('ventasHoy').textContent = estadisticas.data?.estadisticas_generales?.total_ventas || 0;
        document.getElementById('ingresosHoy').textContent = `$${estadisticas.data?.estadisticas_generales?.ingresos_totales || 0}`;
    }).catch(error => {
        console.error('Error cargando dashboard:', error);
    });
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

function mostrarNombreEmpleado() {
    if (usuario) {
        document.getElementById('nombreEmpleado').textContent = usuario.nombre;
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