// SoporteSAP Desk - servidor mínimo
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Conexión a PostgreSQL con SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Crea la tabla si no existe
async function crearTabla() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY, cliente TEXT NOT NULL, modulo_sap TEXT NOT NULL, descripcion TEXT NOT NULL,
      prioridad TEXT NOT NULL DEFAULT 'Media', estado TEXT NOT NULL DEFAULT 'Abierto',
      creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
}

// Listar tickets paginados (?page=1&limit=5&estado=Abierto)
app.get('/api/tickets', async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit) || 5, 1), 100);
  const estado = req.query.estado || null;
  const filtro = 'WHERE $1::text IS NULL OR estado = $1';
  const total = (await pool.query(`SELECT COUNT(*)::int AS n FROM tickets ${filtro}`, [estado])).rows[0].n;
  const { rows } = await pool.query(`SELECT * FROM tickets ${filtro} ORDER BY id DESC LIMIT $2 OFFSET $3`,
    [estado, limit, (page - 1) * limit]);
  res.json({ tickets: rows, total });
});

// Crear ticket
app.post('/api/tickets', async (req, res) => {
  const { cliente, modulo_sap, descripcion, prioridad, estado } = req.body;
  if (!cliente || !modulo_sap || !descripcion) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const { rows } = await pool.query(
    'INSERT INTO tickets (cliente, modulo_sap, descripcion, prioridad, estado) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [cliente, modulo_sap, descripcion, prioridad || 'Media', estado || 'Abierto']
  );
  res.status(201).json(rows[0]);
});

// Editar ticket (solo actualiza los campos enviados)
app.put('/api/tickets/:id', async (req, res) => {
  const { cliente, modulo_sap, descripcion, prioridad, estado } = req.body;
  const { rows } = await pool.query(
    `UPDATE tickets SET cliente = COALESCE($1, cliente), modulo_sap = COALESCE($2, modulo_sap),
       descripcion = COALESCE($3, descripcion), prioridad = COALESCE($4, prioridad),
       estado = COALESCE($5, estado) WHERE id = $6 RETURNING *`,
    [cliente, modulo_sap, descripcion, prioridad, estado, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(rows[0]);
});

// Eliminar ticket
app.delete('/api/tickets/:id', async (req, res) => {
  await pool.query('DELETE FROM tickets WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

// Errores de base de datos
app.use((err, req, res, next) => { console.error(err.message); res.status(500).json({ error: 'Error del servidor' }); });

// Arranque
const PORT = process.env.PORT || 3000;
crearTabla()
  .then(() => app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`)))
  .catch((err) => { console.error('Error con la BD:', err.message); process.exit(1); });
