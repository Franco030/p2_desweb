import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';

const TEMA_KEY = 'tt_tema';
const TemaContext = createContext(null);

function temaInicial() {
  try {
    const guardado = localStorage.getItem(TEMA_KEY);
    if (guardado) return guardado === 'oscuro';
  } catch {
    /* sin almacenamiento */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/**
 * Provee el tema de Fluent 2 (claro/oscuro) y expone el objeto de tokens,
 * necesario donde no aplican variables CSS (atributos SVG de las gráficas).
 */
export function TemaProvider({ children }) {
  const [oscuro, setOscuro] = useState(temaInicial);
  const tema = oscuro ? webDarkTheme : webLightTheme;

  useEffect(() => {
    try {
      localStorage.setItem(TEMA_KEY, oscuro ? 'oscuro' : 'claro');
    } catch {
      /* sin almacenamiento */
    }
    // El fondo del documento usa el mismo token que la app para que el rebote del scroll no muestre otro color.
    const raiz = document.documentElement.style;
    raiz.colorScheme = oscuro ? 'dark' : 'light';
    raiz.backgroundColor = tema.colorNeutralBackground2;
    raiz.color = tema.colorNeutralForeground1;
  }, [oscuro, tema]);

  const alternar = useCallback(() => setOscuro((v) => !v), []);
  const valor = useMemo(() => ({ oscuro, tema, alternar }), [oscuro, tema, alternar]);

  return (
    <TemaContext.Provider value={valor}>
      <FluentProvider theme={tema}>
        {/* La clase de layout va en un div interno: los portales (tooltips, diálogos) copian la clase del FluentProvider. */}
        <div className="fluent-root">{children}</div>
      </FluentProvider>
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
