import { Link } from 'react-router-dom';
import { Body1, Button, Card, CardHeader, Text } from '@fluentui/react-components';
import { DocumentAdd24Regular, DocumentEdit24Regular, LockClosed24Regular } from '@fluentui/react-icons';
import PageHeader from '../components/PageHeader';

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
    boton: 'Modificar',
  },
  {
    to: '/admin',
    icono: <LockClosed24Regular />,
    titulo: 'Administradores',
    texto: 'Gestión de solicitudes, catálogos y tablero de estatus.',
    boton: 'Entrar',
  },
];

export default function InicioPage() {
  return (
    <>
      <PageHeader
        titulo="Bienvenido a Ticket de Turno"
        descripcion="Solicita tu turno de atención. Cada municipio asigna sus turnos de forma consecutiva."
      />
      <div className="tarjetas">
        {OPCIONES.map((o) => (
          <Card key={o.to} className="tarjeta-opcion">
            <CardHeader image={<span className="icono-circulo">{o.icono}</span>} header={<Text weight="semibold" size={400}>{o.titulo}</Text>} />
            <Body1 as="p" className="texto-secundario">{o.texto}</Body1>
            <Link to={o.to}>
              <Button appearance="primary">{o.boton}</Button>
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
