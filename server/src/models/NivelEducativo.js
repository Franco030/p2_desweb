const CatalogoBase = require('./CatalogoBase');

class NivelEducativo extends CatalogoBase {
  static catalogo = { modelName: 'NivelEducativo', tableName: 'niveles_educativos', foreignKey: 'nivelId' };
}

module.exports = NivelEducativo;
