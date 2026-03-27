let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function mostrarCarrito() {
    const lista = document.getElementById('lista-carrito');
    lista.innerHTML = '';

    if (carrito.length === 0) {
        lista.innerHTML = '<p>No hay productos en el carrito</p>';
        document.getElementById('total').innerText = '$0';
        return;
    }

    carrito.forEach((item, index) => {
        lista.innerHTML += `
            <div class="item-carrito">
                <h3>${item.nombre}</h3>
                <p>Precio: $${item.precio.toLocaleString()}</p>
                <div class="controles">
                    <button onclick="disminuir(${index})">➖</button>
                    <span>${item.cantidad}</span>
                    <button onclick="aumentar(${index})">➕</button>
                </div>
                <p>Subtotal: $${(item.precio * item.cantidad).toLocaleString()}</p>
                <button onclick="eliminar(${index})">🗑️ Eliminar</button>
            </div>
        `;
    });

    calcularTotal();
}

function aumentar(index) {
    carrito[index].cantidad++;
    guardar();
}

function disminuir(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1);
    }
    guardar();
}

function eliminar(index) {
    carrito.splice(index, 1);
    guardar();
}

function vaciarCarrito() {
    carrito = [];
    guardar();
}

function calcularTotal() {
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('total').innerText = '$' + total.toLocaleString();
}

function guardar() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

mostrarCarrito();