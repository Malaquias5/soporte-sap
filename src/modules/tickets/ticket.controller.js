// Traduce HTTP <-> servicio (Express 5 propaga errores async solo)
const service = require('./ticket.service');

const listar = async (req, res) => res.json(await service.listar(req.query));
const resumen = async (req, res) => res.json(await service.resumen());
const crear = async (req, res) => res.status(201).json(await service.crear(req.body));
const actualizar = async (req, res) => res.json(await service.actualizar(req.params.id, req.body));
const eliminar = async (req, res) => {
  await service.eliminar(req.params.id);
  res.status(204).end();
};

module.exports = { listar, resumen, crear, actualizar, eliminar };
