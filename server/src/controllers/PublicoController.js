const solicitudService = require('../services/SolicitudService');
const comprobantePdf = require('../services/ComprobantePdfService');
const { SolicitudController } = require('./SolicitudController');

/** Operaciones del portal público: registrar, consultar/modificar con CURP + turno y descargar comprobante. */
class PublicoController {
  registrar = async (req, res) => {
    res.status(201).json(await solicitudService.crear(req.body));
  };

  buscar = async (req, res) => {
    const { curp, turno } = req.body;
    res.json(await solicitudService.buscarPorCurpYTurno(curp, turno));
  };

  modificar = async (req, res) => {
    const { curpActual, turnoActual, ...datos } = req.body;
    await solicitudService.verificarPropietario(req.params.id, curpActual, turnoActual);
    res.json(await solicitudService.actualizar(req.params.id, datos));
  };

  comprobante = async (req, res) => {
    const solicitud = await solicitudService.verificarPropietario(req.params.id, req.query.curp, req.query.turno);
    SolicitudController.enviarPdf(res, solicitud, await comprobantePdf.generar(solicitud));
  };
}

module.exports = new PublicoController();
