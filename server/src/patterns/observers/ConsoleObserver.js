/** Observador que muestra los eventos de solicitud en la consola del servidor. */
class ConsoleObserver {
  update(evento, datos) {
    console.log(`[${new Date().toISOString()}] ${evento} -> turno ${datos.turno} (municipio ${datos.municipioId})`);
  }
}

module.exports = ConsoleObserver;
