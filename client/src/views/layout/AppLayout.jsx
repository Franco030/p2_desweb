import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  Hamburger,
  NavDivider,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavItem,
  NavSectionHeader,
  Subtitle2,
  Tooltip,
} from '@fluentui/react-components';
import {
  bundleIcon,
  ClipboardTask20Filled,
  ClipboardTask20Regular,
  DataPie20Filled,
  DataPie20Regular,
  DocumentAdd20Filled,
  DocumentAdd20Regular,
  DocumentEdit20Filled,
  DocumentEdit20Regular,
  HatGraduation20Filled,
  HatGraduation20Regular,
  Home20Filled,
  Home20Regular,
  Location20Filled,
  Location20Regular,
  LockClosed20Filled,
  LockClosed20Regular,
  SignOut20Regular,
  TextBulletListSquare20Filled,
  TextBulletListSquare20Regular,
  TicketDiagonal24Filled,
  WeatherMoon20Regular,
  WeatherSunny20Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../../context/AuthContext';
import { useTema } from '../../context/TemaContext';
import useNotificar from '../../hooks/useNotificar';
import useMediaQuery, { PANTALLA_PEQUENA } from '../../hooks/useMediaQuery';

// Fluent 2: icono Regular en reposo y Filled en el elemento seleccionado.
const Icono = {
  inicio: bundleIcon(Home20Filled, Home20Regular),
  nueva: bundleIcon(DocumentAdd20Filled, DocumentAdd20Regular),
  modificar: bundleIcon(DocumentEdit20Filled, DocumentEdit20Regular),
  login: bundleIcon(LockClosed20Filled, LockClosed20Regular),
  tablero: bundleIcon(DataPie20Filled, DataPie20Regular),
  solicitudes: bundleIcon(TextBulletListSquare20Filled, TextBulletListSquare20Regular),
  municipios: bundleIcon(Location20Filled, Location20Regular),
  niveles: bundleIcon(HatGraduation20Filled, HatGraduation20Regular),
  asuntos: bundleIcon(ClipboardTask20Filled, ClipboardTask20Regular),
};

const MENU_PUBLICO = [
  { to: '/', label: 'Inicio', Icon: Icono.inicio },
  { to: '/solicitud/nueva', label: 'Nueva solicitud', Icon: Icono.nueva },
  { to: '/solicitud/modificar', label: 'Modificar solicitud', Icon: Icono.modificar },
];

const MENU_ADMIN = [
  { to: '/admin', label: 'Tablero', Icon: Icono.tablero },
  { to: '/admin/solicitudes', label: 'Solicitudes', Icon: Icono.solicitudes },
  { to: '/admin/catalogos/municipios', label: 'Municipios', Icon: Icono.municipios },
  { to: '/admin/catalogos/niveles', label: 'Niveles educativos', Icon: Icono.niveles },
  { to: '/admin/catalogos/asuntos', label: 'Asuntos', Icon: Icono.asuntos },
];

const MENU_LOGIN = [{ to: '/admin/login', label: 'Iniciar sesión', Icon: Icono.login }];

function BotonNavegacion({ abierto, onClick }) {
  return (
    <Tooltip content={abierto ? 'Cerrar navegación' : 'Abrir navegación'} relationship="label">
      <Hamburger onClick={onClick} aria-expanded={abierto} />
    </Tooltip>
  );
}

export default function AppLayout() {
  const pequena = useMediaQuery(PANTALLA_PEQUENA);
  const [abiertoEnLinea, setAbiertoEnLinea] = useState(true);
  const [abiertoSuperpuesto, setAbiertoSuperpuesto] = useState(false);
  const { usuario, logout } = useAuth();
  const { oscuro, alternar: alternarTema } = useTema();
  const navigate = useNavigate();
  const location = useLocation();
  const notificar = useNotificar();

  const abierto = pequena ? abiertoSuperpuesto : abiertoEnLinea;
  const setAbierto = pequena ? setAbiertoSuperpuesto : setAbiertoEnLinea;
  const menuAdmin = usuario ? MENU_ADMIN : MENU_LOGIN;

  const ir = (to) => (e) => {
    e.preventDefault();
    navigate(to);
    if (pequena) setAbiertoSuperpuesto(false);
  };

  const elemento = ({ to, label, Icon }) => (
    <NavItem key={to} href={to} value={to} icon={<Icon />} onClick={ir(to)}>
      {label}
    </NavItem>
  );

  const cerrarSesion = async () => {
    await logout();
    notificar('Sesión cerrada', 'info');
    navigate('/admin/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <BotonNavegacion abierto={abierto} onClick={() => setAbierto(!abierto)} />
        <NavLink to="/" className="brand">
          <TicketDiagonal24Filled />
          <Subtitle2>Ticket de Turno</Subtitle2>
        </NavLink>
        <div className="header-acciones">
          <Tooltip content={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} relationship="label">
            <Button
              appearance="subtle"
              icon={oscuro ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
              onClick={alternarTema}
            />
          </Tooltip>
          {usuario && (
            <>
              <Avatar name={usuario.nombre} size={28} className="ocultar-sm" />
              <Tooltip content="Cerrar sesión" relationship="label">
                <Button appearance="subtle" icon={<SignOut20Regular />} onClick={cerrarSesion}>
                  <span className="ocultar-sm">Cerrar sesión</span>
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      </header>

      <div className="app-cuerpo">
        <NavDrawer
          type={pequena ? 'overlay' : 'inline'}
          open={abierto}
          onOpenChange={(_, { open }) => setAbierto(open)}
          selectedValue={location.pathname}
          className="app-nav"
          aria-label="Navegación"
        >
          {pequena && (
            <NavDrawerHeader>
              <BotonNavegacion abierto onClick={() => setAbierto(false)} />
            </NavDrawerHeader>
          )}
          <NavDrawerBody>
            <NavSectionHeader>Portal público</NavSectionHeader>
            {MENU_PUBLICO.map(elemento)}
            <NavDivider />
            <NavSectionHeader>Administración</NavSectionHeader>
            {menuAdmin.map(elemento)}
          </NavDrawerBody>
        </NavDrawer>

        <main className="app-main">
          {/* Fluent 2: navegación de primer nivel con un fundido rápido. */}
          <div key={location.pathname} className="transicion-pagina">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
