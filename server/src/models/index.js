const Database = require('../config/Database');
const Municipio = require('./Municipio');
const NivelEducativo = require('./NivelEducativo');
const Asunto = require('./Asunto');
const Usuario = require('./Usuario');
const Solicitud = require('./Solicitud');
const Bitacora = require('./Bitacora');

const sequelize = Database.getInstance().getConnection();
const models = { Municipio, NivelEducativo, Asunto, Usuario, Solicitud, Bitacora };

Object.values(models).forEach((model) => model.initModel(sequelize));
Object.values(models).forEach((model) => model.associate && model.associate(models));

module.exports = { ...models, sequelize };
