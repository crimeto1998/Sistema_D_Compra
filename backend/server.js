const express  = require('express');
const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const cors     = require('cors');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'grupo3_los_master_prohacker';

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sistema_compras',
    password: 'Rocko306',
    port: 5432,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conectado a PostgreSQL correctamente');
        release();
    }
});

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requerido. Debes iniciar sesión.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded; 
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
}

app.get('/', (req, res) => {
    res.json({ mensaje: '¡Servidor funcionando correctamente!' });
});

app.post('/api/auth/register', async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const existe = await pool.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email.toLowerCase().trim()]
        );
        if (existe.rows.length > 0) {
            return res.status(409).json({ error: 'Este email ya está registrado.' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const resultado = await pool.query(
            `INSERT INTO usuarios (nombre, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, nombre, email, created_at`,
            [nombre.trim(), email.toLowerCase().trim(), password_hash]
        );

        const usuario = resultado.rows[0];

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente.',
            token,
            usuario: {
                id:     usuario.id,
                nombre: usuario.nombre,
                email:  usuario.email,
            }
        });

    } catch (err) {
        console.error('Error en /register:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

    try {
        const resultado = await pool.query(
            'SELECT id, nombre, email, password_hash FROM usuarios WHERE email = $1',
            [email.toLowerCase().trim()]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        const usuario = resultado.rows[0];

        const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordCorrecta) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: `Bienvenido, ${usuario.nombre} sos el propio carechimbote!`,
            token,
            usuario: {
                id:     usuario.id,
                nombre: usuario.nombre,
                email:  usuario.email,
            }
        });

    } catch (err) {
        console.error('Error en /login:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.get('/api/auth/me', verificarToken, async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT id, nombre, email, created_at FROM usuarios WHERE id = $1',
            [req.usuario.id]
        );
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json({ usuario: resultado.rows[0] });
    } catch (err) {
        console.error('Error en /me:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Endpoints disponibles:`);
    console.log(`   GET  /`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/auth/me  (requiere token)`);
});