const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query('SELECT current_database(), current_user, version()');
    console.log('Successfully connected to Postgres:', res.rows[0]);
    const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
    console.log('Tables in database:', tables.rows);
  } catch (err) {
    console.error('Error connecting to Neon database:', err.message);
  } finally {
    pool.end();
  }
}
run();
