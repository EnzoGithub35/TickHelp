// backend/src/routes/index.js
import { authRoutes } from './auth.js';
import { userRoutes } from './users.js';
import { ticketRoutes } from './tickets.js';
import { commentRoutes } from './comments.js';
import { attachmentRoutes } from './attachments.js';

export const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/attachments', attachmentRoutes);
  
  // Return the app instance
  return app;
};
