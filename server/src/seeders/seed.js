/**
 * Script de demostración: carga catálogos, el administrador y solicitudes de ejemplo
 * para ver el tablero con datos. Uso: npm run seed
 */
require('dotenv').config();
const Database = require('../config/Database');
const { Municipio, NivelEducativo, Asunto } = require('../models');
const Seeder = require('./Seeder');
const solicitudService = require('../services/SolicitudService');

const NOMBRES = ['MARIA', 'JOSE', 'ANA', 'LUIS', 'SOFIA', 'DIEGO', 'VALERIA', 'CARLOS', 'XIMENA', 'JORGE'];
const APELLIDOS = ['GARCIA', 'HERNANDEZ', 'LOPEZ', 'MARTINEZ', 'RODRIGUEZ', 'PEREZ', 'SANCHEZ', 'RAMIREZ'];

class DemoSeeder {
  #aleatorio(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  #curp(nombre, paterno, materno, i) {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const anio = String(10 + (i % 10)).padStart(2, '0');
    const mes = String(1 + (i % 12)).padStart(2, '0');
    const dia = String(1 + (i % 28)).padStart(2, '0');
    const sexo = i % 2 ? 'H' : 'M';
    return `${paterno[0]}${paterno[1]}${materno[0]}${nombre[0]}${anio}${mes}${dia}${sexo}CL${paterno[2]}${materno[2]}${nombre[2]}${letras[i % 26]}${i % 10}`;
  }

  async ejecutar(cantidad = 60) {
    const db = Database.getInstance();
    await db.connect();
    await db.sync();
    await new Seeder().ejecutar();

    const municipios = await Municipio.findAll({ where: { nombre: ['Saltillo', 'Torreón', 'Monclova', 'Piedras Negras', 'Acuña', 'Ramos Arizpe'] } });
    const niveles = await NivelEducativo.findAll();
    const asuntos = await Asunto.findAll();

    for (let i = 0; i < cantidad; i++) {
      const nombre = this.#aleatorio(NOMBRES);
      const paterno = this.#aleatorio(APELLIDOS);
      const materno = this.#aleatorio(APELLIDOS);
      await solicitudService.crear(
        {
          nombreTramitante: `${this.#aleatorio(NOMBRES)} ${this.#aleatorio(APELLIDOS)}`,
          curp: this.#curp(nombre, paterno, materno, i),
          nombre, paterno, materno,
          celular: `844${String(1000000 + i).slice(-7)}`,
          correo: `${nombre.toLowerCase()}.${paterno.toLowerCase()}${i}@correo.com`,
          municipioId: this.#aleatorio(municipios).id,
          nivelId: this.#aleatorio(niveles).id,
          asuntoId: this.#aleatorio(asuntos).id,
          estatus: Math.random() < 0.45 ? 'Resuelto' : 'Pendiente',
        },
        { permitirEstatus: true }
      );
    }
    console.log(`${cantidad} solicitudes de ejemplo creadas.`);
  }
}

new DemoSeeder().ejecutar().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
