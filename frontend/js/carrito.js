let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function getStock() {
    return JSON.parse(localStorage.getItem('stock')) || [];
}

function mostrarCarrito() {
    const lista = document.getElementById('lista-carrito');
    lista.innerHTML = '';

    if (carrito.length === 0) {
        lista.innerHTML = '<p>⚠️ No hay productos en el carrito.</p>';
        document.getElementById('total').innerText = '$0';
        return;
    }

    carrito.forEach((item, index) => {
        const stockDisponible = getStock().find(p => p.id === item.id)?.stock || 0;
        lista.innerHTML += `
            <div class="item-carrito">
                <h3>${item.nombre}</h3>
                <p>Precio unitario: $${item.precio.toLocaleString()}</p>
                <div class="controles">
                    <button onclick="disminuir(${index})">➖</button>
                    <span>${item.cantidad}</span>
                    <button onclick="aumentar(${index})" 
                        ${stockDisponible <= 0 ? 'disabled style="opacity:0.4"' : ''}>➕</button>
                </div>
                <p>Subtotal: $${(item.precio * item.cantidad).toLocaleString()}</p>
                <button onclick="eliminar(${index})">🗑️ Eliminar</button>
            </div>
        `;
    });

    calcularTotal();
}

function aumentar(index) {
    const productos = getStock();
    const producto = productos.find(p => p.id === carrito[index].id);

    if (!producto || producto.stock <= 0) {
        alert(`⚠️ No hay más stock disponible de "${carrito[index].nombre}".`);
        return;
    }

    carrito[index].cantidad++;
    producto.stock--;
    localStorage.setItem('stock', JSON.stringify(productos));
    guardar();
}

function disminuir(index) {
    const productos = getStock();
    const producto = productos.find(p => p.id === carrito[index].id);

    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
        if (producto) producto.stock++;
    } else {
        if (producto) producto.stock++;
        carrito.splice(index, 1);
    }

    localStorage.setItem('stock', JSON.stringify(productos));
    guardar();
}

function eliminar(index) {
    const productos = getStock();
    const producto = productos.find(p => p.id === carrito[index].id);
    if (producto) producto.stock += carrito[index].cantidad;

    localStorage.setItem('stock', JSON.stringify(productos));
    carrito.splice(index, 1);
    guardar();
}

function vaciarCarrito() {
    const productos = getStock();
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) producto.stock += item.cantidad;
    });
    localStorage.setItem('stock', JSON.stringify(productos));
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