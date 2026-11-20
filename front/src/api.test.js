import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pedir, crearPronostico } from './api.js';

function respuestaFalsa(codigo, cuerpo) {
  return { ok: codigo >= 200 && codigo < 300, status: codigo, json: async () => cuerpo };
}

describe('cliente de la API', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://api.prueba');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('arma la URL con VITE_API_URL y devuelve el JSON', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuestaFalsa(200, [{ id: 1 }]));
    vi.stubGlobal('fetch', fetchFalso);

    await expect(pedir('/tabla')).resolves.toEqual([{ id: 1 }]);
    expect(fetchFalso.mock.calls[0][0]).toBe('http://api.prueba/tabla');
  });

  it('muestra el mensaje que manda la API cuando responde con error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuestaFalsa(400, { error: 'Los goles deben ser números enteros entre 0 y 20' })));

    await expect(pedir('/pronosticos')).rejects.toThrow('Los goles deben ser números enteros entre 0 y 20');
  });

  it('da un mensaje claro cuando la API está apagada', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(pedir('/tabla')).rejects.toThrow('No se pudo conectar con la API');
  });

  it('envía el pronóstico como JSON por POST', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(respuestaFalsa(201, { id: 11 }));
    vi.stubGlobal('fetch', fetchFalso);
    const datos = { participante: 'Profe', partidoId: 4, golesLocal: 2, golesVisitante: 1 };

    await crearPronostico(datos);

    const [url, opciones] = fetchFalso.mock.calls[0];
    expect(url).toBe('http://api.prueba/pronosticos');
    expect(opciones.method).toBe('POST');
    expect(JSON.parse(opciones.body)).toEqual(datos);
  });

  it('falla con un mensaje claro si no se configuró VITE_API_URL', async () => {
    vi.stubEnv('VITE_API_URL', '');

    await expect(pedir('/tabla')).rejects.toThrow('Falta VITE_API_URL');
  });
});
