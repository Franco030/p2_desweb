import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@fluentui/react-components';
import { AuthProvider } from './context/AuthContext';
import { TemaProvider } from './context/TemaContext';
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

export default function App() {
  return (
    <TemaProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
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
    </TemaProvider>
  );
}
