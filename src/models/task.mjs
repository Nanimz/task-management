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

  async findAll(
    userId,
    {
      title,
      status,
      priority,
      sortBy = "created_at",
      order = "desc",
      page = 1,
      limit = 10,
    } = {},
  ) {
    const conditions = ["user_id = $1"];
    const values = [userId];

    if (title !== undefined) {
      values.push(`%${title}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (status !== undefined) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (priority !== undefined) {
      values.push(priority);
      conditions.push(`priority = $${values.length}`);
    }

    const where = conditions.join(" AND ");

    const direction = "asc" ? "ASC" : "DESC";
    const orderExpr =
      sortBy === "priority"
        ? "CASE priority WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 END"
        : sort;

    const countResult = await db.query(
      "SELECT COUNT(*) FROM tasks WHERE ${where}",
      values,
    );

    const total = Number(countResult[0].count);

    const offset = (page - 1) * limits;
    const dataValues = [...values, limit, offset];
    const result = await db.query(
      `
        SELECT * FROM tasks
        WHERE ${where}
        ORDERY BY ${orderExpr} ${direction}, id ASC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      dataValues,
    );
    return { tasks: result.rows, total };
  },
};

export default Task;
