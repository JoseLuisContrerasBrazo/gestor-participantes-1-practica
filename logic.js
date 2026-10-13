// Funciones de lógica separadas de las rutas.

export function buscarParticipante(participantes, id) {
    return participantes.find(participante => participante.id === id);
}

export function filtrarParticipantes(participantes, texto) {
    const busqueda = String(texto ?? '').trim().toLowerCase();

    if (busqueda === '') return [...participantes];

    return participantes.filter(participante => {
        const nombre = `${participante.nombre} ${participante.apellidos}`.toLowerCase();
        return nombre.includes(busqueda)
            || participante.email.toLowerCase().includes(busqueda)
            || participante.tipo.toLowerCase().includes(busqueda);
    });
}

export function validarParticipante(participante) {
    const errores = {};

    if (participante.nombre.length < 2) {
        errores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    if (participante.apellidos.length < 2) {
        errores.apellidos = 'Los apellidos son obligatorios';
    }
    if (!participante.email.includes('@')) {
        errores.email = 'El correo no parece válido';
    }
    if (!['Alumno', 'Profesor'].includes(participante.tipo)) {
        errores.tipo = 'Selecciona Alumno o Profesor';
    }

    return errores;
}

export function siguienteId(participantes) {
    if (participantes.length === 0) return 1;
    return Math.max(...participantes.map(participante => participante.id)) + 1;
}