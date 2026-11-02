/**
 * Patrón Observer: sujeto que notifica a los observadores registrados
 * cada vez que ocurre un evento sobre una solicitud (alta, cambio, baja...).
 */
class SolicitudSubject {
  static EVENTOS = Object.freeze({
    CREADA: 'SOLICITUD_CREADA',
    ACTUALIZADA: 'SOLICITUD_ACTUALIZADA',
    ESTATUS: 'SOLICITUD_ESTATUS',
    ELIMINADA: 'SOLICITUD_ELIMINADA',
  });

  #observers = new Set();

  subscribe(observer) {
    if (typeof observer.update !== 'function') {
      throw new Error('El observador debe implementar update(evento, datos)');
    }
    this.#observers.add(observer);
    return () => this.#observers.delete(observer);
  }

  unsubscribe(observer) {
    this.#observers.delete(observer);
  }

  notify(evento, datos) {
    for (const observer of this.#observers) {
      Promise.resolve()
        .then(() => observer.update(evento, datos))
        .catch((err) => console.error(`[Observer] ${observer.constructor.name}:`, err.message));
    }
  }
}

module.exports = new SolicitudSubject();
module.exports.SolicitudSubject = SolicitudSubject;
