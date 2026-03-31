import { pool } from '../config/database';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', '001_initial_schema.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Migration successful');
  } catch (e) {
    console.error('Migration failed', e);
  } finally {
    process.exit();
  }
}

run();
