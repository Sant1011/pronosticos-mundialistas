// Reglas del juego de pronósticos. Nada en este archivo sabe que existe HTTP: recibe datos y
// devuelve datos. Por eso se puede probar sin levantar el servidor.
import { ESTADOS_PARTIDO } from './estados.js';

// Puntaje del reglamento del juego: acertar el marcador exacto vale más que
// acertar solo quién gana (o que hay empate). Si cambia el reglamento, cambia
// aquí y en ninguna otra parte: el front recibe los puntos ya calculados.
export const PUNTOS_MARCADOR_EXACTO = 3;
export const PUNTOS_RESULTADO = 1;
export const PUNTOS_FALLO = 0;

export const DESENLACES = Object.freeze({
  LOCAL: 'local',
  VISITANTE: 'visitante',
  EMPATE: 'empate'
});

export function obtenerDesenlace({ local, visitante }) {
  if (local > visitante) return DESENLACES.LOCAL;
  if (local < visitante) return DESENLACES.VISITANTE;
  return DESENLACES.EMPATE;
}

export function calcularPuntos(pronostico, resultado) {
  const marcadorExacto =
    pronostico.local === resultado.local && pronostico.visitante === resultado.visitante;
  if (marcadorExacto) return PUNTOS_MARCADOR_EXACTO;

  if (obtenerDesenlace(pronostico) === obtenerDesenlace(resultado)) return PUNTOS_RESULTADO;

  return PUNTOS_FALLO;
}

// "Camila", " camila" y "CAMILA" son la misma persona en la tabla.
export function normalizarNombre(nombre) {
  return nombre.trim().toLowerCase();
}

// Cada pronóstico sale con sus puntos; null mientras el partido no se haya jugado.
export function anotarPuntos(pronosticos, partidos) {
  const partidosPorId = new Map(partidos.map((partido) => [partido.id, partido]));

  return pronosticos.map((pronostico) => {
    const partido = partidosPorId.get(pronostico.partidoId);
    const jugado = partido?.estado === ESTADOS_PARTIDO.FINALIZADO;
    return {
      ...pronostico,
      puntos: jugado ? calcularPuntos(pronostico.marcador, partido.resultado) : null
    };
  });
}

// Desempate: más puntos, luego más marcadores exactos, luego orden alfabético
// para que la tabla salga siempre igual con los mismos datos.
function compararFilas(a, b) {
  return (
    b.puntos - a.puntos ||
    b.exactos - a.exactos ||
    a.participante.localeCompare(b.participante, 'es')
  );
}

export function construirTabla(pronosticos, partidos) {
  const filas = new Map();

  for (const pronostico of anotarPuntos(pronosticos, partidos)) {
    const id = normalizarNombre(pronostico.participante);
    if (!filas.has(id)) {
      filas.set(id, {
        id,
        participante: pronostico.participante.trim(),
        puntos: 0,
        exactos: 0,
        aciertos: 0,
        pronosticos: 0
      });
    }

    const fila = filas.get(id);
    fila.pronosticos += 1;
    if (pronostico.puntos === null) continue;

    fila.puntos += pronostico.puntos;
    if (pronostico.puntos === PUNTOS_MARCADOR_EXACTO) fila.exactos += 1;
    if (pronostico.puntos === PUNTOS_RESULTADO) fila.aciertos += 1;
  }

  return [...filas.values()]
    .sort(compararFilas)
    .map((fila, indice) => ({ posicion: indice + 1, ...fila }));
}
