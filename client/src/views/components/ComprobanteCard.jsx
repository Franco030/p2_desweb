import { useState } from 'react';
import { Body1, Button, Card, Caption1, MessageBar, MessageBarBody, Title1 } from '@fluentui/react-components';
import { ArrowDownload24Regular, CheckmarkCircle24Regular } from '@fluentui/react-icons';
import publicoService from '../../services/PublicoService';
import ArchivoService from '../../services/ArchivoService';

/** Muestra el turno asignado y permite descargar el comprobante PDF. */
export default function ComprobanteCard({ solicitud, titulo, aviso, children }) {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState(null);

  const descargar = async () => {
    setDescargando(true);
    setError(null);
    try {
      const blob = await publicoService.comprobante(solicitud);
      ArchivoService.descargar(blob, `comprobante-turno-${solicitud.turno}-${solicitud.curp}.pdf`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <Card className="comprobante">
      <div className="comprobante-icono"><CheckmarkCircle24Regular /></div>
      <Body1 as="p"><strong>{titulo}</strong></Body1>
      <Caption1>Tu número de turno en {solicitud.municipio?.nombre}</Caption1>
      <Title1 as="p" className="comprobante-turno">{solicitud.turno}</Title1>
      <Body1 as="p">CURP: <strong>{solicitud.curp}</strong></Body1>
      {aviso && (
        <MessageBar intent="warning"><MessageBarBody>{aviso}</MessageBarBody></MessageBar>
      )}
      <Caption1>Guarda tu CURP y número de turno: los necesitarás para modificar tu solicitud.</Caption1>
      {error && <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
      <div className="acciones">
        <Button appearance="primary" icon={<ArrowDownload24Regular />} onClick={descargar} disabled={descargando}>
          {descargando ? 'Generando...' : 'Descargar comprobante PDF'}
        </Button>
        {children}
      </div>
    </Card>
  );
}
