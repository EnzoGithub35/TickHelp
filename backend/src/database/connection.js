import pg from 'pg';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Créer un pool de connexions PostgreSQL
export const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.env === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Tester la connexion à la base de données
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    client.release();
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
};

// Écouter les événements de connexion
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Écouter les événements de connexion
pool.on('connect', () => {
  logger.debug('New client connected to the pool');
});