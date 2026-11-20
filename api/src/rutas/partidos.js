import { Router } from 'express';
import * as repositorio from '../datos/repositorio.js';
import { validarResultado, aMarcador } from '../logica/validaciones.js';
import { responder, responderError } from '../http/responder.js';

const rutas = Router();

rutas.get('/', async (req, res) => {
  responder(res, 200, await repositorio.listarPartidos());
});

rutas.post('/:id/resultado', async (req, res) => {
  const id = Number(req.params.id);
  const partido = await repositorio.buscarPartido(id);
  if (!partido) return responderError(res, 404, `No existe un partido con id ${req.params.id}`);

  const error = validarResultado(req.body, partido);
  if (error) return responderError(res, 400, error);

  responder(res, 200, await repositorio.guardarResultado(id, aMarcador(req.body)));
});

export default rutas;
