import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components';

export default function ConfirmDialog({ abierto, titulo, mensaje, textoConfirmar = 'Eliminar', onConfirmar, onCancelar }) {
  return (
    <Dialog open={abierto} onOpenChange={(_, { open }) => !open && onCancelar()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogContent>{mensaje}</DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onCancelar}>Cancelar</Button>
            <Button appearance="primary" className="boton-peligro" onClick={onConfirmar}>{textoConfirmar}</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
