const CatalogoBase = require('./CatalogoBase');

class Municipio extends CatalogoBase {
  static catalogo = { modelName: 'Municipio', tableName: 'municipios', foreignKey: 'municipioId' };
}

module.exports = Municipio;
