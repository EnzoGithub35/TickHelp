// backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { authRoutes } from './routes/auth.js';
import { ticketRoutes } from './routes/tickets.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware de base
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: config.env, timestamp: new Date() });
});

// Gestionnaire d'erreurs globales
app.use(errorHandler);

// Démarrer le serveur
const PORT = config.port || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.env} mode`);
});

export default app;