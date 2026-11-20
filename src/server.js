// Punto de entrada: prepara la BD y arranca el servidor
const app = require('./app');
const { port } = require('./config/env');
const { initSchema } = require('./database/schema');

initSchema()
  .then(() => app.listen(port, () => console.log(`Servidor en http://localhost:${port}`)))
  .catch((err) => {
    console.error('Error con la BD:', err.message);
    process.exit(1);
  });
