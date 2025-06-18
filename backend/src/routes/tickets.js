// backend/src/routes/tickets.js
import express from 'express';
import { ticketController } from '../controllers/ticketController.js';

const router = express.Router();

// Routes sans middleware d'authentification
router.get('/', ticketController.getAll);
router.get('/stats', ticketController.getStats);
router.get('/:id', ticketController.getById);
router.post('/', ticketController.create);

export { router as ticketRoutes };
