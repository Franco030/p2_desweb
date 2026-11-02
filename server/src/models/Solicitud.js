const { Model, DataTypes } = require('sequelize');

const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

class Solicitud extends Model {
  static ESTATUS = Object.freeze({ PENDIENTE: 'Pendiente', RESUELTO: 'Resuelto' });
  static CURP_REGEX = CURP_REGEX;

  static initModel(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        turno: { type: DataTypes.INTEGER, allowNull: false },
        nombreTramitante: {
          type: DataTypes.STRING(150),
          allowNull: false,
          validate: { notEmpty: { msg: 'El nombre de quien realiza el trámite es obligatorio' } },
        },
        curp: {
          type: DataTypes.STRING(18),
          allowNull: false,
          set(value) {
            this.setDataValue('curp', String(value || '').trim().toUpperCase());
          },
          validate: { is: { args: CURP_REGEX, msg: 'La CURP no tiene un formato válido' } },
        },
        nombre: { type: DataTypes.STRING(80), allowNull: false, validate: { notEmpty: { msg: 'El nombre es obligatorio' } } },
        paterno: { type: DataTypes.STRING(80), allowNull: false, validate: { notEmpty: { msg: 'El apellido paterno es obligatorio' } } },
        materno: { type: DataTypes.STRING(80), allowNull: true },
        telefono: { type: DataTypes.STRING(15), allowNull: true },
        celular: {
          type: DataTypes.STRING(15),
          allowNull: false,
          validate: { is: { args: /^\d{10}$/, msg: 'El celular debe tener 10 dígitos' } },
        },
        correo: {
          type: DataTypes.STRING(120),
          allowNull: false,
          validate: { isEmail: { msg: 'Correo electrónico inválido' } },
        },
        estatus: {
          type: DataTypes.ENUM(...Object.values(Solicitud.ESTATUS)),
          allowNull: false,
          defaultValue: Solicitud.ESTATUS.PENDIENTE,
        },
        municipioId: { type: DataTypes.INTEGER, allowNull: false },
        nivelId: { type: DataTypes.INTEGER, allowNull: false },
        asuntoId: { type: DataTypes.INTEGER, allowNull: false },
      },
      {
        sequelize,
        modelName: 'Solicitud',
        tableName: 'solicitudes',
        indexes: [{ unique: true, fields: ['municipioId', 'turno'] }],
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Municipio, { foreignKey: 'municipioId', as: 'municipio' });
    this.belongsTo(models.NivelEducativo, { foreignKey: 'nivelId', as: 'nivel' });
    this.belongsTo(models.Asunto, { foreignKey: 'asuntoId', as: 'asunto' });
  }

  get nombreCompleto() {
    return [this.nombre, this.paterno, this.materno].filter(Boolean).join(' ');
  }
}

module.exports = Solicitud;
