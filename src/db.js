const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });

pool.on('error', (err) => {
  // Evita que erros em conexões ociosas passem "silenciosos" e só apareçam depois.
  console.error('Unexpected PostgreSQL client error', err);
});

module.exports = { pool };
