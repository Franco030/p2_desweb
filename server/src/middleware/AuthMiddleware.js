const authService = require('../services/AuthService');

class AuthMiddleware {
  static requerir(req, res, next) {
    const [tipo, token] = (req.headers.authorization || '').split(' ');
    if (tipo !== 'Bearer' || !token) {
      return res.status(401).json({ mensaje: 'Sesión requerida' });
    }
    try {
      req.usuario = authService.verificarToken(token);
      return next();
    } catch {
      return res.status(401).json({ mensaje: 'Sesión inválida o expirada' });
    }
  }
}

module.exports = AuthMiddleware;
