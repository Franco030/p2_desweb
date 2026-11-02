const solicitudService = require('../services/SolicitudService');
const comprobantePdf = require('../services/ComprobantePdfService');

/** Operaciones de administradores (requieren sesión). */
class SolicitudController {
  listar = async (req, res) => {
    const { q, municipioId, estatus } = req.query;
    res.json(await solicitudService.listar({ q, municipioId, estatus }));
  };

  obtener = async (req, res) => {
    res.json(await solicitudService.obtener(req.params.id));
  };

  crear = async (req, res) => {
    res.status(201).json(await solicitudService.crear(req.body, { permitirEstatus: true }));
  };

  actualizar = async (req, res) => {
    res.json(await solicitudService.actualizar(req.params.id, req.body, { permitirEstatus: true }));
  };

  cambiarEstatus = async (req, res) => {
    res.json(await solicitudService.cambiarEstatus(req.params.id, req.body.estatus));
  };

  eliminar = async (req, res) => {
    await solicitudService.eliminar(req.params.id);
    res.status(204).end();
  };

  comprobante = async (req, res) => {
    const solicitud = await solicitudService.obtener(req.params.id);
    SolicitudController.enviarPdf(res, solicitud, await comprobantePdf.generar(solicitud));
  };

  static enviarPdf(res, solicitud, buffer) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="turno-${solicitud.turno}-${solicitud.curp}.pdf"`);
    res.send(buffer);
  }
}

module.exports = new SolicitudController();
module.exports.SolicitudController = SolicitudController;
