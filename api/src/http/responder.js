// Todas las rutas responden por aquí: el formato de las respuestas y de los
// errores ({ error: 'mensaje' }) se define una sola vez.
export function responder(res, codigo, datos) {
  res.status(codigo).json(datos);
}

export function responderError(res, codigo, mensaje) {
  responder(res, codigo, { error: mensaje });
}
