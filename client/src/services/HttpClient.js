import axios from 'axios';
import TokenStorage from './TokenStorage';

/**
 * Singleton: cliente HTTP único para consumir la API REST.
 * Agrega el token JWT a cada petición y normaliza los mensajes de error.
 */
export default class HttpClient {
  static #instance = null;
  #onUnauthorized = null;

  constructor() {
    if (HttpClient.#instance) throw new Error('Usa HttpClient.getInstance()');
    this.axios = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
    this.axios.interceptors.request.use((config) => {
      const token = TokenStorage.get();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    this.axios.interceptors.response.use(
      (res) => res,
      async (error) => {
        if (error.response?.status === 401 && TokenStorage.get() && this.#onUnauthorized) {
          this.#onUnauthorized();
        }
        throw new Error(await HttpClient.#mensajeDe(error));
      }
    );
  }

  static getInstance() {
    if (!HttpClient.#instance) HttpClient.#instance = new HttpClient();
    return HttpClient.#instance;
  }

  static async #mensajeDe(error) {
    let data = error.response?.data;
    if (data instanceof Blob) {
      try {
        data = JSON.parse(await data.text());
      } catch {
        data = null;
      }
    }
    if (data?.mensaje) return data.mensaje;
    if (!error.response) return 'No fue posible conectar con el servidor';
    return `Error ${error.response.status}`;
  }

  onUnauthorized(callback) {
    this.#onUnauthorized = callback;
  }

  async get(url, params) {
    return (await this.axios.get(url, { params })).data;
  }

  async post(url, body) {
    return (await this.axios.post(url, body)).data;
  }

  async put(url, body) {
    return (await this.axios.put(url, body)).data;
  }

  async patch(url, body) {
    return (await this.axios.patch(url, body)).data;
  }

  async delete(url) {
    return (await this.axios.delete(url)).data;
  }

  async blob(url, params) {
    return (await this.axios.get(url, { params, responseType: 'blob' })).data;
  }
}
