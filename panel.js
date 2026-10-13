// Interfaz y peticiones fetch al servidor.

async function cargarParticipantes() {
    const texto = document.getElementById('busqueda')?.value ?? '';
    const respuesta = await fetch(`/api/participantes?texto=${encodeURIComponent(texto)}`);
    const participantes = await respuesta.json();
    const contenedor = document.getElementById('listaParticipantes');
    if (!contenedor) return;

    contenedor.replaceChildren();
    if (participantes.length === 0) {
        contenedor.textContent = 'No hay participantes.';
        return;
    }

    for (const participante of participantes) {
        const article = document.createElement('article');
        article.className = 'participante';
        const titulo = document.createElement('h3');
        titulo.textContent = `${participante.nombre} ${participante.apellidos}`;
        const detalle = document.createElement('p');
        detalle.textContent = `${participante.email} · ${participante.tipo}`;
        const boton = document.createElement('button');
        boton.textContent = 'Añadir a la cesta';
        boton.addEventListener('click', () => anadirCesta(participante.id));
        article.append(titulo, detalle, boton);
        contenedor.append(article);
    }
}

async function consultarParticipantePorId(evento) {
    evento.preventDefault();
    const id = document.getElementById('consultaId').value;
    const salida = document.getElementById('resultadoConsultaId');
    const respuesta = await fetch(`/api/participantes/${encodeURIComponent(id)}`);
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        salida.textContent = resultado.error ?? `Error ${respuesta.status}`;
        return;
    }

    salida.textContent = `${resultado.nombre} ${resultado.apellidos} · ${resultado.email} · ${resultado.tipo}`;
}

async function anadirCesta(id) {
    const respuesta = await fetch(`/api/cesta/${id}`, { method: 'POST' });
    const datos = await respuesta.json();
    if (!respuesta.ok) return alert(datos.error);
    cargarCesta();
}

async function cargarCesta() {
    const respuesta = await fetch('/api/cesta');
    const cesta = await respuesta.json();
    const contenedor = document.getElementById('cesta');
    if (!contenedor) return;
    contenedor.replaceChildren();

    if (cesta.length === 0) {
        contenedor.textContent = 'La cesta está vacía.';
        return;
    }

    for (const item of cesta) {
        const fila = document.createElement('p');
        fila.textContent = `Participante ${item.participanteId} · Cantidad: ${item.cantidad}`;
        contenedor.append(fila);
    }
}

async function cambiarTema(tema) {
    const respuesta = await fetch('/api/tema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema })
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) return alert(datos.error);
    aplicarTema(datos.tema);
}

async function cargarTema() {
    const respuesta = await fetch('/api/tema');
    const datos = await respuesta.json();
    aplicarTema(datos.tema);
}

function aplicarTema(tema) {
    document.body.classList.remove('claro', 'oscuro');
    document.body.classList.add(tema);
    const etiqueta = document.getElementById('temaActual');
    if (etiqueta) etiqueta.textContent = `Tema actual: ${tema}`;
}

async function cargarVisitas() {
    const respuesta = await fetch('/api/visitas');
    const datos = await respuesta.json();
    const etiqueta = document.getElementById('visitas');
    if (etiqueta) etiqueta.textContent = `Visitas en esta sesión: ${datos.visitas}`;
}

async function guardarParticipante(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = Object.fromEntries(new FormData(formulario));
    const respuesta = await fetch('/api/participantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    const resultado = await respuesta.json();
    const mensaje = document.getElementById('mensaje');

    if (!respuesta.ok) {
        mensaje.textContent = JSON.stringify(resultado.errores ?? resultado);
        return;
    }

    mensaje.textContent = 'Participante guardado.';
    formulario.reset();
    cargarParticipantes();
}

async function vaciarCesta() {
    await fetch('/api/cesta', { method: 'DELETE' });
    cargarCesta();
}

async function cargarEstadoSesion() {
    const salida = document.getElementById('estadoSesion');
    if (!salida) return;
    const respuesta = await fetch('/api/sesion');
    const datos = await respuesta.json();
    salida.textContent = JSON.stringify(datos, null, 2);
}

document.getElementById('buscar')?.addEventListener('click', cargarParticipantes);
document.getElementById('formConsultaId')?.addEventListener('submit', consultarParticipantePorId);
document.getElementById('formParticipante')?.addEventListener('submit', guardarParticipante);
document.getElementById('temaClaro')?.addEventListener('click', () => cambiarTema('claro'));
document.getElementById('temaOscuro')?.addEventListener('click', () => cambiarTema('oscuro'));
document.getElementById('vaciarCesta')?.addEventListener('click', vaciarCesta);
document.getElementById('actualizar')?.addEventListener('click', cargarEstadoSesion);

cargarParticipantes();
cargarCesta();
cargarTema();
cargarVisitas();
cargarEstadoSesion();