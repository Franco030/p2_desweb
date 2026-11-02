const { Router } = require('express');
const CatalogoController = require('../controllers/CatalogoController');
const AuthMiddleware = require('../middleware/AuthMiddleware');
const { Municipio, NivelEducativo, Asunto } = require('../models');

/**
 * Patrón Factory: crea el controlador y el router REST de cada catálogo
 * a partir de su nombre, sin repetir código por catálogo.
 */
class CatalogoFactory {
  static #modelos = {
    municipios: Municipio,
    niveles: NivelEducativo,
    asuntos: Asunto,
  };

  static tipos() {
    return Object.keys(this.#modelos);
  }

  static crearControlador(tipo) {
    const modelo = this.#modelos[tipo];
    if (!modelo) throw new Error(`Catálogo desconocido: ${tipo}`);
    return new CatalogoController(modelo);
  }

  static crearRouter(tipo) {
    const ctrl = this.crearControlador(tipo);
    const router = Router();
    router.get('/', ctrl.listar);
    router.get('/:id', ctrl.obtener);
    router.post('/', AuthMiddleware.requerir, ctrl.crear);
    router.put('/:id', AuthMiddleware.requerir, ctrl.actualizar);
    router.delete('/:id', AuthMiddleware.requerir, ctrl.eliminar);
    return router;
  }
}

module.exports = CatalogoFactory;
