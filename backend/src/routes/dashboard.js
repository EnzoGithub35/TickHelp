import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getStats, getRecentActivity, getAssignedTickets } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', authenticateToken, getStats);
router.get('/activity', authenticateToken, getRecentActivity);
router.get('/assigned', authenticateToken, getAssignedTickets);

export { router as dashboardRoutes };
