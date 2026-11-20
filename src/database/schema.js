// Crea las tablas si no existen
const db = require('../config/database');

async function initSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      cliente TEXT NOT NULL,
      modulo_sap TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      prioridad TEXT NOT NULL DEFAULT 'Media',
      estado TEXT NOT NULL DEFAULT 'Abierto',
      creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
}

module.exports = { initSchema };
