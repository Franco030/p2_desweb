const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

/**
 * Patrón Singleton: una única conexión Sequelize (ORM) para toda la aplicación.
 */
class Database {
  static #instance = null;

  constructor() {
    if (Database.#instance) {
      throw new Error('Usa Database.getInstance() en lugar de new Database()');
    }
    const storage = process.env.DB_STORAGE || path.join(__dirname, '..', '..', 'data', 'ticket_turno.sqlite');
    fs.mkdirSync(path.dirname(storage), { recursive: true });
    this.sequelize = new Sequelize({ dialect: 'sqlite', storage, logging: false });
  }

  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }

  getConnection() {
    return this.sequelize;
  }

  async connect() {
    await this.sequelize.authenticate();
  }

  async sync(options = {}) {
    await this.sequelize.sync(options);
  }
}

module.exports = Database;
