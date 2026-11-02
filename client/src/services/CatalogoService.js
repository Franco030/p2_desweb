import HttpClient from './HttpClient';

/** Servicio CRUD genérico de un catálogo; se instancia una vez por tipo. */
export default class CatalogoService {
  static TIPOS = Object.freeze({
    municipios: { titulo: 'Municipios', singular: 'municipio' },
    niveles: { titulo: 'Niveles educativos', singular: 'nivel educativo' },
    asuntos: { titulo: 'Asuntos', singular: 'asunto' },
  });

  static #instancias = new Map();

  static de(tipo) {
    if (!CatalogoService.TIPOS[tipo]) throw new Error(`Catálogo desconocido: ${tipo}`);
    if (!this.#instancias.has(tipo)) this.#instancias.set(tipo, new CatalogoService(tipo));
    return this.#instancias.get(tipo);
  }

  constructor(tipo, http = HttpClient.getInstance()) {
    this.tipo = tipo;
    this.base = `/catalogos/${tipo}`;
    this.http = http;
  }

  get info() {
    return CatalogoService.TIPOS[this.tipo];
  }

  listar({ soloActivos = false } = {}) {
    return this.http.get(this.base, soloActivos ? { activos: 1 } : undefined);
  }

  crear(datos) {
    return this.http.post(this.base, datos);
  }

  actualizar(id, datos) {
    return this.http.put(`${this.base}/${id}`, datos);
  }

  eliminar(id) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
