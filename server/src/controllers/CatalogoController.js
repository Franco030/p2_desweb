const { Solicitud } = require('../models');
const HttpError = require('../utils/HttpError');

/** Controlador CRUD genérico; CatalogoFactory crea una instancia por catálogo. */
class CatalogoController {
  constructor(modelo) {
    this.modelo = modelo;
  }

  listar = async (req, res) => {
    const where = req.query.activos === '1' ? { activo: true } : {};
    res.json(await this.modelo.findAll({ where, order: [['nombre', 'ASC']] }));
  };

  obtener = async (req, res) => {
    res.json(await this.#buscar(req.params.id));
  };

  crear = async (req, res) => {
    const { nombre, activo = true } = req.body;
    const registro = await this.modelo.create({ nombre: String(nombre ?? '').trim(), activo: Boolean(activo) });
    res.status(201).json(registro);
  };

  actualizar = async (req, res) => {
    const registro = await this.#buscar(req.params.id);
    const cambios = {};
    if (req.body.nombre !== undefined) cambios.nombre = String(req.body.nombre).trim();
    if (req.body.activo !== undefined) cambios.activo = Boolean(req.body.activo);
    await registro.update(cambios);
    res.json(registro);
  };

  eliminar = async (req, res) => {
    const registro = await this.#buscar(req.params.id);
    const enUso = await Solicitud.count({ where: { [this.modelo.catalogo.foreignKey]: registro.id } });
    if (enUso > 0) {
      throw new HttpError(409, `No se puede eliminar: tiene ${enUso} solicitud(es) asociadas. Puedes desactivarlo.`);
    }
    await registro.destroy();
    res.status(204).end();
  };

  async #buscar(id) {
    const registro = await this.modelo.findByPk(id);
    if (!registro) throw new HttpError(404, 'Registro no encontrado');
    return registro;
  }
}

module.exports = CatalogoController;
