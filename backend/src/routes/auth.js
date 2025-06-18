// backend/src/routes/auth.js
import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

// Routes d'authentification sans validation pour le développement
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authController.getProfile); // Plus besoin d'authenticateToken
router.put('/profile', authController.updateProfile); // Plus besoin d'authenticateToken
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

export { router as authRoutes };
