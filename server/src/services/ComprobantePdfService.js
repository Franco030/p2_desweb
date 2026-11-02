const PDFDocument = require('pdfkit');
const QrCodeAdapter = require('../patterns/QrCodeAdapter');

/** Genera el comprobante PDF de una solicitud, con QR que contiene la CURP del alumno. */
class ComprobantePdfService {
  static COLORES = { primario: '#0F6CBD', texto: '#242424', gris: '#616161', borde: '#D1D1D1', fondo: '#F5F5F5' };

  constructor(qrAdapter = new QrCodeAdapter()) {
    this.qrAdapter = qrAdapter;
  }

  async generar(solicitud) {
    const qr = await this.qrAdapter.generarPng(solicitud.curp);
    const doc = new PDFDocument({ size: 'LETTER', margin: 50, info: { Title: `Comprobante turno ${solicitud.turno}` } });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    const terminado = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    this.#encabezado(doc);
    this.#bloqueTurno(doc, solicitud, qr);
    this.#tablaDatos(doc, solicitud);
    this.#pie(doc, solicitud);

    doc.end();
    return terminado;
  }

  #encabezado(doc) {
    const { primario } = ComprobantePdfService.COLORES;
    doc.rect(0, 0, doc.page.width, 90).fill(primario);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(22).text('Ticket de Turno', 50, 28);
    doc.font('Helvetica').fontSize(11).text('Comprobante de solicitud de atención', 50, 56);
    doc.moveDown(3);
  }

  #bloqueTurno(doc, s, qr) {
    const { borde, gris, primario, texto, fondo } = ComprobantePdfService.COLORES;
    const top = 115;
    doc.roundedRect(50, top, 512, 150, 8).fillAndStroke(fondo, borde);

    doc.fillColor(gris).font('Helvetica').fontSize(11).text('NÚMERO DE TURNO', 70, top + 20);
    doc.fillColor(primario).font('Helvetica-Bold').fontSize(64).text(String(s.turno), 70, top + 38);
    doc.fillColor(texto).font('Helvetica-Bold').fontSize(13).text(`Municipio: ${s.municipio?.nombre ?? ''}`, 70, top + 112);

    doc.image(qr, 422, top + 12, { width: 125 });
    doc.fillColor(gris).font('Helvetica').fontSize(8).text(`CURP: ${s.curp}`, 412, top + 137, { width: 145, align: 'center' });
  }

  #tablaDatos(doc, s) {
    const { borde, gris, texto } = ComprobantePdfService.COLORES;
    const filas = [
      ['Folio interno', String(s.id)],
      ['Quien realiza el trámite', s.nombreTramitante],
      ['Nombre del alumno', [s.nombre, s.paterno, s.materno].filter(Boolean).join(' ')],
      ['CURP', s.curp],
      ['Nivel educativo', s.nivel?.nombre ?? ''],
      ['Asunto a tratar', s.asunto?.nombre ?? ''],
      ['Teléfono', s.telefono || '—'],
      ['Celular', s.celular],
      ['Correo electrónico', s.correo],
      ['Estatus', s.estatus],
      ['Fecha de registro', new Date(s.createdAt).toLocaleString('es-MX')],
    ];

    let y = 290;
    doc.fillColor(texto).font('Helvetica-Bold').fontSize(13).text('Datos de la solicitud', 50, y);
    y += 24;
    for (const [etiqueta, valor] of filas) {
      doc.moveTo(50, y + 22).lineTo(562, y + 22).strokeColor(borde).lineWidth(0.5).stroke();
      doc.fillColor(gris).font('Helvetica').fontSize(10).text(etiqueta, 50, y + 6, { width: 170 });
      doc.fillColor(texto).font('Helvetica-Bold').fontSize(10).text(valor, 225, y + 6, { width: 337 });
      y += 26;
    }
  }

  #pie(doc, s) {
    const { gris } = ComprobantePdfService.COLORES;
    doc.fillColor(gris).font('Helvetica').fontSize(9).text(
      'Presenta este comprobante el día de tu atención. Para modificar tu solicitud ingresa tu CURP y número de turno ' +
        'en la sección "Modificar solicitud" del portal. El código QR identifica la CURP del alumno solicitante.',
      50, 640, { width: 512, align: 'center' }
    );
    doc.fontSize(8).text(`Generado el ${new Date().toLocaleString('es-MX')} · Turno ${s.turno}`, 50, 690, { width: 512, align: 'center' });
  }
}

module.exports = new ComprobantePdfService();
