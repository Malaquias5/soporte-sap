// Reglas de negocio de tickets
const repo = require('./ticket.repository');
const HttpError = require('../../shared/errors/HttpError');

const ESTADOS = ['Abierto', 'En proceso', 'Cerrado'];

async function listar({ page, limit, estado }) {
  page = Math.max(Number.parseInt(page) || 1, 1);
  limit = Math.min(Math.max(Number.parseInt(limit) || 5, 1), 100);
  estado = estado || null;
  const [total, tickets] = await Promise.all([
    repo.count(estado),
    repo.findAll({ estado, limit, offset: (page - 1) * limit }),
  ]);
  return { tickets, total };
}

// Totales por estado para los indicadores del panel
async function resumen() {
  const filas = await repo.countByEstado();
  const porEstado = Object.fromEntries(ESTADOS.map((e) => [e, 0]));
  let total = 0;
  for (const { estado, n } of filas) {
    porEstado[estado] = (porEstado[estado] || 0) + n;
    total += n;
  }
  return { total, porEstado };
}

async function crear(datos) {
  const { cliente, modulo_sap, descripcion, prioridad, estado } = datos;
  if (!cliente || !modulo_sap || !descripcion) throw new HttpError(400, 'Faltan campos obligatorios');
  return repo.create({
    cliente, modulo_sap, descripcion,
    prioridad: prioridad || 'Media',
    estado: estado || 'Abierto',
  });
}

async function actualizar(id, datos) {
  const ticket = await repo.update(id, datos);
  if (!ticket) throw new HttpError(404, 'No encontrado');
  return ticket;
}

async function eliminar(id) {
  await repo.remove(id);
}

module.exports = { listar, resumen, crear, actualizar, eliminar };
