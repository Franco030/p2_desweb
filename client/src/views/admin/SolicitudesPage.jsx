import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Caption1,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  MessageBarBody,
  SearchBox,
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
  Add20Regular,
  ArrowDownload20Regular,
  Checkmark20Regular,
  Clock20Regular,
  Delete20Regular,
  Edit20Regular,
  MoreHorizontal20Regular,
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

/** Acciones de una fila: botones con tooltip en pantallas medianas y menú de desbordamiento en pantallas pequeñas. */
function AccionesFila({ solicitud, onEstatus, onEditar, onDescargar, onEliminar }) {
  const resuelta = solicitud.estatus === 'Resuelto';
  const acciones = [
    {
      etiqueta: resuelta ? 'Marcar como pendiente' : 'Marcar como resuelta',
      icono: resuelta ? <Clock20Regular /> : <Checkmark20Regular />,
      onClick: onEstatus,
    },
    { etiqueta: 'Editar', icono: <Edit20Regular />, onClick: onEditar },
    { etiqueta: 'Descargar comprobante', icono: <ArrowDownload20Regular />, onClick: onDescargar },
    { etiqueta: 'Eliminar', icono: <Delete20Regular />, onClick: onEliminar },
  ];

  return (
    <>
      <div className="acciones-fila ocultar-sm">
        {acciones.map((a) => (
          <Tooltip key={a.etiqueta} content={a.etiqueta} relationship="label">
            <Button appearance="subtle" icon={a.icono} onClick={a.onClick} />
          </Tooltip>
        ))}
      </div>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Tooltip content="Más acciones" relationship="label">
            <Button appearance="subtle" size="large" icon={<MoreHorizontal20Regular />} className="solo-sm" />
          </Tooltip>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {acciones.map((a) => (
              <MenuItem key={a.etiqueta} icon={a.icono} onClick={a.onClick}>{a.etiqueta}</MenuItem>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    </>
  );
}

const FILTROS_INICIALES = { q: '', municipioId: '', estatus: '' };

export default function SolicitudesPage() {
  const catalogos = useCatalogos({ soloActivos: false });
  const notificar = useNotificar();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [solicitudes, setSolicitudes] = useState(null);
  const [error, setError] = useState(null);
  const [edicion, setEdicion] = useState(null); // { solicitud: SolicitudModel, errores, errorGeneral }
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
    cargar(FILTROS_INICIALES);
  }, [cargar]);

  const cambiarFiltro = (campo, valor) => {
    const nuevos = { ...filtros, [campo]: valor };
    setFiltros(nuevos);
    // La búsqueda por texto se aplica al enviar; si se borra el texto, se recarga.
    if (campo !== 'q' || !valor) cargar(nuevos);
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
      notificar(`Turno ${s.turno} marcado como ${estatus.toLowerCase()}`);
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
        <Button appearance="primary" icon={<Add20Regular />} onClick={() => setEdicion({ solicitud: new SolicitudModel(), errores: {} })}>
          Nueva solicitud
        </Button>
      </PageHeader>

      <Card className="panel">
        <form className="filtros" onSubmit={buscar}>
          <Field label="CURP o nombre" className="filtro-busqueda">
            <SearchBox
              value={filtros.q}
              placeholder="GARCIA o GOML150310"
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
          <Button type="submit">Buscar</Button>
        </form>

        {error && <MessageBar intent="error" className="mb"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
        {!solicitudes ? (
          <Spinner label="Cargando solicitudes" />
        ) : solicitudes.length === 0 ? (
          <Text className="texto-secundario">No se encontraron solicitudes</Text>
        ) : (
          <>
            <Caption1 className="texto-secundario">{solicitudes.length} resultados</Caption1>
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
                    <TableHeaderCell className="col-acciones" aria-label="Acciones">
                      <span className="ocultar-sm">Acciones</span>
                    </TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudes.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="col-turno"><Text weight="semibold">{s.turno}</Text></TableCell>
                      <TableCell>
                        <div className="celda-alumno">
                          <span>{[s.nombre, s.paterno, s.materno].filter(Boolean).join(' ')}</span>
                          <Caption1 className="texto-secundario solo-md">{s.curp} · {s.municipio?.nombre}</Caption1>
                        </div>
                      </TableCell>
                      <TableCell className="ocultar-md">{s.curp}</TableCell>
                      <TableCell className="ocultar-sm">{s.municipio?.nombre}</TableCell>
                      <TableCell className="ocultar-md">{s.nivel?.nombre}</TableCell>
                      <TableCell><EstatusBadge estatus={s.estatus} /></TableCell>
                      <TableCell className="col-acciones">
                        <AccionesFila
                          solicitud={s}
                          onEstatus={() => alternarEstatus(s)}
                          onEditar={() => setEdicion({ solicitud: new SolicitudModel(s), errores: {} })}
                          onDescargar={() => descargar(s)}
                          onEliminar={() => setPorEliminar(s)}
                        />
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
                  {vista.solicitud.id ? `Editar solicitud con turno ${vista.solicitud.turno}` : 'Nueva solicitud'}
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
                  <Button type="submit" appearance="primary" disabled={guardando}>
                    {guardando ? 'Guardando' : 'Guardar'}
                  </Button>
                  <Button onClick={() => setEdicion(null)}>Cancelar</Button>
                </DialogActions>
              </DialogBody>
            </form>
          )}
        </DialogSurface>
      </Dialog>

      <ConfirmDialog
        abierto={!!porEliminar}
        titulo={vistaEliminar ? `¿Eliminar la solicitud con turno ${vistaEliminar.turno}?` : ''}
        mensaje={vistaEliminar && `Se borrarán los datos de ${vistaEliminar.nombre} ${vistaEliminar.paterno} y no se podrán recuperar.`}
        onConfirmar={eliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </>
  );
}
