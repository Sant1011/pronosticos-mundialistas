// Solo muestra: los puntos y el orden ya vienen calculados por la API.
export default function TablaPosiciones({ filas }) {
  if (filas.length === 0) {
    return <p className="vacio">Todavía no hay pronósticos.</p>;
  }

  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>#</th>
          <th>Participante</th>
          <th title="Marcadores exactos">Exactos</th>
          <th title="Aciertos de ganador o empate">Aciertos</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={fila.id} className={fila.posicion === 1 ? 'tabla__lider' : undefined}>
            <td>{fila.posicion}</td>
            <td>{fila.participante}</td>
            <td>{fila.exactos}</td>
            <td>{fila.aciertos}</td>
            <td className="tabla__puntos">{fila.puntos}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
