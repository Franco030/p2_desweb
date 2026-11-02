import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
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
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Tooltip,
} from '@fluentui/react-components';
import { Add24Regular, Delete24Regular, Edit24Regular, Search24Regular } from '@fluentui/react-icons';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import CatalogoService from '../../services/CatalogoService';
import useNotificar from '../../hooks/useNotificar';
import useUltimoValor from '../../hooks/useUltimoValor';

/** CRUD genérico para los catálogos: municipios, niveles y asuntos. */
export default function CatalogoPage() {
  const { tipo } = useParams();
  const notificar = useNotificar();
  const [registros, setRegistros] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [error, setError] = useState(null);
  const [edicion, setEdicion] = useState(null); // { id, nombre, activo, error }
  const [porEliminar, setPorEliminar] = useState(null);
  const vista = useUltimoValor(edicion);
  const vistaEliminar = useUltimoValor(porEliminar);

  const valido = Boolean(CatalogoService.TIPOS[tipo]);
  const servicio = valido ? CatalogoService.de(tipo) : null;

  const cargar = useCallback(async () => {
    if (!servicio) return;
    setError(null);
    try {
      setRegistros(await servicio.listar());
    } catch (err) {
      setError(err.message);
    }
  }, [servicio]);

  useEffect(() => {
    setRegistros(null);
    setFiltro('');
    cargar();
  }, [cargar]);

  if (!valido) return <Navigate to="/admin" replace />;
  const { titulo, singular } = servicio.info;

  const guardar = async (e) => {
    e.preventDefault();
    if (!edicion.nombre.trim()) return setEdicion({ ...edicion, error: 'El nombre es obligatorio' });
    try {
      const datos = { nombre: edicion.nombre.trim(), activo: edicion.activo };
      if (edicion.id) await servicio.actualizar(edicion.id, datos);
      else await servicio.crear(datos);
      notificar(`${singular[0].toUpperCase()}${singular.slice(1)} guardado`);
      setEdicion(null);
      cargar();
    } catch (err) {
      setEdicion({ ...edicion, error: err.message });
    }
  };

  const alternarActivo = async (r) => {
    try {
      await servicio.actualizar(r.id, { activo: !r.activo });
      cargar();
    } catch (err) {
      notificar(err.message, 'error');
    }
  };

  const eliminar = async () => {
    try {
      await servicio.eliminar(porEliminar.id);
      notificar(`"${porEliminar.nombre}" eliminado`);
      cargar();
    } catch (err) {
      notificar(err.message, 'error');
    } finally {
      setPorEliminar(null);
    }
  };

  const visibles = (registros || []).filter((r) => r.nombre.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <>
      <PageHeader titulo={titulo} descripcion={`Catálogo de ${titulo.toLowerCase()}. Los inactivos no aparecen en el formulario público.`}>
        <Button appearance="primary" icon={<Add24Regular />} onClick={() => setEdicion({ id: null, nombre: '', activo: true })}>
          Agregar
        </Button>
      </PageHeader>

      <Card className="panel">
        <Field label="Buscar" className="filtro-catalogo">
          <Input value={filtro} contentBefore={<Search24Regular />} onChange={(_, d) => setFiltro(d.value)} />
        </Field>
        {error && <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
        {!registros ? (
          <Spinner label="Cargando..." />
        ) : (
          <div className="tabla-scroll">
            <Table aria-label={titulo} className="tabla">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell className="col-turno">ID</TableHeaderCell>
                  <TableHeaderCell>Nombre</TableHeaderCell>
                  <TableHeaderCell className="col-activo">Activo</TableHeaderCell>
                  <TableHeaderCell className="col-acciones-cat">Acciones</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="col-turno">{r.id}</TableCell>
                    <TableCell>{r.nombre}</TableCell>
                    <TableCell className="col-activo">
                      <Switch checked={r.activo} onChange={() => alternarActivo(r)} aria-label={`Activo ${r.nombre}`} />
                    </TableCell>
                    <TableCell className="col-acciones-cat">
                      <div className="acciones-fila">
                        <Tooltip content="Editar" relationship="label">
                          <Button appearance="subtle" icon={<Edit24Regular />} onClick={() => setEdicion({ ...r })} />
                        </Tooltip>
                        <Tooltip content="Eliminar" relationship="label">
                          <Button appearance="subtle" icon={<Delete24Regular />} onClick={() => setPorEliminar(r)} />
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {visibles.length === 0 && <Text className="texto-secundario">Sin registros.</Text>}
          </div>
        )}
      </Card>

      <Dialog open={!!edicion} onOpenChange={(_, { open }) => !open && setEdicion(null)}>
        <DialogSurface>
          {vista && (
            <form onSubmit={guardar}>
              <DialogBody>
                <DialogTitle>{vista.id ? `Editar ${singular}` : `Agregar ${singular}`}</DialogTitle>
                <DialogContent className="dialogo-campos">
                  <Field label="Nombre" required validationMessage={vista.error}>
                    <Input value={vista.nombre} maxLength={150} onChange={(_, d) => setEdicion({ ...edicion, nombre: d.value, error: null })} />
                  </Field>
                  <Switch label="Activo" checked={vista.activo} onChange={(_, d) => setEdicion({ ...edicion, activo: d.checked })} />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEdicion(null)}>Cancelar</Button>
                  <Button type="submit" appearance="primary">Guardar</Button>
                </DialogActions>
              </DialogBody>
            </form>
          )}
        </DialogSurface>
      </Dialog>

      <ConfirmDialog
        abierto={!!porEliminar}
        titulo={`Eliminar ${singular}`}
        mensaje={vistaEliminar && `¿Eliminar "${vistaEliminar.nombre}"? Si tiene solicitudes asociadas no se podrá eliminar; en ese caso desactívalo.`}
        onConfirmar={eliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </>
  );
}
