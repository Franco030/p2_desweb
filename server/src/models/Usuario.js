const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class Usuario extends Model {
  static initModel(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        usuario: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        nombre: { type: DataTypes.STRING(120), allowNull: false },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        rol: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'admin' },
      },
      { sequelize, modelName: 'Usuario', tableName: 'usuarios' }
    );
  }

  async setPassword(plain) {
    this.passwordHash = await bcrypt.hash(plain, 10);
  }

  verificarPassword(plain) {
    return bcrypt.compare(plain, this.passwordHash);
  }

  toJSON() {
    const { passwordHash, ...rest } = this.get();
    return rest;
  }
}

module.exports = Usuario;
