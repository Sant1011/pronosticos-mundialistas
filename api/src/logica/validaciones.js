// Validaciones de lo que llega del cliente. Devuelven el mensaje de error, o
// null si los datos están bien. La ruta decide qué código HTTP responder.
import { ESTADOS_PARTIDO } from './estados.js';

// El marcador más abultado en la historia de los Mundiales es 10-1 (Hungría vs.
// El Salvador, 1982). 20 deja margen sin aceptar valores absurdos.
export const MAX_GOLES = 20;
export const LONGITUD_MINIMA_NOMBRE = 2;
export const LONGITUD_MAXIMA_NOMBRE = 30;

export function esGolValido(valor) {
  // Number(null), Number('') y Number(false) dan 0: hay que descartarlos antes.
  if (valor === null || valor === undefined || valor === '' || typeof valor === 'boolean') {
    return false;
  }
  const goles = Number(valor);
  return Number.isInteger(goles) && goles >= 0 && goles <= MAX_GOLES;
}

function validarMarcador(datos) {
  if (!esGolValido(datos.golesLocal) || !esGolValido(datos.golesVisitante)) {
    return `Los goles deben ser números enteros entre 0 y ${MAX_GOLES}`;
  }
  return null;
}

export function validarPronostico(datos, partido) {
  const { participante } = datos ?? {};
  const largo = typeof participante === 'string' ? participante.trim().length : 0;
  if (largo < LONGITUD_MINIMA_NOMBRE || largo > LONGITUD_MAXIMA_NOMBRE) {
    return `El participante debe tener entre ${LONGITUD_MINIMA_NOMBRE} y ${LONGITUD_MAXIMA_NOMBRE} caracteres`;
  }

  if (!partido) return 'El partido indicado no existe';

  const errorMarcador = validarMarcador(datos);
  if (errorMarcador) return errorMarcador;

  if (partido.estado === ESTADOS_PARTIDO.FINALIZADO) {
    return 'Ese partido ya se jugó: solo se aceptan pronósticos de partidos pendientes';
  }
  return null;
}

export function validarResultado(datos, partido) {
  const errorMarcador = validarMarcador(datos ?? {});
  if (errorMarcador) return errorMarcador;

  if (partido.estado === ESTADOS_PARTIDO.FINALIZADO) {
    return 'Ese partido ya tiene un resultado registrado';
  }
  return null;
}

export function aMarcador({ golesLocal, golesVisitante }) {
  return { local: Number(golesLocal), visitante: Number(golesVisitante) };
}
