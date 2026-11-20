import { Router } from 'express';
import * as repositorio from '../datos/repositorio.js';
import { validarPronostico, aMarcador } from '../logica/validaciones.js';
import { anotarPuntos } from '../logica/reglas-pronosticos.js';
import { responder, responderError } from '../http/responder.js';

const rutas = Router();

rutas.get('/', async (req, res) => {
  const [pronosticos, partidos] = await Promise.all([
    repositorio.listarPronosticos(),
    repositorio.listarPartidos()
  ]);
  responder(res, 200, anotarPuntos(pronosticos, partidos));
});

rutas.post('/', async (req, res) => {
  const partidoId = Number(req.body?.partidoId);
  const partido = await repositorio.buscarPartido(partidoId);

  const error = validarPronostico(req.body, partido);
  if (error) return responderError(res, 400, error);

  const { participante } = req.body;
  const existente = await repositorio.buscarPronostico(participante, partidoId);
  if (existente) {
    return responderError(res, 409, `${existente.participante} ya tiene un pronóstico para ese partido`);
  }

  const nuevo = await repositorio.agregarPronostico({
    participante,
    partidoId,
    marcador: aMarcador(req.body)
  });
  responder(res, 201, nuevo);
});

export default rutas;
