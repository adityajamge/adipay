import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Secure Neon.tech PostgreSQL connection pool mapping 
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Listener mapping unexpected connection dropping dynamically 
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Primary native query utility dynamically injected globally
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
