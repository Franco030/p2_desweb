const { Model, DataTypes } = require('sequelize');

class Bitacora extends Model {
  static initModel(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        evento: { type: DataTypes.STRING(50), allowNull: false },
        detalle: { type: DataTypes.TEXT, allowNull: true },
      },
      { sequelize, modelName: 'Bitacora', tableName: 'bitacora', updatedAt: false }
    );
  }
}

module.exports = Bitacora;
