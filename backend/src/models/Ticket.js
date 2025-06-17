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
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;
    
    let query = `
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
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    // Filtres
    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    if (priority) {
      paramCount++;
      query += ` AND t.priority = $${paramCount}`;
      params.push(priority);
    }

    if (type) {
      paramCount++;
      query += ` AND t.type = $${paramCount}`;
      params.push(type);
    }

    if (assigneeId) {
      paramCount++;
      query += ` AND t.assignee_id = $${paramCount}`;
      params.push(assigneeId);
    }

    if (reporterId) {
      paramCount++;
      query += ` AND t.reporter_id = $${paramCount}`;
      params.push(reporterId);
    }

    if (search) {
      paramCount++;
      query += ` AND (t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Tri
    const allowedSortFields = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY t.${sortField} ${order}`;

    // Pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Count total
    let countQuery = 'SELECT COUNT(*) FROM tickets t WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    // Répéter les mêmes filtres pour le count
    if (status) {
      countParamCount++;
      countQuery += ` AND t.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (priority) {
      countParamCount++;
      countQuery += ` AND t.priority = $${countParamCount}`;
      countParams.push(priority);
    }

    if (type) {
      countParamCount++;
      countQuery += ` AND t.type = $${countParamCount}`;
      countParams.push(type);
    }

    if (assigneeId) {
      countParamCount++;
      countQuery += ` AND t.assignee_id = $${countParamCount}`;
      countParams.push(assigneeId);
    }

    if (reporterId) {
      countParamCount++;
      countQuery += ` AND t.reporter_id = $${countParamCount}`;
      countParams.push(reporterId);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (t.title ILIKE $${countParamCount} OR t.description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return {
      tickets: result.rows.map(ticket => this.formatTicket(ticket)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
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
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(*) FILTER (WHERE status = 'todo') as todo_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
        COUNT(*) FILTER (WHERE priority = 'high') as high_count,
        COUNT(*) FILTER (WHERE priority = 'medium') as medium_count,
        COUNT(*) FILTER (WHERE priority = 'low') as low_count,
        COUNT(*) FILTER (WHERE type = 'bug') as bug_count,
        COUNT(*) FILTER (WHERE type = 'feature') as feature_count,
        COUNT(*) FILTER (WHERE type = 'task') as task_count,
        COUNT(*) FILTER (WHERE type = 'improvement') as improvement_count
      FROM tickets
    `);
    
    return result.rows[0];
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