const authService = require('../services/AuthService');
const captchaService = require('../services/CaptchaService');
const { Usuario } = require('../models');

class AuthController {
  captcha = (req, res) => {
    res.json(captchaService.generar());
  };

  login = async (req, res) => {
    res.json(await authService.login(req.body));
  };

  perfil = async (req, res) => {
    const usuario = await Usuario.findByPk(req.usuario.sub);
    if (!usuario) return res.status(401).json({ mensaje: 'Sesión inválida' });
    return res.json(usuario);
  };

  logout = (req, res) => {
    // JWT es sin estado: el cliente descarta el token; se responde para cerrar el flujo.
    res.json({ mensaje: 'Sesión cerrada' });
  };
}

module.exports = new AuthController();
