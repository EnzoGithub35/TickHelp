import { pool } from '../database/connection.js';

export class Ticket {
  static async create(ticketData, reporterId) {
    const {
      title,
      description,
      priority = 'medium',
      type = 'task',
      assigneeId,
      dueDate,
      estimatedHours,
      tags = []
    } = ticketData;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Créer le ticket
      const ticketResult = await client.query(
        `INSERT INTO tickets (title, description, priority, type, reporter_id, assignee_id, due_date, estimated_hours, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [title, description, priority, type, reporterId, assigneeId, dueDate, estimatedHours, tags]
      );

      const ticket = ticketResult.rows[0];

      // Ajouter l'entrée dans l'historique
      await client.query(
        `INSERT INTO ticket_history (ticket_id, user_id, action, comment)
         VALUES ($1, $2, 'created', 'Ticket created')`,
        [ticket.id, reporterId]
      );

      await client.query('COMMIT');
      
      return await this.findById(ticket.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const result = await pool.query(`
      SELECT 
        t.*,
        reporter.first_name as reporter_first_name,
        reporter.last_name as reporter_last_name,
        reporter.email as reporter_email,
        assignee.first_name as assignee_first_name,
        assignee.last_name as assignee_last_name,
        assignee.email as assignee_email
      FROM tickets t
      LEFT JOIN users reporter ON t.reporter_id = reporter.id
      LEFT JOIN users assignee ON t.assignee_id = assignee.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) return null;

    const ticket = result.rows[0];
    return this.formatTicket(ticket);
  }

  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      type,
      assigneeId,
      reporterId,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = options;
    const offset = (page - 1) * limit;
    let where = [];
    let values = [];
    let idx = 1;
    if (status) { where.push(`status = $${idx++}`); values.push(status); }
    if (priority) { where.push(`priority = $${idx++}`); values.push(priority); }
    if (type) { where.push(`type = $${idx++}`); values.push(type); }
    if (assigneeId) { where.push(`assignee_id = $${idx++}`); values.push(assigneeId); }
    if (reporterId) { where.push(`reporter_id = $${idx++}`); values.push(reporterId); }
    if (search) {
      where.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const query = `SELECT * FROM tickets ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT $${idx} OFFSET $${idx+1}`;
    values.push(limit, offset);
    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      const countRes = await client.query(`SELECT COUNT(*) FROM tickets ${whereClause}`, values.slice(0, idx-1));
      return {
        tickets: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(countRes.rows[0].count),
          totalPages: Math.ceil(Number(countRes.rows[0].count) / limit),
        },
      };
    } finally {
      client.release();
    }
  }

  static async search(q) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM tickets WHERE title ILIKE $1 OR description ILIKE $1 ORDER BY created_at DESC LIMIT 50`,
        [`%${q}%`]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async update(id, updateData, userId) {
    const {
      title,
      description,
      status,
      priority,
      type,
      assigneeId,
      dueDate,
      estimatedHours,
      actualHours,
      tags
    } = updateData;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Récupérer l'état actuel pour l'historique
      const currentTicket = await client.query('SELECT * FROM tickets WHERE id = $1', [id]);
      if (currentTicket.rows.length === 0) {
        throw new Error('Ticket not found');
      }

      const current = currentTicket.rows[0];

      // Mettre à jour le ticket
      const result = await client.query(
        `UPDATE tickets 
         SET title = COALESCE($2, title),
             description = COALESCE($3, description),
             status = COALESCE($4, status),
             priority = COALESCE($5, priority),
             type = COALESCE($6, type),
             assignee_id = COALESCE($7, assignee_id),
             due_date = COALESCE($8, due_date),
             estimated_hours = COALESCE($9, estimated_hours),
             actual_hours = COALESCE($10, actual_hours),
             tags = COALESCE($11, tags),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [id, title, description, status, priority, type, assigneeId, dueDate, estimatedHours, actualHours, tags]
      );

      const updated = result.rows[0];

      // Enregistrer les changements dans l'historique
      const changes = [];
      if (title && title !== current.title) changes.push({ field: 'title', old: current.title, new: title });
      if (description && description !== current.description) changes.push({ field: 'description', old: current.description, new: description });
      if (status && status !== current.status) changes.push({ field: 'status', old: current.status, new: status });
      if (priority && priority !== current.priority) changes.push({ field: 'priority', old: current.priority, new: priority });
      if (type && type !== current.type) changes.push({ field: 'type', old: current.type, new: type });
      if (assigneeId !== undefined && assigneeId !== current.assignee_id) changes.push({ field: 'assignee_id', old: current.assignee_id, new: assigneeId });

      for (const change of changes) {
        await client.query(
          `INSERT INTO ticket_history (ticket_id, user_id, action, field_name, old_value, new_value)
           VALUES ($1, $2, 'updated', $3, $4, $5)`,
          [id, userId, change.field, change.old, change.new]
        );
      }

      await client.query('COMMIT');
      
      return await this.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Vérifier que le ticket existe
      const ticket = await client.query('SELECT * FROM tickets WHERE id = $1', [id]);
      if (ticket.rows.length === 0) {
        throw new Error('Ticket not found');
      }

      // Enregistrer la suppression dans l'historique
      await client.query(
        `INSERT INTO ticket_history (ticket_id, user_id, action, comment)
         VALUES ($1, $2, 'deleted', 'Ticket deleted')`,
        [id, userId]
      );

      // Supprimer le ticket (les commentaires et historique seront supprimés en cascade)
      await client.query('DELETE FROM tickets WHERE id = $1', [id]);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getStats() {
    const client = await pool.connect();
    try {
      const total = await client.query('SELECT COUNT(*) FROM tickets');
      const byStatus = await client.query(
        "SELECT status, COUNT(*) FROM tickets GROUP BY status"
      );
      const byPriority = await client.query(
        "SELECT priority, COUNT(*) FROM tickets GROUP BY priority"
      );
      return {
        total: Number(total.rows[0].count),
        byStatus: byStatus.rows,
        byPriority: byPriority.rows,
      };
    } finally {
      client.release();
    }
  }

  static async getRecentActivity() {
    const client = await pool.connect();
    try {
      const res = await client.query(
        `SELECT t.id, t.title, t.status, t.updated_at, u.first_name, u.last_name
         FROM tickets t
         LEFT JOIN users u ON t.reporter_id = u.id
         ORDER BY t.updated_at DESC
         LIMIT 10`
      );
      return res.rows;
    } finally {
      client.release();
    }
  }

  static formatTicket(ticket) {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      type: ticket.type,
      dueDate: ticket.due_date,
      estimatedHours: ticket.estimated_hours,
      actualHours: ticket.actual_hours,
      tags: ticket.tags || [],
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      reporter: ticket.reporter_id ? {
        id: ticket.reporter_id,
        firstName: ticket.reporter_first_name,
        lastName: ticket.reporter_last_name,
        email: ticket.reporter_email
      } : null,
      assignee: ticket.assignee_id ? {
        id: ticket.assignee_id,
        firstName: ticket.assignee_first_name,
        lastName: ticket.assignee_last_name,
        email: ticket.assignee_email
      } : null
    };
  }
}