import { describe, it, expect } from 'vitest';
import { esGolValido, validarPronostico, validarResultado, MAX_GOLES } from './validaciones.js';
import { ESTADOS_PARTIDO } from './estados.js';

const partidoPendiente = { id: 4, estado: ESTADOS_PARTIDO.PENDIENTE, resultado: null };
const partidoFinalizado = { id: 1, estado: ESTADOS_PARTIDO.FINALIZADO, resultado: { local: 2, visitante: 1 } };
const pronosticoValido = { participante: 'Profe', partidoId: 4, golesLocal: 2, golesVisitante: 1 };

describe('esGolValido', () => {
  it('acepta 0 y el máximo permitido (casos límite)', () => {
    expect(esGolValido(0)).toBe(true);
    expect(esGolValido(MAX_GOLES)).toBe(true);
  });

  it('rechaza un gol por encima del máximo', () => {
    expect(esGolValido(MAX_GOLES + 1)).toBe(false);
  });

  it('rechaza goles negativos, decimales y texto', () => {
    expect(esGolValido(-1)).toBe(false);
    expect(esGolValido(1.5)).toBe(false);
    expect(esGolValido('abc')).toBe(false);
  });

  it('rechaza null, vacío y booleanos aunque Number() los convierta en 0', () => {
    expect(esGolValido(null)).toBe(false);
    expect(esGolValido('')).toBe(false);
    expect(esGolValido(false)).toBe(false);
  });
});

describe('validarPronostico', () => {
  it('no devuelve error con datos correctos', () => {
    expect(validarPronostico(pronosticoValido, partidoPendiente)).toBeNull();
  });

  it('rechaza un participante sin nombre', () => {
    expect(validarPronostico({ ...pronosticoValido, participante: '   ' }, partidoPendiente)).toMatch(/participante/);
  });

  it('rechaza un partido que no existe', () => {
    expect(validarPronostico(pronosticoValido, undefined)).toMatch(/no existe/);
  });

  it('rechaza goles inválidos', () => {
    expect(validarPronostico({ ...pronosticoValido, golesLocal: -1 }, partidoPendiente)).toMatch(/goles/);
  });

  it('rechaza pronosticar un partido que ya se jugó', () => {
    expect(validarPronostico(pronosticoValido, partidoFinalizado)).toMatch(/ya se jugó/);
  });

  it('rechaza un cuerpo vacío sin romperse', () => {
    expect(validarPronostico(undefined, partidoPendiente)).toMatch(/participante/);
  });
});

describe('validarResultado', () => {
  it('acepta un resultado válido para un partido pendiente', () => {
    expect(validarResultado({ golesLocal: 0, golesVisitante: 0 }, partidoPendiente)).toBeNull();
  });

  it('rechaza registrar dos veces el resultado de un partido', () => {
    expect(validarResultado({ golesLocal: 1, golesVisitante: 0 }, partidoFinalizado)).toMatch(/ya tiene un resultado/);
  });
});
