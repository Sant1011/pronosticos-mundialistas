import { useEffect, useState } from 'react';
import * as api from './api.js';
import TarjetaPartido from './componentes/TarjetaPartido.jsx';
import TablaPosiciones from './componentes/TablaPosiciones.jsx';
import FormularioPronostico from './componentes/FormularioPronostico.jsx';
import FormularioResultado from './componentes/FormularioResultado.jsx';
import Mensaje from './componentes/Mensaje.jsx';

function etiquetaPronostico(pronostico) {
  if (pronostico.puntos === null) return `${pronostico.participante} · por jugar`;
  const unidad = pronostico.puntos === 1 ? 'pt' : 'pts';
  return `${pronostico.participante} · +${pronostico.puntos} ${unidad}`;
}

export default function App() {
  const [partidos, setPartidos] = useState([]);
  const [pronosticos, setPronosticos] = useState([]);
  const [tabla, setTabla] = useState([]);
  const [reglas, setReglas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargarDatos() {
    try {
      const [nuevosPartidos, nuevosPronosticos, nuevaTabla, nuevasReglas] = await Promise.all([
        api.obtenerPartidos(),
        api.obtenerPronosticos(),
        api.obtenerTabla(),
        api.obtenerReglas()
      ]);
      setPartidos(nuevosPartidos);
      setPronosticos(nuevosPronosticos);
      setTabla(nuevaTabla);
      setReglas(nuevasReglas);
      setError('');
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function guardarPronostico(datos) {
    await api.crearPronostico(datos);
    await cargarDatos();
  }

  async function guardarResultado(partidoId, datos) {
    await api.registrarResultado(partidoId, datos);
    await cargarDatos();
  }

  const pendientes = partidos.filter((partido) => partido.resultado === null);
  const jugados = partidos.filter((partido) => partido.resultado !== null);
  const partidosPorId = new Map(partidos.map((partido) => [partido.id, partido]));
  const pronosticosRecientes = [...pronosticos].reverse();

  return (
    <div className="pagina">
      <header className="cabecera">
        <h1>⚽ Pronósticos Mundialistas</h1>
        <p>Pronostica los partidos, suma puntos y sube en la tabla.</p>
      </header>

      {cargando && <p className="vacio">Cargando…</p>}
      <Mensaje tipo="error" texto={error} />

      {!cargando && !error && (
        <main className="contenido">
          <aside className="columna">
            <section className="panel">
              <h2>Tabla de posiciones</h2>
              <TablaPosiciones filas={tabla} />
            </section>

            {reglas && (
              <section className="panel reglamento">
                <h2>Reglamento</h2>
                <ul>
                  <li><strong>{reglas.puntosMarcadorExacto} pts</strong> por acertar el marcador exacto.</li>
                  <li><strong>{reglas.puntosResultado} pt</strong> por acertar quién gana o el empate.</li>
                  <li><strong>{reglas.puntosFallo} pts</strong> si fallas.</li>
                  <li>Un pronóstico por persona en cada partido.</li>
                </ul>
              </section>
            )}
          </aside>

          <div className="columna columna--ancha">
            <section className="panel">
              <h2>Próximos partidos</h2>
              <div className="rejilla">
                {pendientes.map((partido) => (
                  <TarjetaPartido key={partido.id} partido={partido} etiqueta="Pendiente" />
                ))}
              </div>
              <h3>Haz tu pronóstico</h3>
              <FormularioPronostico
                partidosPendientes={pendientes}
                maxGoles={reglas?.maxGoles}
                alEnviar={guardarPronostico}
              />
            </section>

            <section className="panel">
              <h2>Resultados</h2>
              <div className="rejilla">
                {jugados.map((partido) => (
                  <TarjetaPartido key={partido.id} partido={partido} marcador={partido.resultado} etiqueta="Final" />
                ))}
              </div>
            </section>

            <section className="panel">
              <h2>Pronósticos</h2>
              <div className="rejilla">
                {pronosticosRecientes.map((pronostico) => (
                  <TarjetaPartido
                    key={pronostico.id}
                    partido={partidosPorId.get(pronostico.partidoId)}
                    marcador={pronostico.marcador}
                    etiqueta={etiquetaPronostico(pronostico)}
                    destacada={pronostico.puntos === reglas?.puntosMarcadorExacto}
                  />
                ))}
              </div>
            </section>

            <section className="panel panel--organizador">
              <h2>Zona del organizador</h2>
              <p className="ayuda">Cuando termine un partido, registra aquí el resultado real.</p>
              <FormularioResultado
                partidosPendientes={pendientes}
                maxGoles={reglas?.maxGoles}
                alEnviar={guardarResultado}
              />
            </section>
          </div>
        </main>
      )}
    </div>
  );
}
