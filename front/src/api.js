// Único lugar del front que conoce la dirección de la API y cómo hablarle.
// La dirección sale de VITE_API_URL (.env / .env.production), nunca del código.

function direccionApi() {
  const base = import.meta.env.VITE_API_URL;
  if (!base) throw new Error('Falta VITE_API_URL: copie .env.example como .env');
  return base;
}

export async function pedir(ruta, opciones = {}) {
  const url = `${direccionApi()}${ruta}`;
  let respuesta;
  try {
    respuesta = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones
    });
  } catch {
    throw new Error('No se pudo conectar con la API. ¿Está encendida?');
  }

  const cuerpo = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new Error(cuerpo?.error ?? `La API respondió con el código ${respuesta.status}`);
  }
  return cuerpo;
}

export const obtenerPartidos = () => pedir('/partidos');
export const obtenerPronosticos = () => pedir('/pronosticos');
export const obtenerTabla = () => pedir('/tabla');
export const obtenerReglas = () => pedir('/reglas');

export const crearPronostico = (datos) =>
  pedir('/pronosticos', { method: 'POST', body: JSON.stringify(datos) });

export const registrarResultado = (partidoId, datos) =>
  pedir(`/partidos/${partidoId}/resultado`, { method: 'POST', body: JSON.stringify(datos) });
