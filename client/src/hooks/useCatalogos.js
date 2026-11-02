import { useEffect, useState } from 'react';
import CatalogoService from '../services/CatalogoService';

/** Carga los catálogos necesarios para el formulario de solicitud. */
export default function useCatalogos({ soloActivos = true } = {}) {
  const [catalogos, setCatalogos] = useState({ municipios: [], niveles: [], asuntos: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    Promise.all(
      Object.keys(CatalogoService.TIPOS).map((tipo) => CatalogoService.de(tipo).listar({ soloActivos }))
    )
      .then(([municipios, niveles, asuntos]) => vigente && setCatalogos({ municipios, niveles, asuntos }))
      .catch((err) => vigente && setError(err.message));
    return () => {
      vigente = false;
    };
  }, [soloActivos]);

  return { ...catalogos, error };
}
