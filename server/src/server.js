require('dotenv').config();
const App = require('./App');

new App().iniciar().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
