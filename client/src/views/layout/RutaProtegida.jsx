import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@fluentui/react-components';
import { useAuth } from '../../context/AuthContext';

export default function RutaProtegida() {
  const { usuario, cargando } = useAuth();
  const location = useLocation();
  if (cargando) return <Spinner label="Verificando sesión" />;
  if (!usuario) return <Navigate to="/admin/login" replace state={{ desde: location.pathname }} />;
  return <Outlet />;
}
