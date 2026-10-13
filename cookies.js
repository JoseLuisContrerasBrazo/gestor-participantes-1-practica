// Funciones para la preferencia de tema.

const temasPermitidos = ['claro', 'oscuro'];

export function normalizarTema(valor) {
    return String(valor ?? '').trim().toLowerCase();
}

export function temaValido(valor) {
    // Imperfección intencionada para practicar: aquí no se usa normalizarTema().
    return temasPermitidos.includes(valor);
}