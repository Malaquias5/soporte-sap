// Acceso a datos de tickets (solo SQL)
const db = require('../../config/database');

const FILTRO = 'WHERE $1::text IS NULL OR estado = $1';

async function count(estado) {
  const { rows } = await db.query(`SELECT COUNT(*)::int AS n FROM tickets ${FILTRO}`, [estado]);
  return rows[0].n;
}

async function findAll({ estado, limit, offset }) {
  const { rows } = await db.query(
    `SELECT * FROM tickets ${FILTRO} ORDER BY id ASC LIMIT $2 OFFSET $3`,
    [estado, limit, offset]
  );
  return rows;
}

async function countByEstado() {
  const { rows } = await db.query('SELECT estado, COUNT(*)::int AS n FROM tickets GROUP BY estado');
  return rows;
}

async function create({ cliente, modulo_sap, descripcion, prioridad, estado }) {
  const { rows } = await db.query(
    `INSERT INTO tickets (cliente, modulo_sap, descripcion, prioridad, estado)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [cliente, modulo_sap, descripcion, prioridad, estado]
  );
  return rows[0];
}

// Solo actualiza los campos enviados
async function update(id, { cliente, modulo_sap, descripcion, prioridad, estado }) {
  const { rows } = await db.query(
    `UPDATE tickets SET cliente = COALESCE($1, cliente), modulo_sap = COALESCE($2, modulo_sap),
       descripcion = COALESCE($3, descripcion), prioridad = COALESCE($4, prioridad),
       estado = COALESCE($5, estado) WHERE id = $6 RETURNING *`,
    [cliente, modulo_sap, descripcion, prioridad, estado, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  await db.query('DELETE FROM tickets WHERE id = $1', [id]);
}

module.exports = { count, findAll, countByEstado, create, update, remove };
