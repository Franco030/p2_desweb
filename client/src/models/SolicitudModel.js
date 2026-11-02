/** Modelo de la solicitud en el cliente: estado del formulario, validación y conversión a payload. */
export default class SolicitudModel {
  static CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
  static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  static ESTATUS = Object.freeze(['Pendiente', 'Resuelto']);
  static CAMPOS = [
    'nombreTramitante', 'curp', 'nombre', 'paterno', 'materno', 'telefono',
    'celular', 'correo', 'municipioId', 'nivelId', 'asuntoId', 'estatus',
  ];

  constructor(datos = {}) {
    this.id = datos.id ?? null;
    this.turno = datos.turno ?? null;
    for (const campo of SolicitudModel.CAMPOS) {
      const valor = datos[campo];
      this[campo] = valor === null || valor === undefined ? '' : String(valor);
    }
    if (!this.estatus) this.estatus = 'Pendiente';
    Object.freeze(this);
  }

  /** Devuelve una copia con el campo cambiado (inmutable para usarlo como estado de React). */
  con(campo, valor) {
    const normalizado = campo === 'curp' ? valor.toUpperCase().replace(/\s/g, '') : valor;
    return new SolicitudModel({ ...this, [campo]: normalizado });
  }

  validar() {
    const e = {};
    if (!this.nombreTramitante.trim()) e.nombreTramitante = 'Captura el nombre de quien realiza el trámite';
    if (!SolicitudModel.CURP_REGEX.test(this.curp)) e.curp = 'CURP inválida (18 caracteres)';
    if (!this.nombre.trim()) e.nombre = 'Captura el nombre';
    if (!this.paterno.trim()) e.paterno = 'Captura el apellido paterno';
    if (this.telefono && !/^\d{7,10}$/.test(this.telefono)) e.telefono = 'Solo dígitos (7 a 10)';
    if (!/^\d{10}$/.test(this.celular)) e.celular = 'El celular debe tener 10 dígitos';
    if (!SolicitudModel.EMAIL_REGEX.test(this.correo)) e.correo = 'Correo electrónico inválido';
    if (!this.municipioId) e.municipioId = 'Selecciona un municipio';
    if (!this.nivelId) e.nivelId = 'Selecciona un nivel';
    if (!this.asuntoId) e.asuntoId = 'Selecciona un asunto';
    return e;
  }

  toPayload({ incluirEstatus = false } = {}) {
    const payload = {};
    for (const campo of SolicitudModel.CAMPOS) {
      if (campo === 'estatus' && !incluirEstatus) continue;
      payload[campo] = this[campo].trim();
    }
    for (const fk of ['municipioId', 'nivelId', 'asuntoId']) payload[fk] = Number(payload[fk]);
    return payload;
  }

  get nombreCompleto() {
    return [this.nombre, this.paterno, this.materno].filter(Boolean).join(' ');
  }
}
