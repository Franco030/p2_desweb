import { useState } from 'react';
import { Button, Card, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { Add20Regular, Checkmark20Regular } from '@fluentui/react-icons';
import PageHeader from '../components/PageHeader';
import SolicitudForm from '../components/SolicitudForm';
import ComprobanteCard from '../components/ComprobanteCard';
import SolicitudModel from '../../models/SolicitudModel';
import publicoService from '../../services/PublicoService';
import useCatalogos from '../../hooks/useCatalogos';

export default function NuevaSolicitudPage() {
  const catalogos = useCatalogos();
  const [solicitud, setSolicitud] = useState(() => new SolicitudModel());
  const [errores, setErrores] = useState({});
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [registrada, setRegistrada] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    const val = solicitud.validar();
    setErrores(val);
    if (Object.keys(val).length) return;
    setGuardando(true);
    setError(null);
    try {
      setRegistrada(await publicoService.registrar(solicitud));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const reiniciar = () => {
    setRegistrada(null);
    setSolicitud(new SolicitudModel());
    setErrores({});
  };

  if (registrada) {
    return (
      <>
        <PageHeader titulo="Solicitud registrada" />
        <ComprobanteCard solicitud={registrada} titulo="¡Tu solicitud fue registrada correctamente!">
          <Button icon={<Add20Regular />} onClick={reiniciar}>Nueva solicitud</Button>
        </ComprobanteCard>
      </>
    );
  }

  return (
    <>
      <PageHeader titulo="Nueva solicitud de turno" descripcion="Los campos marcados con * son obligatorios." />
      <Card className="panel">
        <form onSubmit={enviar} noValidate>
          {(error || catalogos.error) && (
            <MessageBar intent="error" className="mb"><MessageBarBody>{error || catalogos.error}</MessageBarBody></MessageBar>
          )}
          <SolicitudForm solicitud={solicitud} onChange={setSolicitud} errores={errores} catalogos={catalogos} />
          <div className="acciones">
            <Button type="submit" appearance="primary" icon={<Checkmark20Regular />} disabled={guardando}>
              {guardando ? 'Registrando solicitud' : 'Registrar solicitud'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
