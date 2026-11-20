export default function Mensaje({ tipo, texto }) {
  if (!texto) return null;
  return (
    <p className={`mensaje mensaje--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {texto}
    </p>
  );
}
