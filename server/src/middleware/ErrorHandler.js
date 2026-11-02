const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');
const HttpError = require('../utils/HttpError');

class ErrorHandler {
  static noEncontrado(req, res) {
    res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
  }

  // eslint-disable-next-line no-unused-vars
  static manejar(err, req, res, next) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ mensaje: err.message, detalles: err.detalles });
    }
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ mensaje: err.errors[0]?.message || 'Registro duplicado' });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ mensaje: err.errors.map((e) => e.message).join('. '), detalles: err.errors.map((e) => ({ campo: e.path, mensaje: e.message })) });
    }
    if (err instanceof ForeignKeyConstraintError) {
      return res.status(409).json({ mensaje: 'El registro está en uso por otras solicitudes' });
    }
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = ErrorHandler;
