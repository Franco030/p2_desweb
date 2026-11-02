const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const captchaService = require('./CaptchaService');
const HttpError = require('../utils/HttpError');

class AuthService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'ticket-turno-secreto-dev';
    this.expiresIn = process.env.JWT_EXPIRES || '8h';
  }

  async login({ usuario, password, captchaId, captchaTexto }) {
    if (!captchaService.validar(captchaId, captchaTexto)) {
      throw new HttpError(400, 'El captcha es incorrecto o expiró');
    }
    const user = await Usuario.findOne({ where: { usuario: String(usuario || '').trim() } });
    if (!user || !(await user.verificarPassword(password || ''))) {
      throw new HttpError(401, 'Usuario o contraseña incorrectos');
    }
    const token = jwt.sign({ sub: user.id, usuario: user.usuario, rol: user.rol }, this.secret, {
      expiresIn: this.expiresIn,
    });
    return { token, usuario: user.toJSON() };
  }

  verificarToken(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = new AuthService();
