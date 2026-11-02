import HttpClient from './HttpClient';
import TokenStorage from './TokenStorage';

class AuthService {
  constructor(http = HttpClient.getInstance()) {
    this.http = http;
  }

  obtenerCaptcha() {
    return this.http.get('/auth/captcha');
  }

  async login(usuario, password, captchaId, captchaTexto) {
    const { token, usuario: perfil } = await this.http.post('/auth/login', { usuario, password, captchaId, captchaTexto });
    TokenStorage.set(token);
    return perfil;
  }

  async perfil() {
    if (!TokenStorage.get()) return null;
    try {
      return await this.http.get('/auth/perfil');
    } catch {
      TokenStorage.clear();
      return null;
    }
  }

  async logout() {
    try {
      await this.http.post('/auth/logout');
    } finally {
      TokenStorage.clear();
    }
  }
}

export default new AuthService();
