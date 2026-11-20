import { useState } from 'react';
import CampoGoles from './CampoGoles.jsx';
import SelectorPartido from './SelectorPartido.jsx';
import Mensaje from './Mensaje.jsx';

export default function FormularioResultado({ partidosPendientes, maxGoles, alEnviar }) {
  const [partidoId, setPartidoId] = useState('');
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [enviando, setEnviando] = useState(false);

  if (partidosPendientes.length === 0) {
    return <p className="vacio">Todos los partidos tienen resultado.</p>;
  }

  const partidoElegido = partidosPendientes.some((p) => String(p.id) === partidoId)
    ? partidoId
    : String(partidosPendientes[0].id);

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    try {
      await alEnviar(Number(partidoElegido), { golesLocal, golesVisitante });
      setMensaje({ tipo: 'exito', texto: 'Resultado registrado: la tabla ya se actualizó.' });
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
      <SelectorPartido partidos={partidosPendientes} valor={partidoElegido} alCambiar={setPartidoId} />
      <div className="formulario__marcador">
        <CampoGoles etiqueta="Goles local" valor={golesLocal} alCambiar={setGolesLocal} maxGoles={maxGoles} />
        <CampoGoles etiqueta="Goles visitante" valor={golesVisitante} alCambiar={setGolesVisitante} maxGoles={maxGoles} />
      </div>
      <button type="submit" className="boton--secundario" disabled={enviando}>
        {enviando ? 'Registrando…' : 'Registrar resultado'}
      </button>
      <Mensaje tipo={mensaje.tipo} texto={mensaje.texto} />
    </form>
  );
}
