const { Bitacora } = require('../../models');

/** Observador que registra cada evento de solicitud en la tabla bitacora. */
class BitacoraObserver {
  async update(evento, datos) {
    const detalle = `Turno ${datos.turno} | CURP ${datos.curp} | Municipio ${datos.municipioId}` +
      (datos.estatus ? ` | Estatus ${datos.estatus}` : '');
    await Bitacora.create({ evento, detalle });
  }
}

module.exports = BitacoraObserver;
