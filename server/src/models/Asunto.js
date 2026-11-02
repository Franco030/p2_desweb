const CatalogoBase = require('./CatalogoBase');

class Asunto extends CatalogoBase {
  static catalogo = { modelName: 'Asunto', tableName: 'asuntos', foreignKey: 'asuntoId' };
}

module.exports = Asunto;
