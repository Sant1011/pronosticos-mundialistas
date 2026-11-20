import { useState } from 'react';
import CampoGoles from './CampoGoles.jsx';
import SelectorPartido from './SelectorPartido.jsx';
import Mensaje from './Mensaje.jsx';

export default function FormularioPronostico({ partidosPendientes, maxGoles, alEnviar }) {
  const [participante, setParticipante] = useState('');
  const [partidoId, setPartidoId] = useState('');
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [enviando, setEnviando] = useState(false);

  if (partidosPendientes.length === 0) {
    return <p className="vacio">No quedan partidos pendientes para pronosticar.</p>;
  }

  // Si el partido elegido ya se jugó, se toma el primero pendiente.
  const partidoElegido = partidosPendientes.some((p) => String(p.id) === partidoId)
    ? partidoId
    : String(partidosPendientes[0].id);

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    try {
      await alEnviar({ participante, partidoId: Number(partidoElegido), golesLocal, golesVisitante });
      setMensaje({ tipo: 'exito', texto: '¡Pronóstico guardado!' });
      setGolesLocal('');
      setGolesVisitante('');
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <label className="campo">
        <span>Tu nombre</span>
        <input
          type="text"
          value={participante}
          onChange={(evento) => setParticipante(evento.target.value)}
          placeholder="Ej: Santiago"
        />
      </label>
      <SelectorPartido partidos={partidosPendientes} valor={partidoElegido} alCambiar={setPartidoId} />
      <div className="formulario__marcador">
        <CampoGoles etiqueta="Goles local" valor={golesLocal} alCambiar={setGolesLocal} maxGoles={maxGoles} />
        <CampoGoles etiqueta="Goles visitante" valor={golesVisitante} alCambiar={setGolesVisitante} maxGoles={maxGoles} />
      </div>
      <button type="submit" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Guardar pronóstico'}
      </button>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} />
    </form>
  );
}
