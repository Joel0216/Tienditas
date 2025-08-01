// Configuración de la API
const API_BASE = '/api';

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const employeeLoginForm = document.getElementById('employeeLoginForm');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando aplicación...');
    
    // Verificar si ya hay una sesión activa
    const token = localStorage.getItem('token');
    if (token) {
        console.log('✅ Sesión activa detectada, redirigiendo...');
        window.location.href = '/dashboard.html';
        return;
    }

    // Configurar event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', loginDueno);
        console.log('✅ Event listener para login configurado');
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', registrarDueno);
        console.log('✅ Event listener para registro configurado');
    }
    
    if (employeeLoginForm) {
        employeeLoginForm.addEventListener('submit', loginEmpleado);
        console.log('✅ Event listener para login de empleado configurado');
    }
    
    // Limpiar solo valores pre-llenados específicos
    setTimeout(() => {
        const preFilledValues = [
            'Fermina Puc Tun',
            'joelantoniopool@gmail.com',
            '••••••••',
            '••••••••••'
        ];
        
        document.querySelectorAll('input').forEach(input => {
            if (preFilledValues.includes(input.value)) {
                input.value = '';
                console.log('🧹 Limpiado valor pre-llenado:', input.id);
            }
        });
    }, 500);
});

// Función de login para dueños
async function loginDueno(e) {
    e.preventDefault();
    console.log('🔐 Intentando login de dueño...');
    
    const correo = document.getElementById('correo-login').value;
    const password = document.getElementById('password-login').value;
    
    // Validar campos
    if (!correo || !password) {
        mostrarNotificacion('Por favor, completa todos los campos', 'error');
        return;
    }
    
    console.log('📧 Email:', correo);
    console.log('🔑 Password:', password ? '***' : 'vacío');
    
    try {
        const response = await fetch(`${API_BASE}/auth/login-dueno`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, password })
        });
        
        const data = await response.json();
        console.log('📡 Respuesta del servidor:', data);
        
        if (data.success) {
            // Guardar datos de sesión
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('usuario', JSON.stringify(data.data));
            
            console.log('✅ Login exitoso, guardando sesión...');
            mostrarNotificacion('Inicio de sesión exitoso', 'success');
            
            // Esperar un momento antes de redirigir
            setTimeout(() => {
                console.log('🔄 Redirigiendo al dashboard...');
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            console.log('❌ Login fallido:', data.message);
            mostrarNotificacion(data.message || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
        console.error('💥 Error en login:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// Función de registro para dueños
async function registrarDueno(e) {
    e.preventDefault();
    console.log('📝 Intentando registro de dueño...');
    
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validar campos
    if (!nombre || !correo || !password || !confirmPassword) {
        mostrarNotificacion('Por favor, completa todos los campos', 'error');
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
        console.log('📡 Respuesta del registro:', data);
        
        if (data.success) {
            mostrarNotificacion('Registro exitoso. Inicia sesión.', 'success');
            
            // Limpiar formulario
            registerForm.reset();
            
            // Cambiar a pestaña de login
            setTimeout(() => {
                const loginTab = document.querySelector('[data-bs-target="#login-tab"]');
                if (loginTab) {
                    loginTab.click();
                }
            }, 1500);
        } else {
            mostrarNotificacion(data.message || 'Error en el registro', 'error');
        }
    } catch (error) {
        console.error('💥 Error en registro:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// Función de login para empleados
async function loginEmpleado(e) {
    e.preventDefault();
    console.log('👤 Intentando login de empleado...');
    
    const email = document.getElementById('email-empleado').value;
    const password = document.getElementById('password-empleado').value;
    
    // Validar campos
    if (!email || !password) {
        mostrarNotificacion('Por favor, completa todos los campos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/login-empleado`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('📡 Respuesta del login de empleado:', data);
        
        if (data.success) {
            // Guardar datos de sesión
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('usuario', JSON.stringify(data.data));
            
            console.log('✅ Login de empleado exitoso');
            mostrarNotificacion('Inicio de sesión exitoso', 'success');
            
            // Redirigir al panel de empleado
            setTimeout(() => {
                window.location.href = '/empleado.html';
            }, 1000);
        } else {
            mostrarNotificacion(data.message || 'Credenciales incorrectas', 'error');
        }
    } catch (error) {
        console.error('💥 Error en login de empleado:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    console.log(`📢 [${tipo.toUpperCase()}] ${mensaje}`);
    
    // Crear notificación visual
    const notification = document.createElement('div');
    notification.className = `alert alert-${tipo === 'error' ? 'danger' : tipo === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    notification.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insertar al inicio del body
    document.body.insertBefore(notification, document.body.firstChild);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
} 