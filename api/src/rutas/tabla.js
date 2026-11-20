import { Router } from 'express';
import * as repositorio from '../datos/repositorio.js';
import { construirTabla } from '../logica/reglas-pronosticos.js';
import { responder } from '../http/responder.js';

const rutas = Router();

rutas.get('/', async (req, res) => {
  const [pronosticos, partidos] = await Promise.all([
    repositorio.listarPronosticos(),
    repositorio.listarPartidos()
  ]);
  responder(res, 200, construirTabla(pronosticos, partidos));
});

export default rutas;
