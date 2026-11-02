import { useRef } from 'react';

/** Conserva el último valor no nulo; evita que un diálogo se vacíe durante su animación de cierre. */
export default function useUltimoValor(valor) {
  const ultimo = useRef(valor);
  if (valor) ultimo.current = valor;
  return valor ?? ultimo.current;
}
