// Carrito guardado en el navegador
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Actualizar contador del carrito
function actualizarContador() {
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    document.getElementById('contador').innerText = total;
}

// Agregar producto al carrito
function agregarAlCarrito(nombre, precio) {
    const existe = carrito.find(item => item.nombre === nombre);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContador();
    alert(` ${nombre} agregado al carrito`);
}

// Actualizar contador al cargar la página
actualizarContador();