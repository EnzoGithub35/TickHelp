import { Ticket } from '../models/Ticket.js';
import { User } from '../models/User.js';

export const getTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, type, assigneeId, reporterId, search, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const options = {
      page: Number(page),
      limit: Number(limit),
      status,
      priority,
      type,
      assigneeId,
      reporterId,
      search,
      sortBy,
      sortOrder,
    };
    const result = await Ticket.findAll(options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

export const createTicket = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const ticket = await Ticket.create(req.body, reporterId);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const updated = await Ticket.update(req.params.id, req.body, req.user.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    await Ticket.delete(req.params.id, req.user.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
};

// Recherche avancée (full-text)
export const searchTickets = async (req, res) => {
  try {
    const { q } = req.query;
    const result = await Ticket.search(q);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search tickets' });
  }
};
