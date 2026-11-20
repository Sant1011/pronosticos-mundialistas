import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rutasPartidos from './rutas/partidos.js';
import rutasPronosticos from './rutas/pronosticos.js';
import rutasTabla from './rutas/tabla.js';
import rutasReglas from './rutas/reglas.js';
import { registrarPeticion, rutaNoEncontrada, manejarErrores } from './http/middlewares.js';

const PUERTO_POR_DEFECTO = 3000;
const LIMITE_CUERPO_JSON = '10kb';

const PUERTO = process.env.PORT || PUERTO_POR_DEFECTO;
const ORIGEN_PERMITIDO = process.env.CORS_ORIGIN;

// Sin origen configurado la API no arranca: así nunca queda abierta a cualquier
// página por olvido.
if (!ORIGEN_PERMITIDO) {
  console.error('Falta CORS_ORIGIN en el archivo .env (ver .env.example)');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: ORIGEN_PERMITIDO }));
app.use(express.json({ limit: LIMITE_CUERPO_JSON }));
app.use(registrarPeticion);

app.use('/partidos', rutasPartidos);
app.use('/pronosticos', rutasPronosticos);
app.use('/tabla', rutasTabla);
app.use('/reglas', rutasReglas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

app.listen(PUERTO, () => {
  console.log(`API escuchando en el puerto ${PUERTO} (CORS solo para ${ORIGEN_PERMITIDO})`);
});
