const crypto = require('crypto');
const svgCaptcha = require('svg-captcha');

/** Genera y valida captchas de un solo uso, guardados en memoria con expiración. */
class CaptchaService {
  #store = new Map();

  constructor(ttlMs = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  generar() {
    this.#limpiarExpirados();
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 3,
      color: true,
      ignoreChars: '0oO1ilI',
      background: '#f3f2f1',
      width: 160,
      height: 56,
    });
    const id = crypto.randomUUID();
    this.#store.set(id, { texto: captcha.text.toLowerCase(), expira: Date.now() + this.ttlMs });
    return { id, svg: captcha.data };
  }

  validar(id, texto) {
    const entrada = this.#store.get(id);
    this.#store.delete(id); // un solo intento por captcha
    if (!entrada || entrada.expira < Date.now()) return false;
    return entrada.texto === String(texto || '').trim().toLowerCase();
  }

  #limpiarExpirados() {
    const ahora = Date.now();
    for (const [id, { expira }] of this.#store) {
      if (expira < ahora) this.#store.delete(id);
    }
  }
}

module.exports = new CaptchaService();
