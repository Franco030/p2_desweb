const solicitudService = require('../services/SolicitudService');

class DashboardController {
  resumen = async (req, res) => {
    res.json(await solicitudService.resumen(req.query.municipioId));
  };
}

module.exports = new DashboardController();
