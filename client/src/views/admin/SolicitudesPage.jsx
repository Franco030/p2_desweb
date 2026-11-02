import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Tooltip,
} from '@fluentui/react-components';
import {
  Add24Regular,
  ArrowDownload24Regular,
  Checkmark24Regular,
  Clock24Regular,
  Delete24Regular,
  Edit24Regular,
  Search24Regular,
} from '@fluentui/react-icons';
import PageHeader from '../components/PageHeader';
import SolicitudForm from '../components/SolicitudForm';
import ConfirmDialog from '../components/ConfirmDialog';
import SolicitudModel from '../../models/SolicitudModel';
import solicitudService from '../../services/SolicitudService';
import ArchivoService from '../../services/ArchivoService';
import useCatalogos from '../../hooks/useCatalogos';
import useNotificar from '../../hooks/useNotificar';
import useUltimoValor from '../../hooks/useUltimoValor';

function EstatusBadge({ estatus }) {
  return (
    <Badge appearance="tint" color={estatus === 'Resuelto' ? 'success' : 'warning'} shape="rounded">
      {estatus}
    </Badge>
  );
}

export default function SolicitudesPage() {
  const catalogos = useCatalogos({ soloActivos: false });
  const notificar = useNotificar();
  const [filtros, setFiltros] = useState({ q: '', municipioId: '', estatus: '' });
  const [solicitudes, setSolicitudes] = useState(null);
  const [error, setError] = useState(null);
  const [edicion, setEdicion] = useState(null); // { solicitud: SolicitudModel, errores }
  const [guardando, setGuardando] = useState(false);
  const [porEliminar, setPorEliminar] = useState(null);
  const vista = useUltimoValor(edicion);
  const vistaEliminar = useUltimoValor(porEliminar);

  const cargar = useCallback(async (f) => {
    setError(null);
    try {
      setSolicitudes(await solicitudService.listar(f));
    } catch (err) {
      setError(err.message);
      setSolicitudes([]);
    }
  }, []);

  useEffect(() => {
    cargar({ q: '', municipioId: '', estatus: '' });
  }, [cargar]);

  const cambiarFiltro = (campo, valor) => {
    const nuevos = { ...filtros, [campo]: valor };
    setFiltros(nuevos);
    if (campo !== 'q') cargar(nuevos);
  };

  const buscar = (e) => {
    e.preventDefault();
    cargar(filtros);
  };

  const guardar = async (e) => {
    e.preventDefault();
    const errores = edicion.solicitud.validar();
    if (Object.keys(errores).length) return setEdicion({ ...edicion, errores });
    setGuardando(true);
    try {
      const { solicitud } = edicion;
      const res = solicitud.id
        ? await solicitudService.actualizar(solicitud.id, solicitud)
        : await solicitudService.crear(solicitud);
      notificar(solicitud.id ? `Solicitud con turno ${res.turno} actualizada` : `Solicitud registrada con turno ${res.turno}`);
      setEdicion(null);
      cargar(filtros);
    } catch (err) {
      setEdicion({ ...edicion, errorGeneral: err.message });
    } finally {
      setGuardando(false);
    }
  };

  const alternarEstatus = async (s) => {
    const estatus = s.estatus === 'Resuelto' ? 'Pendiente' : 'Resuelto';
    try {
      await solicitudService.cambiarEstatus(s.id, estatus);
      notificar(`Turno ${s.turno} marcado como ${estatus}`);
      cargar(filtros);
    } catch (err) {
      notificar(err.message, 'error');
    }
  };

  const descargar = async (s) => {
    try {
      ArchivoService.descargar(await solicitudService.comprobante(s.id), `comprobante-turno-${s.turno}-${s.curp}.pdf`);
    } catch (err) {
      notificar(err.message, 'error');
    }
  };

  const eliminar = async () => {
    try {
      await solicitudService.eliminar(porEliminar.id);
      notificar(`Solicitud con turno ${porEliminar.turno} eliminada`);
      cargar(filtros);
    } catch (err) {
      notificar(err.message, 'error');
    } finally {
      setPorEliminar(null);
    }
  };

  return (
    <>
      <PageHeader titulo="Solicitudes" descripcion="Consulta por CURP o nombre, registra, modifica, elimina y cambia el estatus.">
        <Button appearance="primary" icon={<Add24Regular />} onClick={() => setEdicion({ solicitud: new SolicitudModel(), errores: {} })}>
          Nueva solicitud
        </Button>
      </PageHeader>

      <Card className="panel">
        <form className="filtros" onSubmit={buscar}>
          <Field label="CURP o nombre" className="filtro-busqueda">
            <Input
              value={filtros.q}
              contentBefore={<Search24Regular />}
              placeholder="Ej. GARCIA o PEPJ100101..."
              onChange={(_, d) => cambiarFiltro('q', d.value)}
            />
          </Field>
          <Field label="Municipio">
            <Select value={filtros.municipioId} onChange={(_, d) => cambiarFiltro('municipioId', d.value)}>
              <option value="">Todos</option>
              {catalogos.municipios.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </Select>
          </Field>
          <Field label="Estatus">
            <Select value={filtros.estatus} onChange={(_, d) => cambiarFiltro('estatus', d.value)}>
              <option value="">Todos</option>
              {SolicitudModel.ESTATUS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </Select>
          </Field>
          <Button type="submit" appearance="primary" icon={<Search24Regular />}>Buscar</Button>
        </form>

        {error && <MessageBar intent="error" className="mb"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
        {!solicitudes ? (
          <Spinner label="Cargando solicitudes..." />
        ) : solicitudes.length === 0 ? (
          <Text className="texto-secundario">No se encontraron solicitudes.</Text>
        ) : (
          <>
            <Text size={200} className="texto-secundario">{solicitudes.length} resultado(s)</Text>
            <div className="tabla-scroll">
              <Table aria-label="Solicitudes" className="tabla">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell className="col-turno">Turno</TableHeaderCell>
                    <TableHeaderCell>Alumno</TableHeaderCell>
                    <TableHeaderCell className="ocultar-md">CURP</TableHeaderCell>
                    <TableHeaderCell className="ocultar-sm">Municipio</TableHeaderCell>
                    <TableHeaderCell className="ocultar-md">Nivel</TableHeaderCell>
                    <TableHeaderCell>Estatus</TableHeaderCell>
                    <TableHeaderCell className="col-acciones">Acciones</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudes.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="col-turno"><strong>{s.turno}</strong></TableCell>
                      <TableCell>
                        <div className="celda-alumno">
                          <span>{[s.nombre, s.paterno, s.materno].filter(Boolean).join(' ')}</span>
                          <Text size={200} className="texto-secundario solo-md">{s.curp} · {s.municipio?.nombre}</Text>
                        </div>
                      </TableCell>
                      <TableCell className="ocultar-md">{s.curp}</TableCell>
                      <TableCell className="ocultar-sm">{s.municipio?.nombre}</TableCell>
                      <TableCell className="ocultar-md">{s.nivel?.nombre}</TableCell>
                      <TableCell><EstatusBadge estatus={s.estatus} /></TableCell>
                      <TableCell className="col-acciones">
                        <div className="acciones-fila">
                          <Tooltip content={s.estatus === 'Resuelto' ? 'Marcar como Pendiente' : 'Marcar como Resuelto'} relationship="label">
                            <Button
                              appearance="subtle"
                              icon={s.estatus === 'Resuelto' ? <Clock24Regular /> : <Checkmark24Regular />}
                              onClick={() => alternarEstatus(s)}
                            />
                          </Tooltip>
                          <Tooltip content="Editar" relationship="label">
                            <Button appearance="subtle" icon={<Edit24Regular />} onClick={() => setEdicion({ solicitud: new SolicitudModel(s), errores: {} })} />
                          </Tooltip>
                          <Tooltip content="Comprobante PDF" relationship="label">
                            <Button appearance="subtle" icon={<ArrowDownload24Regular />} onClick={() => descargar(s)} />
                          </Tooltip>
                          <Tooltip content="Eliminar" relationship="label">
                            <Button appearance="subtle" icon={<Delete24Regular />} onClick={() => setPorEliminar(s)} />
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>

      <Dialog open={!!edicion} onOpenChange={(_, { open }) => !open && setEdicion(null)}>
        <DialogSurface className="dialogo-ancho">
          {vista && (
            <form onSubmit={guardar} noValidate>
              <DialogBody>
                <DialogTitle>
                  {vista.solicitud.id ? `Editar solicitud · turno ${vista.solicitud.turno}` : 'Nueva solicitud'}
                </DialogTitle>
                <DialogContent>
                  {vista.errorGeneral && (
                    <MessageBar intent="error" className="mb"><MessageBarBody>{vista.errorGeneral}</MessageBarBody></MessageBar>
                  )}
                  <SolicitudForm
                    solicitud={vista.solicitud}
                    onChange={(s) => setEdicion({ ...edicion, solicitud: s })}
                    errores={vista.errores}
                    catalogos={catalogos}
                    mostrarEstatus
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEdicion(null)}>Cancelar</Button>
                  <Button type="submit" appearance="primary" disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </Button>
                </DialogActions>
              </DialogBody>
            </form>
          )}
        </DialogSurface>
      </Dialog>

      <ConfirmDialog
        abierto={!!porEliminar}
        titulo="Eliminar solicitud"
        mensaje={vistaEliminar && `¿Eliminar la solicitud con turno ${vistaEliminar.turno} de ${vistaEliminar.nombre} ${vistaEliminar.paterno}? Esta acción no se puede deshacer.`}
        onConfirmar={eliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </>
  );
}
