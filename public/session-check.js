// Verificación de sesión
function verificarSesion() {
    console.log('🔍 Verificando sesión...');
    
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    console.log('Token:', token ? '✅ Presente' : '❌ Ausente');
    console.log('Usuario:', usuario ? '✅ Presente' : '❌ Ausente');
    
    if (!token) {
        console.log('❌ No hay token, redirigiendo al login...');
        window.location.href = '/';
        return false;
    }
    
    if (!usuario) {
        console.log('❌ No hay usuario, limpiando sesión...');
        localStorage.removeItem('token');
        window.location.href = '/';
        return false;
    }
    
    try {
        const usuarioObj = JSON.parse(usuario);
        console.log('👤 Usuario:', usuarioObj);
        
        // Verificar tipo de usuario
        if (usuarioObj.tipo === 'empleado' || usuarioObj.id_empleado) {
            console.log('👤 Usuario es empleado');
            if (window.location.pathname !== '/empleado.html') {
                window.location.href = '/empleado.html';
                return false;
            }
        } else if (usuarioObj.tipo === 'dueno' || usuarioObj.id_dueno) {
            console.log('👑 Usuario es dueño');
            if (window.location.pathname !== '/dashboard.html') {
                window.location.href = '/dashboard.html';
                return false;
            }
        } else {
            console.log('❓ Tipo de usuario no determinado');
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/';
            return false;
        }
        
        console.log('✅ Sesión válida');
        return true;
        
    } catch (error) {
        console.error('❌ Error al parsear usuario:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/';
        return false;
    }
}

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Solo verificar si no estamos en la página de login
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        verificarSesion();
    }
});

// Función para cerrar sesión
function cerrarSesion() {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/';
}

// Exportar funciones para uso global
window.verificarSesion = verificarSesion;
window.cerrarSesion = cerrarSesion; 