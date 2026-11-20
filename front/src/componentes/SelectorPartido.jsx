export default function SelectorPartido({ partidos, valor, alCambiar }) {
  return (
    <label className="campo">
      <span>Partido</span>
      <select value={valor} onChange={(evento) => alCambiar(evento.target.value)}>
        {partidos.map((partido) => (
          <option key={partido.id} value={partido.id}>
            {partido.fase}: {partido.equipoLocal} vs {partido.equipoVisitante}
          </option>
        ))}
      </select>
    </label>
  );
}
