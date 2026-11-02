import { useState } from 'react';
import { Body1, Button, Caption1, Card, MessageBar, MessageBarBody, Subtitle1, Text } from '@fluentui/react-components';
import { ArrowDownload20Regular, CheckmarkCircle48Filled } from '@fluentui/react-icons';
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
      <CheckmarkCircle48Filled className="comprobante-icono" />
      <Subtitle1 as="p">{titulo}</Subtitle1>
      <Body1 as="p">Tu número de turno en {solicitud.municipio?.nombre}</Body1>
      <Text as="p" weight="semibold" className="comprobante-turno">{solicitud.turno}</Text>
      <Body1 as="p">CURP: <strong>{solicitud.curp}</strong></Body1>
      {aviso && (
        <MessageBar intent="warning"><MessageBarBody>{aviso}</MessageBarBody></MessageBar>
      )}
      <Caption1 as="p">Guarda tu CURP y número de turno: los necesitarás para modificar tu solicitud.</Caption1>
      {error && <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
      <div className="acciones">
        <Button appearance="primary" icon={<ArrowDownload20Regular />} onClick={descargar} disabled={descargando}>
          {descargando ? 'Generando comprobante' : 'Descargar comprobante'}
        </Button>
        {children}
      </div>
    </Card>
  );
}
