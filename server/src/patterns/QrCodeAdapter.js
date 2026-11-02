const QRCode = require('qrcode');

/**
 * Patrón Adapter: expone una interfaz simple (generarPng) sobre la librería
 * `qrcode`, para que el generador de PDF no dependa de su API concreta.
 */
class QrCodeAdapter {
  constructor(opciones = {}) {
    this.opciones = { errorCorrectionLevel: 'M', margin: 1, width: 220, ...opciones };
  }

  /** @returns {Promise<Buffer>} imagen PNG del código QR */
  generarPng(texto) {
    return QRCode.toBuffer(texto, { ...this.opciones, type: 'png' });
  }
}

module.exports = QrCodeAdapter;
