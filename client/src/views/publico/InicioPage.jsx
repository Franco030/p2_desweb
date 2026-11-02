import { useNavigate } from 'react-router-dom';
import { Body1, Button, Card, CardFooter, CardHeader, Subtitle2 } from '@fluentui/react-components';
import { DocumentAdd24Regular, DocumentEdit24Regular, LockClosed24Regular } from '@fluentui/react-icons';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../../context/AuthContext';

const OPCIONES = [
  {
    to: '/solicitud/nueva',
    icono: <DocumentAdd24Regular />,
    titulo: 'Solicitar turno',
    texto: 'Registra tu solicitud y obtén tu número de turno con comprobante PDF.',
    boton: 'Nueva solicitud',
  },
  {
    to: '/solicitud/modificar',
    icono: <DocumentEdit24Regular />,
    titulo: 'Modificar solicitud',
    texto: 'Consulta o corrige tus datos con tu CURP y número de turno.',
    boton: 'Modificar solicitud',
  },
  {
    to: '/admin',
    icono: <LockClosed24Regular />,
    titulo: 'Administradores',
    texto: 'Gestión de solicitudes, catálogos y tablero de estatus.',
    boton: 'Iniciar sesión',
    botonConSesion: 'Abrir tablero',
  },
];

export default function InicioPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  return (
    <>
      <PageHeader
        titulo="Bienvenido a Ticket de Turno"
        descripcion="Solicita tu turno de atención. Cada municipio asigna sus turnos de forma consecutiva."
      />
      {/* Tres acciones con la misma prioridad: todas con fondo neutro (Fluent 2). */}
      <div className="tarjetas escalonado">
        {OPCIONES.map((o) => (
          <Card key={o.to} className="tarjeta-opcion">
            <CardHeader
              image={<span className="icono-circulo">{o.icono}</span>}
              header={<Subtitle2 as="h2">{o.titulo}</Subtitle2>}
            />
            <Body1 as="p" className="texto-secundario">{o.texto}</Body1>
            <CardFooter>
              <Button onClick={() => navigate(o.to)}>{usuario && o.botonConSesion ? o.botonConSesion : o.boton}</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
