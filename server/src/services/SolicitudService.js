const { Op } = require('sequelize');
const { Solicitud, Municipio, NivelEducativo, Asunto, sequelize } = require('../models');
const solicitudSubject = require('../patterns/SolicitudSubject');
const HttpError = require('../utils/HttpError');

const { EVENTOS } = solicitudSubject.constructor;

class SolicitudService {
  static CAMPOS_EDITABLES = [
    'nombreTramitante', 'curp', 'nombre', 'paterno', 'materno',
    'telefono', 'celular', 'correo', 'municipioId', 'nivelId', 'asuntoId',
  ];

  static INCLUDES = [
    { model: Municipio, as: 'municipio', attributes: ['id', 'nombre'] },
    { model: NivelEducativo, as: 'nivel', attributes: ['id', 'nombre'] },
    { model: Asunto, as: 'asunto', attributes: ['id', 'nombre'] },
  ];

  #limpiar(datos, { permitirEstatus = false } = {}) {
    const campos = permitirEstatus ? [...SolicitudService.CAMPOS_EDITABLES, 'estatus'] : SolicitudService.CAMPOS_EDITABLES;
    const limpio = {};
    for (const campo of campos) {
      if (datos[campo] === undefined) continue;
      const valor = typeof datos[campo] === 'string' ? datos[campo].trim() : datos[campo];
      limpio[campo] = valor === '' && ['materno', 'telefono'].includes(campo) ? null : valor;
    }
    return limpio;
  }

  async #validarCatalogos({ municipioId, nivelId, asuntoId }, transaction) {
    const verificaciones = [
      [Municipio, municipioId, 'municipio'],
      [NivelEducativo, nivelId, 'nivel educativo'],
      [Asunto, asuntoId, 'asunto'],
    ];
    for (const [modelo, id, etiqueta] of verificaciones) {
      if (id === undefined) continue;
      const registro = await modelo.findByPk(id, { transaction });
      if (!registro || !registro.activo) throw new HttpError(400, `Selecciona un ${etiqueta} válido`);
    }
  }

  /** El turno es consecutivo e independiente para cada municipio (1..n). */
  async #siguienteTurno(municipioId, transaction) {
    const max = await Solicitud.max('turno', { where: { municipioId }, transaction });
    return (max || 0) + 1;
  }

  async listar({ q, municipioId, estatus } = {}) {
    const where = {};
    if (municipioId) where.municipioId = municipioId;
    if (estatus) where.estatus = estatus;
    if (q && q.trim()) {
      const texto = `%${q.trim()}%`;
      where[Op.or] = [
        { curp: { [Op.like]: texto } },
        sequelize.where(
          sequelize.literal(`"Solicitud"."nombre" || ' ' || "Solicitud"."paterno" || ' ' || IFNULL("Solicitud"."materno", '')`),
          { [Op.like]: texto }
        ),
        { nombreTramitante: { [Op.like]: texto } },
      ];
    }
    return Solicitud.findAll({
      where,
      include: SolicitudService.INCLUDES,
      order: [['createdAt', 'DESC']],
    });
  }

  async obtener(id) {
    const solicitud = await Solicitud.findByPk(id, { include: SolicitudService.INCLUDES });
    if (!solicitud) throw new HttpError(404, 'Solicitud no encontrada');
    return solicitud;
  }

  async crear(datos, { permitirEstatus = false } = {}) {
    const limpio = this.#limpiar(datos, { permitirEstatus });
    const creada = await sequelize.transaction(async (transaction) => {
      await this.#validarCatalogos(limpio, transaction);
      limpio.turno = await this.#siguienteTurno(limpio.municipioId, transaction);
      return Solicitud.create(limpio, { transaction });
    });
    solicitudSubject.notify(EVENTOS.CREADA, creada.get());
    return this.obtener(creada.id);
  }

  async actualizar(id, datos, { permitirEstatus = false } = {}) {
    const limpio = this.#limpiar(datos, { permitirEstatus });
    await sequelize.transaction(async (transaction) => {
      const solicitud = await Solicitud.findByPk(id, { transaction });
      if (!solicitud) throw new HttpError(404, 'Solicitud no encontrada');
      await this.#validarCatalogos(limpio, transaction);
      // Si cambia de municipio, se le asigna un nuevo turno en el municipio destino.
      if (limpio.municipioId && Number(limpio.municipioId) !== solicitud.municipioId) {
        limpio.turno = await this.#siguienteTurno(limpio.municipioId, transaction);
      }
      await solicitud.update(limpio, { transaction });
      solicitudSubject.notify(EVENTOS.ACTUALIZADA, solicitud.get());
    });
    return this.obtener(id);
  }

  async cambiarEstatus(id, estatus) {
    if (!Object.values(Solicitud.ESTATUS).includes(estatus)) {
      throw new HttpError(400, 'Estatus inválido');
    }
    const solicitud = await this.obtener(id);
    await solicitud.update({ estatus });
    solicitudSubject.notify(EVENTOS.ESTATUS, solicitud.get());
    return solicitud;
  }

  async eliminar(id) {
    const solicitud = await this.obtener(id);
    const datos = solicitud.get();
    await solicitud.destroy();
    solicitudSubject.notify(EVENTOS.ELIMINADA, datos);
  }

  /** Búsqueda pública: el ciudadano se identifica con su CURP y número de turno. */
  async buscarPorCurpYTurno(curp, turno) {
    const curpNormalizada = String(curp || '').trim().toUpperCase();
    const numeroTurno = Number(turno);
    if (!Solicitud.CURP_REGEX.test(curpNormalizada) || !Number.isInteger(numeroTurno) || numeroTurno < 1) {
      throw new HttpError(400, 'Captura una CURP válida y el número de turno');
    }
    const solicitud = await Solicitud.findOne({
      where: { curp: curpNormalizada, turno: numeroTurno },
      include: SolicitudService.INCLUDES,
      order: [['updatedAt', 'DESC']],
    });
    if (!solicitud) throw new HttpError(404, 'No existe una solicitud con esa CURP y número de turno');
    return solicitud;
  }

  async verificarPropietario(id, curp, turno) {
    const solicitud = await this.obtener(id);
    if (solicitud.curp !== String(curp || '').trim().toUpperCase() || solicitud.turno !== Number(turno)) {
      throw new HttpError(403, 'La CURP y el turno no corresponden a la solicitud');
    }
    return solicitud;
  }

  async resumen(municipioId) {
    const where = municipioId ? { municipioId } : {};
    const filas = await Solicitud.findAll({
      where,
      attributes: ['municipioId', 'estatus', [sequelize.fn('COUNT', sequelize.col('Solicitud.id')), 'total']],
      include: [{ model: Municipio, as: 'municipio', attributes: ['nombre'] }],
      group: ['municipioId', 'estatus'],
      raw: true,
    });

    const porMunicipio = new Map();
    let resueltas = 0;
    let pendientes = 0;
    for (const fila of filas) {
      const total = Number(fila.total);
      const clave = fila.municipioId;
      if (!porMunicipio.has(clave)) {
        porMunicipio.set(clave, { municipioId: clave, municipio: fila['municipio.nombre'], Resuelto: 0, Pendiente: 0 });
      }
      porMunicipio.get(clave)[fila.estatus] += total;
      if (fila.estatus === Solicitud.ESTATUS.RESUELTO) resueltas += total;
      else pendientes += total;
    }

    return {
      total: resueltas + pendientes,
      resueltas,
      pendientes,
      porMunicipio: [...porMunicipio.values()].sort((a, b) => a.municipio.localeCompare(b.municipio)),
    };
  }
}

module.exports = new SolicitudService();
