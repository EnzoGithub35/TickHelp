import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connexion à PostgreSQL sans spécifier de base de données
const adminClient = new Client({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: 'postgres', // Base par défaut
});

async function setupDatabase() {
  try {
    await adminClient.connect();
    logger.info('Connected to PostgreSQL server');

    // 1. Créer la base de données si elle n'existe pas
    try {
      await adminClient.query(`CREATE DATABASE ${config.database.name}`);
      logger.info(`Database ${config.database.name} created successfully`);
    } catch (error) {
      if (error.code === '42P04') {
        logger.info(`Database ${config.database.name} already exists`);
      } else {
        throw error;
      }
    }

    await adminClient.end();

    // 2. Se connecter à la nouvelle base de données et créer les tables
    const dbClient = new Client({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
    });

    await dbClient.connect();
    logger.info(`Connected to database ${config.database.name}`);

    // 3. Lire et exécuter le schéma
    const schemaPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await dbClient.query(schema);
    logger.info('Database schema created successfully');

    await dbClient.end();
    logger.info('Database setup completed successfully');

  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  }
}

// Exécuter si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };