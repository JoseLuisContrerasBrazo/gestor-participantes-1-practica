import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { filtrarParticipantes, buscarParticipante, validarParticipante, siguienteId } from './logic.js';
import { temaValido } from './cookies.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('.'));

app.use(session({
    name: 'gestor.sid',
    secret: process.env.SESSION_SECRET || 'secreto-local',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 30 * 60 * 1000
    }
}));

const participantes = [
    { id: 1, nombre: 'Carlos', apellidos: 'García López', email: 'carlos@example.com', tipo: 'Alumno' },
    { id: 2, nombre: 'Ana', apellidos: 'Martínez Ruiz', email: 'ana@example.com', tipo: 'Profesor' },
    { id: 3, nombre: 'Luis', apellidos: 'Sánchez Pérez', email: 'luis@example.com', tipo: 'Alumno' }
];

app.get('/api/participantes', (req, res) => {
    const texto = String(req.query.texto ?? '').trim();
    return res.json(filtrarParticipantes(participantes, texto));
});

app.get('/api/participantes/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'ID no válido' });

    const participante = buscarParticipante(participantes, id);
    if (!participante) return res.status(404).json({ error: 'Participante no encontrado' });

    return res.json(participante);
});

app.post('/api/participantes', (req, res) => {
    const participante = {
        nombre: String(req.body.nombre ?? '').trim(),
        apellidos: String(req.body.apellidos ?? '').trim(),
        email: String(req.body.email ?? '').trim(),
        tipo: String(req.body.tipo ?? '').trim()
    };

    const errores = validarParticipante(participante);
    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ errores, valores: participante });
    }

    participante.id = siguienteId(participantes);
    participantes.push(participante);
    return res.status(201).json(participante);
});

// Contador de visitas guardado en sesión
app.get('/api/visitas', (req, res) => {
    req.session.visitas = Number(req.session.visitas ?? 0) + 1;
    return res.json({ visitas: req.session.visitas });
});

// Preferencia de tema guardada en cookie
app.get('/api/tema', (req, res) => {
    const recibido = String(req.cookies.tema ?? '');
    const tema = temaValido(recibido) ? recibido : 'claro';
    return res.json({ tema });
});

app.post('/api/tema', (req, res) => {
    const tema = String(req.body.tema ?? '');
    if (!temaValido(tema)) return res.status(400).json({ error: 'Tema no válido' });

    res.cookie('tema', tema, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    });

    return res.status(303).json({ mensaje: 'Tema guardado', tema });
});

// Cesta mínima en sesión: identificadores y cantidades
app.get('/api/cesta', (req, res) => {
    return res.json(req.session.cesta ?? []);
});

app.post('/api/cesta/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID no válido' });
    }

    if (!buscarParticipante(participantes, id)) {
        return res.status(404).json({ error: 'Participante no encontrado' });
    }

    const cesta = req.session.cesta ?? [];
    const linea = cesta.find(item => item.participanteId === id);

    if (linea) {
        linea.cantidad += 1;
    } else {
        cesta.push({ participanteId: id, cantidad: 1 });
    }

    req.session.cesta = cesta;
    return res.status(201).json({ mensaje: 'Añadido a la cesta', cesta });
});

app.delete('/api/cesta', (req, res) => {
    req.session.cesta = [];
    return res.json({ mensaje: 'Cesta vaciada' });
});

app.get('/api/sesion', (req, res) => {
    return res.json({
        visitas: req.session.visitas ?? 0,
        cesta: req.session.cesta ?? []
    });
});

app.listen(PORT, () => {
    console.log(`Servidor disponible en http://localhost:${PORT}`);
});