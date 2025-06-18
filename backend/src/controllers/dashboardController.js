import { Ticket } from '../models/Ticket.js';
import { User } from '../models/User.js';

export const getStats = async (req, res) => {
  try {
    const stats = await Ticket.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const activity = await Ticket.getRecentActivity();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

export const getAssignedTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const tickets = await Ticket.findAll({ assigneeId: userId, limit: 5 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assigned tickets' });
  }
};
