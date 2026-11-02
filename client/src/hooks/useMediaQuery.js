import { useEffect, useState } from 'react';

/** Devuelve si la media query coincide y se actualiza al cambiar. */
export default function useMediaQuery(query) {
  const [coincide, setCoincide] = useState(() => window.matchMedia?.(query).matches ?? false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const cambiar = () => setCoincide(mql.matches);
    cambiar();
    mql.addEventListener('change', cambiar);
    return () => mql.removeEventListener('change', cambiar);
  }, [query]);

  return coincide;
}

/** Size classes de Fluent 2: small/medium terminan en 639px. */
export const PANTALLA_PEQUENA = '(max-width: 639px)';
export const MENOS_MOVIMIENTO = '(prefers-reduced-motion: reduce)';
