// Variables globales
let usuarioActual = null;
let token = null;

// Configuración de la API
const API_BASE = '/api';

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const employeeLoginForm = document.getElementById('employeeLoginForm');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Limpiar todos los formularios al cargar la página
    setTimeout(() => {
        limpiarFormularios();
        // Limpiar específicamente los campos problemáticos
        const camposProblematicos = [
            'nombre', 'correo', 'password', 'confirm-password',
            'correo-login', 'password-login',
            'email-empleado', 'password-empleado'
        ];
        
        camposProblematicos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.value = '';
                campo.setAttribute('autocomplete', 'off');
                campo.removeAttribute('value');
            }
        });
    }, 100);
    
    // Verificar si ya hay una sesión activa
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/dashboard.html';
        return;
    }

    // Limpiar localStorage al cargar la página
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Verificar si hay un token guardado
    const tokenGuardado = localStorage.getItem('token');
    if (tokenGuardado) {
        verificarToken(tokenGuardado);
    }

    // Event listeners para formularios
    if (registerForm) {
        registerForm.addEventListener('submit', registrarDueno);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', loginDueno);
    }
    if (employeeLoginForm) {
        employeeLoginForm.addEventListener('submit', loginEmpleado);
    }
    
    // Event listeners para pestañas
    const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function() {
            setTimeout(() => {
                limpiarFormularios();
                // Limpiar específicamente los campos problemáticos
                const camposProblematicos = [
                    'nombre', 'correo', 'password', 'confirm-password',
                    'correo-login', 'password-login',
                    'email-empleado', 'password-empleado'
                ];
                
                camposProblematicos.forEach(id => {
                    const campo = document.getElementById(id);
                    if (campo) {
                        campo.value = '';
                        campo.setAttribute('autocomplete', 'off');
                        campo.removeAttribute('value');
                    }
                });
            }, 100);
        });
    });
    
    // Limpiar formularios cuando se hace clic en cualquier pestaña
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(() => {
                limpiarFormularios();
            }, 100);
        });
    });
    
    // Event listeners para limpiar campos al hacer clic
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(input => {
        // Solo limpiar al hacer clic si son datos pre-llenados
        input.addEventListener('click', function() {
            if (this.value === 'joelantoniopool@gmail.com' || 
                this.value === '••••••••' || 
                this.value === 'Fermina puc tun') {
                this.value = '';
                this.style.color = '#495057';
            }
        });
    });
    
    // Limpiar campos cada 3 segundos durante los primeros 15 segundos
    let limpiezaCount1 = 0;
    const limpiezaInterval1 = setInterval(() => {
        limpiarFormularios();
        limpiezaCount1++;
        if (limpiezaCount1 >= 5) {
            clearInterval(limpiezaInterval1);
        }
    }, 3000);
    
    // Limpiar campos cuando el usuario hace focus en cualquier input
    document.addEventListener('focusin', function(event) {
        if (event.target.tagName === 'INPUT') {
            setTimeout(() => {
                if (event.target.value && (
                    event.target.value.includes('joelantoniopool@gmail.com') ||
                    event.target.value.includes('••••••••') ||
                    event.target.value.includes('Fermina puc tun')
                )) {
                    event.target.value = '';
                    event.target.setAttribute('autocomplete', 'off');
                }
            }, 100);
        }
    });
    
    // Forzar limpieza adicional después de 1 segundo
    setTimeout(() => {
        limpiarFormularios();
        // Limpiar específicamente los campos problemáticos
        const camposProblematicos = [
            'nombre', 'correo', 'password', 'confirm-password',
            'correo-login', 'password-login',
            'email-empleado', 'password-empleado'
        ];
        
        camposProblematicos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.value = '';
                campo.setAttribute('autocomplete', 'off');
                campo.removeAttribute('value');
            }
        });
    }, 1000);
    
    // Limpieza adicional cada 5 segundos durante los primeros 30 segundos
    let limpiezaCount2 = 0;
    const limpiezaInterval2 = setInterval(() => {
        if (limpiezaCount2 < 6) {
            limpiarFormularios();
            limpiezaCount2++;
        } else {
            clearInterval(limpiezaInterval2);
        }
    }, 5000);
    
    // Limpiar campos cuando se detecte acceso desde file://
    if (window.location.protocol === 'file:') {
        alert('⚠️ ADVERTENCIA: Estás accediendo desde un archivo local.\n\nPara evitar errores de CORS, por favor:\n\n1. Ve a: http://localhost:3002\n2. O abre el archivo index.html en la raíz\n\nEsto solucionará los errores de red.');
        
        // Intentar redirigir automáticamente
        setTimeout(() => {
            window.location.href = 'http://localhost:3002';
        }, 2000);
    }
});

// Función para limpiar todos los formularios
function limpiarFormularios() {
    // Limpiar formulario de login de dueño
    if (loginForm) {
        loginForm.reset();
        const inputs = loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
            input.blur();
            // Forzar limpieza adicional
            input.setAttribute('value', '');
            input.removeAttribute('value');
            input.setAttribute('autocomplete', 'off');
        });
    }
    
    // Limpiar formulario de registro de dueño
    if (registerForm) {
        registerForm.reset();
        const inputs = registerForm.querySelectorAll('input');
        inputs.forEach(input => {
            // Limpiar inmediatamente
            input.value = '';
            input.blur();
            // Forzar limpieza adicional
            input.setAttribute('value', '');
            input.removeAttribute('value');
            input.setAttribute('autocomplete', 'off');
        });
        
        // Limpiar específicamente los campos del formulario de registro
        const nombreInput = document.getElementById('nombre');
        const correoInput = document.getElementById('correo');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        if (nombreInput) {
            nombreInput.value = '';
            nombreInput.setAttribute('autocomplete', 'off');
            nombreInput.removeAttribute('value');
        }
        if (correoInput) {
            correoInput.value = '';
            correoInput.setAttribute('autocomplete', 'off');
            correoInput.removeAttribute('value');
        }
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.setAttribute('autocomplete', 'off');
            passwordInput.removeAttribute('value');
        }
        if (confirmPasswordInput) {
            confirmPasswordInput.value = '';
            confirmPasswordInput.setAttribute('autocomplete', 'off');
            confirmPasswordInput.removeAttribute('value');
        }
    }
    
    // Limpiar formulario de login de empleado
    if (employeeLoginForm) {
        employeeLoginForm.reset();
        const inputs = employeeLoginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
            input.blur();
            // Forzar limpieza adicional
            input.setAttribute('value', '');
            input.removeAttribute('value');
            input.setAttribute('autocomplete', 'off');
        });
    }
    
    // Limpiar campos específicos que pueden estar pre-llenados
    const camposPreLlenados = [
        'joelantoniopool@gmail.com',
        '••••••••',
        'Fermina puc tun'
    ];
    
    document.querySelectorAll('input').forEach(input => {
        if (camposPreLlenados.includes(input.value)) {
            input.value = '';
            input.style.color = '#495057';
            // Forzar limpieza adicional
            input.setAttribute('value', '');
            input.removeAttribute('value');
            input.setAttribute('autocomplete', 'off');
        }
    });
    
    // Limpiar también cualquier campo que pueda tener datos pre-llenados
    const todosLosInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    todosLosInputs.forEach(input => {
        if (input.value && (input.value.includes('joelantoniopool@gmail.com') || 
                           input.value.includes('••••••••') || 
                           input.value.includes('Fermina puc tun'))) {
            input.value = '';
            input.setAttribute('autocomplete', 'off');
            input.removeAttribute('value');
        }
    });
}

// Funciones de navegación
function mostrarRegistroDueno() {
    ocultarTodasLasPantallas();
    document.getElementById('pantalla-registro-dueno').classList.remove('d-none');
}

function mostrarLoginDueno() {
    ocultarTodasLasPantallas();
    document.getElementById('pantalla-login-dueno').classList.remove('d-none');
}

function mostrarLoginEmpleado() {
    ocultarTodasLasPantallas();
    document.getElementById('pantalla-login-empleado').classList.remove('d-none');
}

function volverInicio() {
    ocultarTodasLasPantallas();
    document.getElementById('pantalla-seleccion').classList.remove('d-none');
}

function ocultarTodasLasPantallas() {
    const pantallas = [
        'pantalla-seleccion',
        'pantalla-registro-dueno',
        'pantalla-login-dueno',
        'pantalla-login-empleado',
        'dashboard-dueno',
        'dashboard-empleado'
    ];
    
    pantallas.forEach(pantalla => {
        document.getElementById(pantalla).classList.add('d-none');
    });
}

// Funciones de autenticación
async function registrarDueno(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validar que los campos no estén vacíos
    if (!nombre || !correo || !password) {
        mostrarNotificacion('Todos los campos son requeridos', 'error');
        return;
    }
    
    // Validar que los campos no estén vacíos
    if (!nombre || !correo || !password) {
        mostrarNotificacion('Todos los campos son requeridos', 'error');
        return;
    }
    
    // Validar que los campos no sean solo espacios en blanco
    if (!nombre.trim() || !correo.trim() || !password.trim()) {
        mostrarNotificacion('Por favor ingresa datos válidos en todos los campos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/registrar-dueno`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, correo, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Limpiar formularios antes de mostrar notificación
            limpiarFormularios();
            
            // Limpiar también el formulario específico
            const formulario = e.target;
            if (formulario) {
                formulario.reset();
                const inputs = formulario.querySelectorAll('input');
                inputs.forEach(input => {
                    input.value = '';
                    input.setAttribute('autocomplete', 'off');
                    input.removeAttribute('value');
                });
            }
            
            mostrarNotificacion('Dueño registrado exitosamente', 'success');
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('usuario', JSON.stringify(data.data));
            
            // Pequeño delay para que se vea la notificación antes de redirigir
            setTimeout(() => {
                iniciarSesionDueno(data.data);
            }, 1500);
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error al registrar dueño', 'error');
    }
}

async function loginDueno(e) {
    e.preventDefault();
    
    const correo = document.getElementById('correo-login').value;
    const password = document.getElementById('password-login').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login-dueno`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Inicio de sesión exitoso', 'success');
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('usuario', JSON.stringify(data.data));
            iniciarSesionDueno(data.data);
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error al iniciar sesión', 'error');
    }
}

async function loginEmpleado(e) {
    e.preventDefault();
    
    const email = document.getElementById('email-empleado').value;
    const password = document.getElementById('password-empleado').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login-empleado`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Inicio de sesión exitoso', 'success');
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('usuario', JSON.stringify(data.data));
            iniciarSesionEmpleado(data.data);
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error al iniciar sesión', 'error');
    }
}

async function verificarToken(tokenGuardado) {
    try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${tokenGuardado}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (data.data.tipo === 'dueno') {
                iniciarSesionDueno(usuario);
            } else {
                iniciarSesionEmpleado(usuario);
            }
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }
}

function iniciarSesionDueno(usuario) {
    usuarioActual = usuario;
    token = usuario.token;
    document.getElementById('nombre-dueno').textContent = usuario.nombre;
    ocultarTodasLasPantallas();
    document.getElementById('dashboard-dueno').classList.remove('d-none');
    mostrarDashboard();
}

function iniciarSesionEmpleado(usuario) {
    // Guardar datos en localStorage
    localStorage.setItem('token', usuario.token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    // Redirigir a la interfaz de empleado
    window.location.href = '/empleado.html';
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    usuarioActual = null;
    token = null;
    volverInicio();
}

// Funciones del dashboard del dueño
async function mostrarDashboard() {
    try {
        const response = await fetch(`${API_BASE}/duenos/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const contenido = `
                <div class="row mb-4">
                    <div class="col-12">
                        <h2><i class="fas fa-tachometer-alt"></i> Dashboard</h2>
                    </div>
                </div>
                
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="stats-card text-center">
                            <i class="fas fa-box stats-icon text-primary"></i>
                            <h3>${data.data.estadisticas.totalProductos}</h3>
                            <p class="text-muted">Productos</p>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card text-center">
                            <i class="fas fa-users stats-icon text-success"></i>
                            <h3>${data.data.estadisticas.totalEmpleados}</h3>
                            <p class="text-muted">Empleados</p>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card text-center">
                            <i class="fas fa-chart-line stats-icon text-info"></i>
                            <h3>${data.data.estadisticas.totalVentas}</h3>
                            <p class="text-muted">Ventas Totales</p>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card text-center">
                            <i class="fas fa-dollar-sign stats-icon text-warning"></i>
                            <h3>$${data.data.estadisticas.totalIngresos || 0}</h3>
                            <p class="text-muted">Ingresos Totales</p>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-history"></i> Últimas Ventas</h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Fecha</th>
                                                <th>Total</th>
                                                <th>Empleado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${data.data.ultimasVentas.map(venta => `
                                                <tr>
                                                    <td>${venta.id_venta}</td>
                                                    <td>${new Date(venta.fecha_venta).toLocaleDateString()}</td>
                                                    <td>$${venta.total}</td>
                                                    <td>${venta.nombre_empleado || 'N/A'} ${venta.apellido_empleado || ''}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-star"></i> Productos Más Vendidos</h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad Vendida</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${data.data.productosPopulares.map(producto => `
                                                <tr>
                                                    <td>${producto.nombre}</td>
                                                    <td>${producto.total_vendido}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('contenido-dashboard').innerHTML = contenido;
        }
    } catch (error) {
        mostrarNotificacion('Error al cargar dashboard', 'error');
    }
}

// Funciones de utilidad
function mostrarNotificacion(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast-notificacion');
    const titulo = document.getElementById('toast-titulo');
    const mensajeEl = document.getElementById('toast-mensaje');
    
    titulo.textContent = tipo === 'error' ? 'Error' : tipo === 'success' ? 'Éxito' : 'Información';
    mensajeEl.textContent = mensaje;
    
    toast.classList.remove('bg-success', 'bg-danger', 'bg-info');
    toast.classList.add(tipo === 'error' ? 'bg-danger' : tipo === 'success' ? 'bg-success' : 'bg-info');
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Funciones placeholder para las demás secciones
function mostrarProductos() {
    document.getElementById('contenido-dashboard').innerHTML = '<h2>Gestión de Productos</h2><p>Funcionalidad en desarrollo...</p>';
}

function mostrarEmpleados() {
    document.getElementById('contenido-dashboard').innerHTML = '<h2>Gestión de Empleados</h2><p>Funcionalidad en desarrollo...</p>';
}

function mostrarVentas() {
    document.getElementById('contenido-dashboard').innerHTML = '<h2>Gestión de Ventas</h2><p>Funcionalidad en desarrollo...</p>';
}

function mostrarMarcas() {
    document.getElementById('contenido-dashboard').innerHTML = '<h2>Gestión de Marcas</h2><p>Funcionalidad en desarrollo...</p>';
}

function mostrarProveedores() {
    document.getElementById('contenido-dashboard').innerHTML = '<h2>Gestión de Proveedores</h2><p>Funcionalidad en desarrollo...</p>';
}

function mostrarVentasEmpleado() {
    document.getElementById('contenido-empleado').innerHTML = '<h2>Nueva Venta</h2><p>Funcionalidad en desarrollo...</p>';
}

function mostrarProductosEmpleado() {
    document.getElementById('contenido-empleado').innerHTML = '<h2>Ver Productos</h2><p>Funcionalidad en desarrollo...</p>';
}

function mostrarHistorialVentas() {
    document.getElementById('contenido-empleado').innerHTML = '<h2>Historial de Ventas</h2><p>Funcionalidad en desarrollo...</p>';
} 

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
    // Limpiar notificaciones anteriores si hay muchas
    const container = document.querySelector('.container');
    const notificacionesExistentes = container.querySelectorAll('.alert');
    if (notificacionesExistentes.length > 2) {
        notificacionesExistentes.forEach((notif, index) => {
            if (index < notificacionesExistentes.length - 1) {
                notif.remove();
            }
        });
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.insertBefore(alertDiv, container.firstChild);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Registro de dueño
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const data = {
            nombre: formData.get('nombre'),
            correo: formData.get('correo'),
            password: formData.get('password')
        };
        
        // Validar que los campos no estén vacíos o con datos pre-llenados
        if (!data.nombre || data.nombre.trim() === '' || data.nombre === 'Fermina puc tun') {
            mostrarNotificacion('Por favor ingresa un nombre válido', 'error');
            return;
        }
        
        if (!data.correo || data.correo.trim() === '' || data.correo === 'joelantoniopool@gmail.com') {
            mostrarNotificacion('Por favor ingresa un correo válido', 'error');
            return;
        }
        
        if (!data.password || data.password.trim() === '' || data.password === '••••••••') {
            mostrarNotificacion('Por favor ingresa una contraseña válida', 'error');
            return;
        }
        
        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.correo)) {
            mostrarNotificacion('Por favor ingresa un correo válido', 'error');
            return;
        }
        
        // Validar longitud de contraseña
        if (data.password.length < 6) {
            mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/auth/registrar-dueno`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                mostrarNotificacion(result.message, 'success');
                registerForm.reset();
                // Cambiar a la pestaña de login
                document.getElementById('loginTab').click();
            } else {
                mostrarNotificacion(result.message, 'error');
            }
        } catch (error) {
            console.error('Error en el registro:', error);
            mostrarNotificacion('Error al registrar dueño', 'error');
        }
    });
}

// Login de dueño
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const data = {
            correo: formData.get('correo'),
            password: formData.get('password')
        };
        
        try {
            const response = await fetch(`${API_BASE}/auth/login-dueno`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Guardar token y datos del usuario
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('usuario', JSON.stringify(result.data.usuario));
                
                mostrarNotificacion('Login exitoso', 'success');
                
                // Redirigir al dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                mostrarNotificacion(result.message, 'error');
            }
        } catch (error) {
            console.error('Error en el login:', error);
            mostrarNotificacion('Error al iniciar sesión', 'error');
        }
    });
}

// Login de empleado
if (employeeLoginForm) {
    employeeLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(employeeLoginForm);
        const data = {
            email: formData.get('email'), // Se usa como nombre
            password: formData.get('password')
        };
        
        try {
            const response = await fetch(`${API_BASE}/auth/login-empleado`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Guardar token y datos del empleado
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('usuario', JSON.stringify(result.data.usuario));
                
                mostrarNotificacion('Login exitoso', 'success');
                
                // Redirigir al dashboard de empleado (si existe) o al principal
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                mostrarNotificacion(result.message, 'error');
            }
        } catch (error) {
            console.error('Error en el login de empleado:', error);
            mostrarNotificacion('Error al iniciar sesión', 'error');
        }
    });
}

// Función para cambiar entre pestañas
function cambiarPestana(pestana) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Remover clase activa de todas las pestañas
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar contenido de la pestaña seleccionada
    document.getElementById(pestana).style.display = 'block';
    
    // Agregar clase activa a la pestaña seleccionada
    event.target.classList.add('active');
} 