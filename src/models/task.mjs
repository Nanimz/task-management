import db from "../config/database.mjs";

const Task = {
  async create(userId, { title, description, status, priority, due_date }) {
    const SQLQuery = `
      INSERT INTO tasks (user_id, title, description, status, priority, due_date)
      VALUES ($1, $2, $3, COALESCE($4, 'pending'), COALESCE($5, 'medium') $6)
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
};

export default Task;
