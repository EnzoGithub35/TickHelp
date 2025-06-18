import { pool } from './connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    logger.info('Starting database setup...');
    await client.query('BEGIN');

    // Lire et exécuter le script SQL
    const schemaPath = path.join(__dirname, 'migrations', 'initial_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    logger.info('Creating database schema...');
    await client.query(schema);
    
    logger.info('Database schema created successfully');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error setting up database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exécuter si appelé directement
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupDatabase()
    .then(() => {
      logger.info('Database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database setup failed:', error);
      process.exit(1);
    });
}

export { setupDatabase };