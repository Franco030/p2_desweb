import HttpClient from './HttpClient';

/** Operaciones de administradores sobre solicitudes. */
class SolicitudService {
  constructor(http = HttpClient.getInstance()) {
    this.http = http;
  }

  listar(filtros = {}) {
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v));
    return this.http.get('/solicitudes', params);
  }

  crear(solicitud) {
    return this.http.post('/solicitudes', solicitud.toPayload({ incluirEstatus: true }));
  }

  actualizar(id, solicitud) {
    return this.http.put(`/solicitudes/${id}`, solicitud.toPayload({ incluirEstatus: true }));
  }

  cambiarEstatus(id, estatus) {
    return this.http.patch(`/solicitudes/${id}/estatus`, { estatus });
  }

  eliminar(id) {
    return this.http.delete(`/solicitudes/${id}`);
  }

  comprobante(id) {
    return this.http.blob(`/solicitudes/${id}/comprobante`);
  }

  resumen(municipioId) {
    return this.http.get('/dashboard', municipioId ? { municipioId } : undefined);
  }
}

export default new SolicitudService();
