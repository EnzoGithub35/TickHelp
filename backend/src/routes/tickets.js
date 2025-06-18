import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  searchTickets
} from '../controllers/ticketController.js';

const router = express.Router();

router.get('/', authenticateToken, getTickets);
router.get('/search', authenticateToken, searchTickets);
router.get('/:id', authenticateToken, getTicketById);
router.post('/', authenticateToken, createTicket);
router.put('/:id', authenticateToken, updateTicket);
router.delete('/:id', authenticateToken, deleteTicket);

export { router as ticketRoutes };
