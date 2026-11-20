// Manejo centralizado de errores
const HttpError = require('../shared/errors/HttpError');

function notFound(req, res, next) {
  next(new HttpError(404, 'Ruta no encontrada'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error(err.message);
  res.status(500).json({ error: 'Error del servidor' });
}

module.exports = { notFound, errorHandler };
