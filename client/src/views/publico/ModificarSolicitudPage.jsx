import { useState } from 'react';
import { Button, Card, Field, Input, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { ArrowClockwise20Regular, Checkmark20Regular, Search20Regular } from '@fluentui/react-icons';
import PageHeader from '../components/PageHeader';
import SolicitudForm from '../components/SolicitudForm';
import ComprobanteCard from '../components/ComprobanteCard';
import SolicitudModel from '../../models/SolicitudModel';
import publicoService from '../../services/PublicoService';
import useCatalogos from '../../hooks/useCatalogos';

export default function ModificarSolicitudPage() {
  const catalogos = useCatalogos();
  const [acceso, setAcceso] = useState({ curp: '', turno: '' });
  const [original, setOriginal] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [actualizada, setActualizada] = useState(null);

  const buscar = async (e) => {
    e.preventDefault();
    setError(null);
    setOcupado(true);
    try {
      const encontrada = await publicoService.buscar(acceso.curp.trim().toUpperCase(), Number(acceso.turno));
      setOriginal(encontrada);
      setSolicitud(new SolicitudModel(encontrada));
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    const val = solicitud.validar();
    setErrores(val);
    if (Object.keys(val).length) return;
    setOcupado(true);
    setError(null);
    try {
      const res = await publicoService.modificar(original.id, solicitud, {
        curpActual: original.curp,
        turnoActual: original.turno,
      });
      setActualizada(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setOcupado(false);
    }
  };

  const reiniciar = () => {
    setAcceso({ curp: '', turno: '' });
    setOriginal(null);
    setSolicitud(null);
    setActualizada(null);
    setErrores({});
  };

  if (actualizada) {
    const cambioTurno = actualizada.turno !== original.turno;
    return (
      <>
        <PageHeader titulo="Solicitud actualizada" />
        <ComprobanteCard
          solicitud={actualizada}
          titulo="Tus datos se guardaron correctamente"
          aviso={cambioTurno ? `Cambiaste de municipio, por lo que se te asignó el nuevo turno ${actualizada.turno}` : null}
        >
          <Button icon={<ArrowClockwise20Regular />} onClick={reiniciar}>Consultar otra solicitud</Button>
        </ComprobanteCard>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titulo="Modificar solicitud"
        descripcion="Ingresa la CURP del alumno y el número de turno que se te asignó."
      />
      {error && <MessageBar intent="error" className="mb"><MessageBarBody>{error}</MessageBarBody></MessageBar>}

      {!solicitud ? (
        <Card className="panel panel-angosto">
          {/* Ambos campos son obligatorios: el botón se habilita al completarlos (Fluent 2). */}
          <form onSubmit={buscar} className="form-apilado">
            <Field label="CURP" hint="18 caracteres">
              <Input
                value={acceso.curp}
                maxLength={18}
                onChange={(_, d) => setAcceso({ ...acceso, curp: d.value.toUpperCase() })}
              />
            </Field>
            <Field label="Número de turno">
              <Input
                type="number"
                min={1}
                value={acceso.turno}
                onChange={(_, d) => setAcceso({ ...acceso, turno: d.value })}
              />
            </Field>
            <div>
              <Button type="submit" appearance="primary" icon={<Search20Regular />} disabled={ocupado || !acceso.curp || !acceso.turno}>
                Buscar solicitud
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="panel">
          <form onSubmit={guardar} noValidate>
            <MessageBar intent="info" className="mb">
              <MessageBarBody>
                Turno <strong>{original.turno}</strong> · {original.municipio?.nombre} · Estatus: <strong>{original.estatus}</strong>
              </MessageBarBody>
            </MessageBar>
            <SolicitudForm solicitud={solicitud} onChange={setSolicitud} errores={errores} catalogos={catalogos} />
            <div className="acciones">
              <Button type="submit" appearance="primary" icon={<Checkmark20Regular />} disabled={ocupado}>
                {ocupado ? 'Guardando cambios' : 'Guardar cambios'}
              </Button>
              <Button onClick={reiniciar}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}
