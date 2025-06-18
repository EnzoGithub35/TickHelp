// backend/src/controllers/ticketController.js
import { ticketService } from '../services/ticketService.js';
import { commentService } from '../services/commentService.js';
import { attachmentService } from '../services/attachmentService.js';
import { logger } from '../utils/logger.js';

export const ticketController = {
  /**
   * Get tickets with filtering, pagination and sorting
   */
  async getTickets(req, res, next) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status,
        priority: req.query.priority,
        type: req.query.type,
        reporterId: req.query.reporterId,
        assigneeId: req.query.assigneeId,
        search: req.query.search,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'desc'
      };
      
      // For regular users, only show their tickets or assigned to them
      if (req.user.role === 'user') {
        options.userId = req.user.id;
      }
      
      const tickets = await ticketService.findAll(options);
      
      res.json({
        success: true,
        data: tickets.data,
        pagination: tickets.pagination
      });
    } catch (error) {
      logger.error('Get tickets error:', error);
      next(error);
    }
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(req, res, next) {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await ticketService.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check permissions for normal users
      if (req.user.role === 'user' && 
          ticket.reporterId !== req.user.id && 
          ticket.assigneeId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this ticket',
          code: 'FORBIDDEN'
        });
      }
      
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      logger.error('Get ticket by ID error:', error);
      next(error);
    }
  },

  /**
   * Create a new ticket
   */
  async createTicket(req, res, next) {
    try {
      const ticketData = req.body;
      const reporterId = req.user.id;
      
      const ticket = await ticketService.create(ticketData, reporterId);
      
      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket
      });
    } catch (error) {
      logger.error('Create ticket error:', error);
      next(error);
    }
  },

  /**
   * Update ticket
   */
  async updateTicket(req, res, next) {
    try {
      const ticketId = parseInt(req.params.id);
      const ticketData = req.body;
      const userId = req.user.id;
      
      // Retrieve current ticket
      const currentTicket = await ticketService.findById(ticketId);
      
      if (!currentTicket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check permissions
      const canEdit = req.user.role === 'admin' || 
                      req.user.role === 'manager' || 
                      currentTicket.reporterId === userId ||
                      currentTicket.assigneeId === userId;
                      
      if (!canEdit) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this ticket',
          code: 'FORBIDDEN'
        });
      }
      
      // Regular users can't reassign tickets
      if (req.user.role === 'user' && 
          ticketData.assigneeId && 
          ticketData.assigneeId !== currentTicket.assigneeId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to reassign this ticket',
          code: 'FORBIDDEN'
        });
      }
      
      const updatedTicket = await ticketService.update(ticketId, ticketData, userId);
      
      res.json({
        success: true,
        message: 'Ticket updated successfully',
        data: updatedTicket
      });
    } catch (error) {
      logger.error('Update ticket error:', error);
      next(error);
    }
  },

  /**
   * Delete ticket
   */
  async deleteTicket(req, res, next) {
    try {
      const ticketId = parseInt(req.params.id);
      
      // Only admin and managers can delete tickets
      if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete tickets',
          code: 'FORBIDDEN'
        });
      }
      
      await ticketService.delete(ticketId, req.user.id);
      
      res.json({
        success: true,
        message: 'Ticket deleted successfully'
      });
    } catch (error) {
      logger.error('Delete ticket error:', error);
      next(error);
    }
  },

  /**
   * Get ticket statistics
   */
  async getTicketStats(req, res, next) {
    try {
      const stats = await ticketService.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get ticket stats error:', error);
      next(error);
    }
  },

  /**
   * Get ticket comments
   */
  async getTicketComments(req, res, next) {
    try {
      const ticketId = parseInt(req.params.id);
      
      // Check if ticket exists and user has access
      const ticket = await ticketService.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check permissions for normal users
      if (req.user.role === 'user' && 
          ticket.reporterId !== req.user.id && 
          ticket.assigneeId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this ticket\'s comments',
          code: 'FORBIDDEN'
        });
      }
      
      const comments = await commentService.getTicketComments(ticketId);
      
      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      logger.error('Get ticket comments error:', error);
      next(error);
    }
  },

  /**
   * Add comment to ticket
   */
  async addComment(req, res, next) {
    try {
      const ticketId = parseInt(req.params.id);
      const { content, isInternal = false } = req.body;
      const userId = req.user.id;
      
      // Check if ticket exists and user has access
      const ticket = await ticketService.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check permissions for normal users
      if (req.user.role === 'user' && 
          ticket.reporterId !== req.user.id && 
          ticket.assigneeId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to comment on this ticket',
          code: 'FORBIDDEN'
        });
      }
      
      // Only admins and managers can add internal comments
      if (isInternal && !['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to add internal comments',
          code: 'FORBIDDEN'
        });
      }
      
      const comment = await commentService.addComment(ticketId, userId, content, isInternal);
      
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment
      });
    } catch (error) {
      logger.error('Add comment error:', error);
      next(error);
    }
  },

  /**
   * Upload file attachment to ticket
   */
  async uploadAttachment(req, res, next) {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if ticket exists and user has access
      const ticket = await ticketService.findById(ticketId);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check permissions for normal users
      if (req.user.role === 'user' && 
          ticket.reporterId !== req.user.id && 
          ticket.assigneeId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to add attachments to this ticket',
          code: 'FORBIDDEN'
        });
      }
      
      // The file will be available in req.file thanks to multer middleware
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          code: 'INVALID_REQUEST'
        });
      }
      
      const attachment = await attachmentService.createAttachment(
        ticketId,
        userId,
        req.file
      );
      
      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: attachment
      });
    } catch (error) {
      logger.error('Upload attachment error:', error);
      next(error);
    }
  },

  /**
   * Get all tickets (for development purposes)
   */
  async getAll(req, res) {
    try {
      // Renvoyer des tickets fictifs pour le développement
      const mockTickets = [
        {
          id: 1,
          title: "Ticket de test #1",
          description: "Description du ticket de test",
          status: "todo",
          priority: "medium",
          type: "bug",
          reporter_id: 1,
          assignee_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reporter: {
            first_name: "Dev",
            last_name: "User"
          }
        },
        {
          id: 2,
          title: "Ticket de test #2",
          description: "Autre description de ticket",
          status: "in_progress",
          priority: "high",
          type: "feature",
          reporter_id: 1,
          assignee_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reporter: {
            first_name: "Dev",
            last_name: "User"
          },
          assignee: {
            first_name: "Dev",
            last_name: "User"
          }
        }
      ];
      
      // Renvoyer des données fictives pour le développement
      return res.json({
        success: true,
        data: mockTickets,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      });
    } catch (error) {
      logger.error('Get tickets error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'TICKETS_ERROR'
      });
    }
  }
};
