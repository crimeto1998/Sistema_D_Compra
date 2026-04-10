const API_URL = 'http://localhost:3000';

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function getToken() {
    return localStorage.getItem('token');
}

function getUsuario() {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.reload();
}

function renderAuthNav() {
    const container = document.getElementById('auth-nav-btn');
    if (!container) return;

    if (isLoggedIn()) {
        const usuario = getUsuario();
        container.innerHTML = `
            <div class="nav-perfil">
                <button class="btn-nav btn-perfil" onclick="toggleDropdown()">
                    👤 ${usuario ? usuario.nombre.split(' ')[0] : 'Mi Perfil'}
                    <span class="flecha">▾</span>
                </button>
                <div class="dropdown" id="dropdown-perfil" style="display:none;">
                    <p class="dropdown-email">${usuario ? usuario.email : ''}</p>
                    <hr>
                    <button onclick="logout()" class="btn-logout">Cerrar sesión</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <button class="btn-nav btn-login" onclick="abrirModal()">
                🔑 Login
            </button>
        `;
    }
}

function toggleDropdown() {
    const dd = document.getElementById('dropdown-perfil');
    if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-perfil')) {
        const dd = document.getElementById('dropdown-perfil');
        if (dd) dd.style.display = 'none';
    }
});

function abrirModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    cambiarTab(tab);
}

function cerrarModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
    limpiarErrores();
}

document.addEventListener('click', function(e) {
    const modal = document.getElementById('auth-modal');
    if (modal && e.target === modal) cerrarModal();
});

function cambiarTab(tab) {
    const tabLogin    = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin   = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (!tabLogin) return;

    if (tab === 'login') {
        tabLogin.classList.add('tab-activo');
        tabRegister.classList.remove('tab-activo');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
    } else {
        tabRegister.classList.add('tab-activo');
        tabLogin.classList.remove('tab-activo');
        formRegister.style.display = 'block';
        formLogin.style.display = 'none';
    }
    limpiarErrores();
}

function mostrarError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function limpiarErrores() {
    ['error-login', 'error-register'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.style.display = 'none'; }
    });
}

async function handleLogin() {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('btn-login-submit');

    if (!email || !password) {
        mostrarError('error-login', 'Completa todos los campos.');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Ingresando...';

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            mostrarError('error-login', data.error || 'Error al iniciar sesión.');
        } else {
            localStorage.setItem('token',   data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            cerrarModal();
            if (typeof onLoginExitoso === 'function') onLoginExitoso();
            else renderAuthNav();
        }
    } catch (err) {
        mostrarError('error-login', 'No se pudo conectar con el servidor.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Ingresar';
    }
}

async function handleRegister() {
    const nombre   = document.getElementById('reg-nombre').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm').value;
    const btn      = document.getElementById('btn-register-submit');

    if (!nombre || !email || !password || !confirm) {
        mostrarError('error-register', 'Completa todos los campos.');
        return;
    }
    if (password !== confirm) {
        mostrarError('error-register', 'Las contraseñas no coinciden.');
        return;
    }
    if (password.length < 6) {
        mostrarError('error-register', 'La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Registrando...';

    try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            mostrarError('error-register', data.error || 'Error al registrarse.');
        } else {
            localStorage.setItem('token',   data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            cerrarModal();
            if (typeof onLoginExitoso === 'function') onLoginExitoso();
            else renderAuthNav();
        }
    } catch (err) {
        mostrarError('error-register', 'No se pudo conectar con el servidor.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Crear cuenta';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderAuthNav();

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') cerrarModal();
        if (e.key === 'Enter') {
            const loginForm = document.getElementById('form-login');
            const regForm   = document.getElementById('form-register');
            if (loginForm && loginForm.style.display !== 'none')   handleLogin();
            if (regForm   && regForm.style.display !== 'none')     handleRegister();
        }
    });
});
