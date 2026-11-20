import { Router } from 'express';
import { PUNTOS_MARCADOR_EXACTO, PUNTOS_RESULTADO, PUNTOS_FALLO } from '../logica/reglas-pronosticos.js';
import { MAX_GOLES } from '../logica/validaciones.js';
import { responder } from '../http/responder.js';

const rutas = Router();

// El front muestra el reglamento y limita los campos de goles con estos valores,
// así los números viven solo en logica/ y no se repiten en React.
rutas.get('/', (req, res) => {
  responder(res, 200, {
    puntosMarcadorExacto: PUNTOS_MARCADOR_EXACTO,
    puntosResultado: PUNTOS_RESULTADO,
    puntosFallo: PUNTOS_FALLO,
    maxGoles: MAX_GOLES
  });
});

export default rutas;
