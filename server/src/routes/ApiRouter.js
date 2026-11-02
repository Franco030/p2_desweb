const { Router } = require('express');
const AuthMiddleware = require('../middleware/AuthMiddleware');
const CatalogoFactory = require('../patterns/CatalogoFactory');
const authController = require('../controllers/AuthController');
const solicitudController = require('../controllers/SolicitudController');
const publicoController = require('../controllers/PublicoController');
const dashboardController = require('../controllers/DashboardController');

/** Define todas las rutas de la API REST bajo /api. */
class ApiRouter {
  constructor() {
    this.router = Router();
    this.#auth();
    this.#catalogos();
    this.#publico();
    this.#solicitudes();
    this.#dashboard();
  }

  #auth() {
    const r = Router();
    r.get('/captcha', authController.captcha);
    r.post('/login', authController.login);
    r.post('/logout', AuthMiddleware.requerir, authController.logout);
    r.get('/perfil', AuthMiddleware.requerir, authController.perfil);
    this.router.use('/auth', r);
  }

  #catalogos() {
    for (const tipo of CatalogoFactory.tipos()) {
      this.router.use(`/catalogos/${tipo}`, CatalogoFactory.crearRouter(tipo));
    }
  }

  #publico() {
    const r = Router();
    r.post('/solicitudes', publicoController.registrar);
    r.post('/solicitudes/buscar', publicoController.buscar);
    r.put('/solicitudes/:id', publicoController.modificar);
    r.get('/solicitudes/:id/comprobante', publicoController.comprobante);
    this.router.use('/publico', r);
  }

  #solicitudes() {
    const r = Router();
    r.use(AuthMiddleware.requerir);
    r.get('/', solicitudController.listar);
    r.get('/:id', solicitudController.obtener);
    r.post('/', solicitudController.crear);
    r.put('/:id', solicitudController.actualizar);
    r.patch('/:id/estatus', solicitudController.cambiarEstatus);
    r.delete('/:id', solicitudController.eliminar);
    r.get('/:id/comprobante', solicitudController.comprobante);
    this.router.use('/solicitudes', r);
  }

  #dashboard() {
    this.router.get('/dashboard', AuthMiddleware.requerir, dashboardController.resumen);
  }
}

module.exports = ApiRouter;
