import HttpClient from './HttpClient';

/** Operaciones del portal público (sin sesión). */
class PublicoService {
  constructor(http = HttpClient.getInstance()) {
    this.http = http;
  }

  registrar(solicitud) {
    return this.http.post('/publico/solicitudes', solicitud.toPayload());
  }

  buscar(curp, turno) {
    return this.http.post('/publico/solicitudes/buscar', { curp, turno });
  }

  modificar(id, solicitud, { curpActual, turnoActual }) {
    return this.http.put(`/publico/solicitudes/${id}`, { ...solicitud.toPayload(), curpActual, turnoActual });
  }

  comprobante({ id, curp, turno }) {
    return this.http.blob(`/publico/solicitudes/${id}/comprobante`, { curp, turno });
  }
}

export default new PublicoService();
