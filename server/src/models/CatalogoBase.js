const { Model, DataTypes } = require('sequelize');

/**
 * Clase base para los catálogos (Municipio, NivelEducativo, Asunto).
 * Las subclases solo declaran su configuración en `catalogo`.
 */
class CatalogoBase extends Model {
  /** Definido por cada subclase: { modelName, tableName, foreignKey } */
  static catalogo = null;

  static initModel(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        nombre: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: { msg: 'Ya existe un registro con ese nombre' },
          validate: { notEmpty: { msg: 'El nombre es obligatorio' } },
        },
        activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      },
      { sequelize, modelName: this.catalogo.modelName, tableName: this.catalogo.tableName }
    );
  }

  static associate(models) {
    this.hasMany(models.Solicitud, { foreignKey: this.catalogo.foreignKey, as: 'solicitudes' });
  }
}

module.exports = CatalogoBase;
