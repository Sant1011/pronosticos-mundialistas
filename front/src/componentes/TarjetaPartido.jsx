// Componente reutilizable: se usa en "Próximos partidos", "Resultados" y
// "Pronósticos". Lo que cambia entre esos lugares entra por props.
export default function TarjetaPartido({ partido, marcador, etiqueta, destacada = false }) {
  return (
    <article className={`tarjeta-partido${destacada ? ' tarjeta-partido--destacada' : ''}`}>
      <span className="tarjeta-partido__fase">{partido.fase}</span>
      <div className="tarjeta-partido__equipos">
        <span className="tarjeta-partido__equipo">{partido.equipoLocal}</span>
        <span className="tarjeta-partido__marcador">
          {marcador ? `${marcador.local} - ${marcador.visitante}` : 'vs'}
        </span>
        <span className="tarjeta-partido__equipo tarjeta-partido__equipo--visitante">
          {partido.equipoVisitante}
        </span>
      </div>
      {etiqueta && <span className="tarjeta-partido__etiqueta">{etiqueta}</span>}
    </article>
  );
}
