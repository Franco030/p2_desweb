import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  Divider,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Text,
  Tooltip,
} from '@fluentui/react-components';
import {
  ClipboardTask24Regular,
  DataPie24Regular,
  Dismiss24Regular,
  DocumentAdd24Regular,
  DocumentEdit24Regular,
  HatGraduation24Regular,
  Home24Regular,
  Location24Regular,
  LockClosed24Regular,
  Navigation24Regular,
  SignOut24Regular,
  TextBulletListSquare24Regular,
  TicketDiagonal24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../../context/AuthContext';
import useNotificar from '../../hooks/useNotificar';

const MENU_PUBLICO = [
  { to: '/', label: 'Inicio', icon: <Home24Regular />, end: true },
  { to: '/solicitud/nueva', label: 'Nueva solicitud', icon: <DocumentAdd24Regular /> },
  { to: '/solicitud/modificar', label: 'Modificar solicitud', icon: <DocumentEdit24Regular /> },
];

const MENU_ADMIN = [
  { to: '/admin', label: 'Tablero', icon: <DataPie24Regular />, end: true },
  { to: '/admin/solicitudes', label: 'Solicitudes', icon: <TextBulletListSquare24Regular /> },
  { to: '/admin/catalogos/municipios', label: 'Municipios', icon: <Location24Regular /> },
  { to: '/admin/catalogos/niveles', label: 'Niveles educativos', icon: <HatGraduation24Regular /> },
  { to: '/admin/catalogos/asuntos', label: 'Asuntos', icon: <ClipboardTask24Regular /> },
];

function Menu({ onNavegar }) {
  const { usuario } = useAuth();
  const enlace = (item) => (
    <NavLink key={item.to} to={item.to} end={item.end} className="nav-item" onClick={onNavegar}>
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <nav className="nav" aria-label="Menú principal">
      <Text className="nav-section">Portal público</Text>
      {MENU_PUBLICO.map(enlace)}
      <Divider className="nav-divider" />
      <Text className="nav-section">Administración</Text>
      {usuario ? (
        MENU_ADMIN.map(enlace)
      ) : (
        enlace({ to: '/admin/login', label: 'Iniciar sesión', icon: <LockClosed24Regular /> })
      )}
    </nav>
  );
}

export default function AppLayout({ temaOscuro, onCambiarTema }) {
  const [abierto, setAbierto] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const notificar = useNotificar();

  const cerrarSesion = async () => {
    await logout();
    notificar('Sesión cerrada', 'info');
    navigate('/admin/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Button
          className="solo-movil"
          appearance="subtle"
          icon={<Navigation24Regular />}
          aria-label="Abrir menú"
          onClick={() => setAbierto(true)}
        />
        <NavLink to="/" className="brand">
          <TicketDiagonal24Regular />
          <span>Ticket de Turno</span>
        </NavLink>
        <div className="header-acciones">
          <Tooltip content={temaOscuro ? 'Tema claro' : 'Tema oscuro'} relationship="label">
            <Button
              appearance="subtle"
              icon={temaOscuro ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
              onClick={onCambiarTema}
            />
          </Tooltip>
          {usuario && (
            <>
              <Avatar name={usuario.nombre} size={28} className="solo-escritorio" />
              <Button appearance="subtle" icon={<SignOut24Regular />} onClick={cerrarSesion}>
                <span className="solo-escritorio">Cerrar sesión</span>
              </Button>
            </>
          )}
        </div>
      </header>

      <aside className="app-sidebar solo-escritorio">
        <Menu />
      </aside>

      <OverlayDrawer open={abierto} onOpenChange={(_, { open }) => setAbierto(open)} position="start">
        <DrawerHeader>
          <DrawerHeaderTitle
            action={<Button appearance="subtle" aria-label="Cerrar" icon={<Dismiss24Regular />} onClick={() => setAbierto(false)} />}
          >
            Menú
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <Menu onNavegar={() => setAbierto(false)} />
        </DrawerBody>
      </OverlayDrawer>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
