// Datos de ejemplo con los que arranca la API. Los marcadores son inventados:
// sirven para que la tabla tenga puntos desde el primer momento y para que
// queden partidos pendientes donde pronosticar en la demostración.
import { ESTADOS_PARTIDO } from '../logica/estados.js';

export const partidosIniciales = [
  { id: 1, fase: 'Fecha 1', equipoLocal: 'Colombia', equipoVisitante: 'Japón', estado: ESTADOS_PARTIDO.FINALIZADO, resultado: { local: 2, visitante: 1 } },
  { id: 2, fase: 'Fecha 1', equipoLocal: 'Brasil', equipoVisitante: 'Marruecos', estado: ESTADOS_PARTIDO.FINALIZADO, resultado: { local: 1, visitante: 1 } },
  { id: 3, fase: 'Fecha 1', equipoLocal: 'Argentina', equipoVisitante: 'México', estado: ESTADOS_PARTIDO.FINALIZADO, resultado: { local: 3, visitante: 0 } },
  { id: 4, fase: 'Fecha 2', equipoLocal: 'Colombia', equipoVisitante: 'Brasil', estado: ESTADOS_PARTIDO.PENDIENTE, resultado: null },
  { id: 5, fase: 'Fecha 2', equipoLocal: 'España', equipoVisitante: 'Argentina', estado: ESTADOS_PARTIDO.PENDIENTE, resultado: null },
  { id: 6, fase: 'Fecha 2', equipoLocal: 'Francia', equipoVisitante: 'Japón', estado: ESTADOS_PARTIDO.PENDIENTE, resultado: null }
];

export const pronosticosIniciales = [
  { id: 1, participante: 'Camila', partidoId: 1, marcador: { local: 1, visitante: 0 } },
  { id: 2, participante: 'Camila', partidoId: 2, marcador: { local: 1, visitante: 1 } },
  { id: 3, participante: 'Camila', partidoId: 3, marcador: { local: 3, visitante: 0 } },
  { id: 4, participante: 'Andrés', partidoId: 1, marcador: { local: 0, visitante: 0 } },
  { id: 5, participante: 'Andrés', partidoId: 2, marcador: { local: 2, visitante: 2 } },
  { id: 6, participante: 'Andrés', partidoId: 3, marcador: { local: 1, visitante: 0 } },
  { id: 7, participante: 'Valentina', partidoId: 1, marcador: { local: 2, visitante: 1 } },
  { id: 8, participante: 'Valentina', partidoId: 2, marcador: { local: 0, visitante: 1 } },
  { id: 9, participante: 'Valentina', partidoId: 3, marcador: { local: 2, visitante: 0 } },
  { id: 10, participante: 'Valentina', partidoId: 4, marcador: { local: 2, visitante: 1 } }
];
