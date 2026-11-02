import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components';

/**
 * Diálogo de alerta de Fluent 2 para acciones destructivas:
 * solo se cierra con los botones del pie y el primario va primero.
 */
export default function ConfirmDialog({ abierto, titulo, mensaje, textoConfirmar = 'Eliminar', onConfirmar, onCancelar }) {
  return (
    <Dialog modalType="alert" open={abierto} onOpenChange={(_, { open }) => !open && onCancelar()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogContent>{mensaje}</DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onConfirmar}>{textoConfirmar}</Button>
            <Button onClick={onCancelar}>Cancelar</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
