import { describe, it, expect } from 'vitest';
import {
  obtenerDesenlace,
  DESENLACES,
  calcularPuntos,
  construirTabla,
  anotarPuntos,
  PUNTOS_MARCADOR_EXACTO,
  PUNTOS_RESULTADO,
  PUNTOS_FALLO
} from './reglas-pronosticos.js';
import { ESTADOS_PARTIDO } from './estados.js';

const marcador = (local, visitante) => ({ local, visitante });

describe('obtenerDesenlace', () => {
  it('gana el local cuando hace más goles', () => {
    expect(obtenerDesenlace(marcador(2, 1))).toBe(DESENLACES.LOCAL);
  });

  it('gana el visitante cuando hace más goles', () => {
    expect(obtenerDesenlace(marcador(0, 1))).toBe(DESENLACES.VISITANTE);
  });

  it('es empate cuando los goles son iguales (la frontera)', () => {
    expect(obtenerDesenlace(marcador(1, 1))).toBe(DESENLACES.EMPATE);
  });
});

describe('calcularPuntos', () => {
  it('da los puntos de marcador exacto cuando se acierta el marcador', () => {
    expect(calcularPuntos(marcador(2, 1), marcador(2, 1))).toBe(PUNTOS_MARCADOR_EXACTO);
  });

  it('da los puntos de resultado cuando se acierta el ganador pero no el marcador', () => {
    expect(calcularPuntos(marcador(1, 0), marcador(3, 1))).toBe(PUNTOS_RESULTADO);
  });

  it('da los puntos de resultado cuando se acierta un empate con otro marcador', () => {
    expect(calcularPuntos(marcador(1, 1), marcador(2, 2))).toBe(PUNTOS_RESULTADO);
  });

  it('no da puntos cuando se falla el ganador', () => {
    expect(calcularPuntos(marcador(0, 2), marcador(1, 0))).toBe(PUNTOS_FALLO);
  });

  it('no da puntos a quien pronosticó empate si ganó el local', () => {
    expect(calcularPuntos(marcador(1, 1), marcador(2, 1))).toBe(PUNTOS_FALLO);
  });

  it('da los puntos de marcador exacto en un 0-0 (caso límite)', () => {
    expect(calcularPuntos(marcador(0, 0), marcador(0, 0))).toBe(PUNTOS_MARCADOR_EXACTO);
  });

  it('no confunde un marcador invertido con un acierto', () => {
    expect(calcularPuntos(marcador(1, 2), marcador(2, 1))).toBe(PUNTOS_FALLO);
  });
});

describe('anotarPuntos', () => {
  it('deja los puntos en null si el partido todavía no se juega', () => {
    const partidos = [{ id: 1, estado: ESTADOS_PARTIDO.PENDIENTE, resultado: null }];
    const pronosticos = [{ id: 1, participante: 'Ana', partidoId: 1, marcador: marcador(1, 0) }];

    expect(anotarPuntos(pronosticos, partidos)[0].puntos).toBeNull();
  });
});

describe('construirTabla', () => {
  const partidos = [
    { id: 1, estado: ESTADOS_PARTIDO.FINALIZADO, resultado: marcador(2, 1) },
    { id: 2, estado: ESTADOS_PARTIDO.FINALIZADO, resultado: marcador(0, 0) },
    { id: 3, estado: ESTADOS_PARTIDO.PENDIENTE, resultado: null }
  ];

  it('devuelve una tabla vacía si no hay pronósticos (caso límite)', () => {
    expect(construirTabla([], partidos)).toEqual([]);
  });

  it('suma los puntos de cada participante y ordena de mayor a menor', () => {
    const pronosticos = [
      { id: 1, participante: 'Luis', partidoId: 1, marcador: marcador(1, 0) }, // resultado
      { id: 2, participante: 'Ana', partidoId: 1, marcador: marcador(2, 1) }, // exacto
      { id: 3, participante: 'Ana', partidoId: 2, marcador: marcador(1, 1) } // resultado
    ];

    const tabla = construirTabla(pronosticos, partidos);

    expect(tabla.map((fila) => [fila.posicion, fila.participante, fila.puntos])).toEqual([
      [1, 'Ana', PUNTOS_MARCADOR_EXACTO + PUNTOS_RESULTADO],
      [2, 'Luis', PUNTOS_RESULTADO]
    ]);
  });

  it('a igualdad de puntos, gana quien tiene más marcadores exactos', () => {
    const tresJugados = [
      { id: 1, estado: ESTADOS_PARTIDO.FINALIZADO, resultado: marcador(2, 1) },
      { id: 2, estado: ESTADOS_PARTIDO.FINALIZADO, resultado: marcador(0, 0) },
      { id: 3, estado: ESTADOS_PARTIDO.FINALIZADO, resultado: marcador(0, 3) }
    ];
    const pronosticos = [
      // Ana: tres aciertos de resultado, ningún exacto
      { id: 1, participante: 'Ana', partidoId: 1, marcador: marcador(1, 0) },
      { id: 2, participante: 'Ana', partidoId: 2, marcador: marcador(2, 2) },
      { id: 3, participante: 'Ana', partidoId: 3, marcador: marcador(0, 1) },
      // Zoe: un marcador exacto y dos fallos
      { id: 4, participante: 'Zoe', partidoId: 1, marcador: marcador(2, 1) },
      { id: 5, participante: 'Zoe', partidoId: 2, marcador: marcador(1, 0) },
      { id: 6, participante: 'Zoe', partidoId: 3, marcador: marcador(1, 0) }
    ];

    const tabla = construirTabla(pronosticos, tresJugados);

    expect(tabla[0].puntos).toBe(tabla[1].puntos);
    expect(tabla.map((fila) => fila.participante)).toEqual(['Zoe', 'Ana']);
  });

  it('cuenta como la misma persona un nombre escrito con otras mayúsculas o espacios', () => {
    const pronosticos = [
      { id: 1, participante: 'Camila', partidoId: 1, marcador: marcador(2, 1) },
      { id: 2, participante: '  CAMILA ', partidoId: 2, marcador: marcador(0, 0) }
    ];

    const tabla = construirTabla(pronosticos, partidos);

    expect(tabla).toHaveLength(1);
    expect(tabla[0].puntos).toBe(PUNTOS_MARCADOR_EXACTO * 2);
  });

  it('incluye con 0 puntos a quien solo pronosticó partidos pendientes', () => {
    const pronosticos = [{ id: 1, participante: 'Profe', partidoId: 3, marcador: marcador(2, 0) }];

    expect(construirTabla(pronosticos, partidos)).toEqual([
      { posicion: 1, id: 'profe', participante: 'Profe', puntos: 0, exactos: 0, aciertos: 0, pronosticos: 1 }
    ]);
  });
});
