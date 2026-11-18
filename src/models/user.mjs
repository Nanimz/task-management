import db from "../config/database.mjs";

const User = {
  async findByEmail(email) {
    const SQLQuery = `
      SELECT id, name, email, password
      FROM users
      WHERE email = $1
    `;
    const result = await db.query(SQLQuery, [email]);
    return result.rows[0];
  },

  async findById(id) {
    const SQLQuery = `
      SELECT id, name, email, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const result = await db.query(SQLQuery, [id]);
    return result.rows[0];
  },

  async create(name, email, password) {
    const SQLQuery = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at, updated_at
    `;
    const values = [name, email, password];
    const result = await db.query(SQLQuery, values);
    return result.rows[0];
  },

  async update(id, name, email) {
    const SQLQuery = `
      UPDATE users
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, email, created_at, updated_at
    `;
    const values = [name ?? null, email ?? null, id];
    const result = await db.query(SQLQuery, values);
    return result.rows[0];
  },

  async updatePassword(id, newPassword) {
    const SQLQuery = `
      UPDATE users
      SET password = $1,
          updated_at = NOW()
      WHERE id = $2
    `;
    const values = [newPassword, id];
    await db.query(SQLQuery, values);
  },
};

export default User;
