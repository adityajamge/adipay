import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

const migrationPath = path.join(process.cwd(), 'src', 'db', 'migrations', '001_initial_schema.sql');

async function getPublicTables(client: any): Promise<string[]> {
  const result = await client.query(
    `SELECT tablename
     FROM pg_tables
     WHERE schemaname = 'public'
     ORDER BY tablename ASC`
  );

  return result.rows.map((row: { tablename: string }) => row.tablename);
}

async function run() {
  const client = await pool.connect();

  try {
    console.log('db:init -> starting full database reset');
    await client.query('BEGIN');

    const tables = await getPublicTables(client);

    if (tables.length > 0) {
      const tableList = tables.map((table) => `"${table}"`).join(', ');
      await client.query(`DROP TABLE IF EXISTS ${tableList} CASCADE`);
      console.log(`db:init -> dropped tables: ${tables.join(', ')}`);
    } else {
      console.log('db:init -> no existing tables found to drop.');
    }

    // Keep schema recreation deterministic between runs.
    await client.query('DROP FUNCTION IF EXISTS update_updated_at() CASCADE');

    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSql);

    await client.query('COMMIT');
    console.log('db:init -> schema recreated successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('db:init -> failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();