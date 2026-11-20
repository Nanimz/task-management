import db from "../config/database.mjs";

const Task = {
  async create(userId, { title, description, status, priority, due_date }) {
    const SQLQuery = `
      INSERT INTO tasks (user_id, title, description, status, priority, due_date)
      VALUES ($1, $2, $3, COALESCE($4, 'pending'), COALESCE($5, 'medium'), $6)
      RETURNING *
    `;
    const values = [
      userId,
      title,
      description ?? null,
      status ?? null,
      priority ?? null,
      due_date ?? null,
    ];
    const result = await db.query(SQLQuery, values);
    return result.rows[0];
  },

  async getAllByUserId(userId) {
    const SQLQuery = `
      SELECT * 
      FROM tasks
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(SQLQuery, [userId]);
    return result.rows;
  },

  async getTaskById(taskId, userId) {
    const SQLQuery = `
      SELECT *
      FROM tasks
      WHERE id = $1 AND user_id = $2
    `;
    const values = [taskId, userId];
    const result = await db.query(SQLQuery, values);
    return result.rows[0];
  },

  async update(
    taskId,
    userId,
    { title, description, status, priority, due_date },
  ) {
    const SQLQuery = `
      UPDATE tasks
      SET title       = COALESCE($3, title),
          description = COALESCE($4, description),
          status      = COALESCE($5, status),
          priority    = COALESCE($6, priority),
          due_date    = COALESCE($7, due_date),
          updated_at  = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const values = [
      taskId,
      userId,
      title ?? null,
      description ?? null,
      status ?? null,
      priority ?? null,
      due_date ?? null,
    ];
    const result = await db.query(SQLQuery, values);
    return result.rows[0];
  },

  async delete(taskId, userId) {
    const SQLQuery = `
      DELETE FROM tasks
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const values = [taskId, userId];
    const result = await db.query(SQLQuery, values);
    return result.rows[0];
  },

  async search(userId, title) {
    const SQLQuery = `
      SELECT * FROM tasks
      WHERE user_id = $1 AND title ILIKE $2
      ORDER BY created_at DESC
    `;
    const values = [userId, `%${title}%`];
    const result = await db.query(SQLQuery, values);
    return result.rows;
  },

  async filterByStatus(userId, status) {
    const SQLQuery = `
      SELECT * FROM tasks
      WHERE user_id = $1 AND status = $2
      ORDER BY created_at DESC
    `;
    const values = [userId, status];
    const result = await db.query(SQLQuery, values);
    return result.rows;
  },
};

export default Task;
