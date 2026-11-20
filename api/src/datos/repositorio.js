// De aquí salen y aquí se guardan los datos. Por ahora viven en memoria: al
// reiniciar la API vuelven a la semilla. Las funciones son async para que el día
// que se cambie a una base de datos real las rutas no tengan que tocarse.
import { partidosIniciales, pronosticosIniciales } from './semilla.js';
import { ESTADOS_PARTIDO } from '../logica/estados.js';
import { normalizarNombre } from '../logica/reglas-pronosticos.js';

const partidos = structuredClone(partidosIniciales);
const pronosticos = structuredClone(pronosticosIniciales);
let siguienteIdPronostico = pronosticos.length + 1;

export async function listarPartidos() {
  return partidos;
}

export async function buscarPartido(id) {
  return partidos.find((partido) => partido.id === id);
}

export async function guardarResultado(id, resultado) {
  const partido = await buscarPartido(id);
  partido.resultado = resultado;
  partido.estado = ESTADOS_PARTIDO.FINALIZADO;
  return partido;
}

export async function listarPronosticos() {
  return pronosticos;
}

export async function buscarPronostico(participante, partidoId) {
  const nombre = normalizarNombre(participante);
  return pronosticos.find(
    (pronostico) =>
      pronostico.partidoId === partidoId && normalizarNombre(pronostico.participante) === nombre
  );
}

export async function agregarPronostico({ participante, partidoId, marcador }) {
  const nuevo = {
    id: siguienteIdPronostico++,
    participante: participante.trim(),
    partidoId,
    marcador
  };
  pronosticos.push(nuevo);
  return nuevo;
}
