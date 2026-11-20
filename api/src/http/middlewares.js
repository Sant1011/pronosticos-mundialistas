import { responderError } from './responder.js';

export function registrarPeticion(req, res, siguiente) {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  siguiente();
}

export function rutaNoEncontrada(req, res) {
  responderError(res, 404, `No existe la ruta ${req.method} ${req.originalUrl}`);
}

// Express 5 manda aquí cualquier error de una ruta async, así que no hace falta
// un try/catch en cada ruta. Al cliente nunca se le muestra el detalle interno.
// eslint-disable-next-line no-unused-vars
export function manejarErrores(error, req, res, siguiente) {
  if (error.type === 'entity.parse.failed') {
    return responderError(res, 400, 'El cuerpo de la petición no es un JSON válido');
  }
  if (error.type === 'entity.too.large') {
    return responderError(res, 413, 'El cuerpo de la petición es demasiado grande');
  }
  console.error(error);
  responderError(res, 500, 'Ocurrió un error inesperado en el servidor');
}
