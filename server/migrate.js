require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Neon
  });

  try {
    console.log('Connecting to Neon.tech Database...');
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not found in .env files");
    }
    
    await client.connect();
    
    // Target the SQL file we generated previously
    const schemaPath = path.join(__dirname, 'src', 'db', 'migrations', '001_initial_schema.sql');
    const sql = fs.readFileSync(schemaPath).toString();
    
    console.log('Pushing SQL Schema Architecture...');
    await client.query(sql);
    console.log('✅ Schema successfully pushed to PostgreSQL database!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    // Release active pool client securely
    await client.end();
  }
}

runMigration();
