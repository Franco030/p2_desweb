const { Municipio, NivelEducativo, Asunto, Usuario } = require('../models');

/** Carga los datos iniciales (catálogos y administrador) solo si las tablas están vacías. */
class Seeder {
  static MUNICIPIOS = [
    'Abasolo', 'Acuña', 'Allende', 'Arteaga', 'Candela', 'Castaños', 'Cuatro Ciénegas', 'Escobedo',
    'Francisco I. Madero', 'Frontera', 'General Cepeda', 'Guerrero', 'Hidalgo', 'Jiménez', 'Juárez',
    'Lamadrid', 'Matamoros', 'Monclova', 'Morelos', 'Múzquiz', 'Nadadores', 'Nava', 'Ocampo',
    'Parras', 'Piedras Negras', 'Progreso', 'Ramos Arizpe', 'Sabinas', 'Sacramento', 'Saltillo',
    'San Buenaventura', 'San Juan de Sabinas', 'San Pedro', 'Sierra Mojada', 'Torreón', 'Viesca',
    'Villa Unión', 'Zaragoza',
  ];

  static NIVELES = ['Preescolar', 'Primaria', 'Secundaria', 'Bachillerato'];

  static ASUNTOS = ['Inscripción', 'Reinscripción', 'Cambio de escuela', 'Baja', 'Constancia de estudios'];

  async ejecutar() {
    await this.#catalogo(Municipio, Seeder.MUNICIPIOS);
    await this.#catalogo(NivelEducativo, Seeder.NIVELES);
    await this.#catalogo(Asunto, Seeder.ASUNTOS);
    await this.#administrador();
  }

  async #catalogo(modelo, nombres) {
    if ((await modelo.count()) === 0) {
      await modelo.bulkCreate(nombres.map((nombre) => ({ nombre })));
    }
  }

  async #administrador() {
    if ((await Usuario.count()) > 0) return;
    const admin = Usuario.build({
      usuario: process.env.ADMIN_USER || 'admin',
      nombre: 'Administrador',
      rol: 'admin',
    });
    await admin.setPassword(process.env.ADMIN_PASSWORD || 'Admin123*');
    await admin.save();
    console.log(`Usuario administrador creado: ${admin.usuario}`);
  }
}

module.exports = Seeder;
