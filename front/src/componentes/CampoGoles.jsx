// Campo de goles: se usa dos veces en cada formulario. El máximo viene de la
// API (/reglas), así el número no se repite en el front.
export default function CampoGoles({ etiqueta, valor, alCambiar, maxGoles }) {
  return (
    <label className="campo campo--goles">
      <span>{etiqueta}</span>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        max={maxGoles}
        step="1"
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
      />
    </label>
  );
}
