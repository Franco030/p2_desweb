const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const Database = require('./config/Database');
require('./models');
const ApiRouter = require('./routes/ApiRouter');
const ErrorHandler = require('./middleware/ErrorHandler');
const solicitudSubject = require('./patterns/SolicitudSubject');
const BitacoraObserver = require('./patterns/observers/BitacoraObserver');
const ConsoleObserver = require('./patterns/observers/ConsoleObserver');
const Seeder = require('./seeders/Seeder');

class App {
  constructor(port = process.env.PORT || 4000) {
    this.port = port;
    this.express = express();
    this.#middlewares();
    this.#rutas();
    this.#observadores();
  }

  #middlewares() {
    this.express.use(cors());
    this.express.use(express.json({ limit: '1mb' }));
  }

  #rutas() {
    this.express.get('/api/salud', (req, res) => res.json({ ok: true }));
    this.express.use('/api', new ApiRouter().router);
    this.express.use('/api', ErrorHandler.noEncontrado);

    // En producción se sirve el build de React desde el mismo servidor.
    const dist = path.join(__dirname, '..', '..', 'client', 'dist');
    if (fs.existsSync(dist)) {
      this.express.use(express.static(dist));
      this.express.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
    }
    this.express.use(ErrorHandler.manejar);
  }

  #observadores() {
    solicitudSubject.subscribe(new BitacoraObserver());
    solicitudSubject.subscribe(new ConsoleObserver());
  }

  async iniciar() {
    const db = Database.getInstance();
    await db.connect();
    await db.sync();
    await new Seeder().ejecutar();
    return new Promise((resolve) => {
      this.servidor = this.express.listen(this.port, () => {
        console.log(`API Ticket de Turno escuchando en http://localhost:${this.port}`);
        resolve(this.servidor);
      });
    });
  }
}

module.exports = App;
