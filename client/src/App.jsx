import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { FluentProvider, Toaster, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { AuthProvider } from './context/AuthContext';
import { TOASTER_ID } from './hooks/useNotificar';
import AppLayout from './views/layout/AppLayout';
import RutaProtegida from './views/layout/RutaProtegida';
import InicioPage from './views/publico/InicioPage';
import NuevaSolicitudPage from './views/publico/NuevaSolicitudPage';
import ModificarSolicitudPage from './views/publico/ModificarSolicitudPage';
import LoginPage from './views/admin/LoginPage';
import DashboardPage from './views/admin/DashboardPage';
import SolicitudesPage from './views/admin/SolicitudesPage';
import CatalogoPage from './views/admin/CatalogoPage';

const TEMA_KEY = 'tt_tema';

function temaInicial() {
  try {
    const guardado = localStorage.getItem(TEMA_KEY);
    if (guardado) return guardado === 'oscuro';
  } catch {
    /* sin almacenamiento */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export default function App() {
  const [oscuro, setOscuro] = useState(temaInicial);

  useEffect(() => {
    try {
      localStorage.setItem(TEMA_KEY, oscuro ? 'oscuro' : 'claro');
    } catch {
      /* sin almacenamiento */
    }
    document.documentElement.style.colorScheme = oscuro ? 'dark' : 'light';
  }, [oscuro]);

  return (
    <FluentProvider theme={oscuro ? webDarkTheme : webLightTheme} className="fluent-root">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout temaOscuro={oscuro} onCambiarTema={() => setOscuro((v) => !v)} />}>
              <Route index element={<InicioPage />} />
              <Route path="solicitud/nueva" element={<NuevaSolicitudPage />} />
              <Route path="solicitud/modificar" element={<ModificarSolicitudPage />} />
              <Route path="admin/login" element={<LoginPage />} />
              <Route path="admin" element={<RutaProtegida />}>
                <Route index element={<DashboardPage />} />
                <Route path="solicitudes" element={<SolicitudesPage />} />
                <Route path="catalogos/:tipo" element={<CatalogoPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster toasterId={TOASTER_ID} position="top-end" />
      </AuthProvider>
    </FluentProvider>
  );
}
