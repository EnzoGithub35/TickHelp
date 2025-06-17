import { pool } from './connection.js';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Créer des utilisateurs de test
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      {
        email: 'admin@tickhelp.com',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      },
      {
        email: 'manager@tickhelp.com',
        password_hash: hashedPassword,
        first_name: 'Manager',
        last_name: 'User',
        role: 'manager'
      },
      {
        email: 'user@tickhelp.com',
        password_hash: hashedPassword,
        first_name: 'Regular',
        last_name: 'User',
        role: 'user'
      },
      {
        email: 'john.doe@tickhelp.com',
        password_hash: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        role: 'user'
      }
    ];

    const userIds = [];
    for (const user of users) {
      const result = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (email) DO NOTHING 
         RETURNING id`,
        [user.email, user.password_hash, user.first_name, user.last_name, user.role]
      );
      
      if (result.rows.length > 0) {
        userIds.push(result.rows[0].id);
      } else {
        // Récupérer l'ID existant
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
        userIds.push(existingUser.rows[0].id);
      }
    }

    logger.info(`Created/found ${userIds.length} users`);

    // 2. Créer des tickets de test
    const tickets = [
      {
        title: 'Fix login bug',
        description: 'Users cannot login with valid credentials',
        status: 'todo',
        priority: 'high',
        type: 'bug',
        reporter_id: userIds[0],
        assignee_id: userIds[1],
        tags: ['login', 'authentication', 'urgent']
      },
      {
        title: 'Add user profile page',
        description: 'Create a page where users can edit their profile information',
        status: 'in_progress',
        priority: 'medium',
        type: 'feature',
        reporter_id: userIds[1],
        assignee_id: userIds[2],
        tags: ['profile', 'ui', 'user-management']
      },
      {
        title: 'Improve dashboard performance',
        description: 'Dashboard takes too long to load with many tickets',
        status: 'todo',
        priority: 'medium',
        type: 'improvement',
        reporter_id: userIds[2],
        assignee_id: userIds[3],
        tags: ['performance', 'dashboard', 'optimization']
      },
      {
        title: 'Database backup task',
        description: 'Setup automated database backups',
        status: 'resolved',
        priority: 'low',
        type: 'task',
        reporter_id: userIds[0],
        assignee_id: userIds[1],
        tags: ['database', 'backup', 'maintenance']
      }
    ];

    const ticketIds = [];
    for (const ticket of tickets) {
      const result = await client.query(
        `INSERT INTO tickets (title, description, status, priority, type, reporter_id, assignee_id, tags) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id`,
        [ticket.title, ticket.description, ticket.status, ticket.priority, ticket.type, ticket.reporter_id, ticket.assignee_id, ticket.tags]
      );
      ticketIds.push(result.rows[0].id);
    }

    logger.info(`Created ${ticketIds.length} tickets`);

    // 3. Créer des commentaires de test
    const comments = [
      {
        ticket_id: ticketIds[0],
        user_id: userIds[1],
        content: 'I\'m investigating this issue. It seems to be related to the JWT token validation.'
      },
      {
        ticket_id: ticketIds[1],
        user_id: userIds[2],
        content: 'I\'ve started working on the wireframes for the profile page.'
      },
      {
        ticket_id: ticketIds[1],
        user_id: userIds[1],
        content: 'Great! Please make sure to include avatar upload functionality.'
      }
    ];

    for (const comment of comments) {
      await client.query(
        'INSERT INTO comments (ticket_id, user_id, content) VALUES ($1, $2, $3)',
        [comment.ticket_id, comment.user_id, comment.content]
      );
    }

    logger.info(`Created ${comments.length} comments`);

    await client.query('COMMIT');
    logger.info('Database seeded successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exécuter si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };