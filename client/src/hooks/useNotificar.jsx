import { useCallback } from 'react';
import { Toast, ToastTitle, useToastController } from '@fluentui/react-components';

export const TOASTER_ID = 'toaster-principal';

/** Muestra notificaciones tipo toast de Fluent: notificar('Guardado', 'success'). */
export default function useNotificar() {
  const { dispatchToast } = useToastController(TOASTER_ID);
  return useCallback(
    (mensaje, intent = 'success') =>
      dispatchToast(
        <Toast>
          <ToastTitle>{mensaje}</ToastTitle>
        </Toast>,
        { intent, timeout: 4000 }
      ),
    [dispatchToast]
  );
}
