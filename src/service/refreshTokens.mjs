import db from "../config/database.mjs";

export default {
  async create(userId, tokenHash, expiresAt) {
    const SQLQuery = `
      INSERT INTO refresh_tokens(userId, token_hash, expires_at) 
      VALUES ($1, $2, $3)
    `;
    const values = [userId, tokenHash, expiresAt];
    await db.query(SQLQuery, values);
  },

  async findHash(tokenHash) {
    const SQLQuery = `
      SELECT * FROM refresh_tokens
      WHERE token_hash = $1 AND expires_at > NOW()
    `;
    const result = await db.query(SQLQuery, [tokenHash]);
    return result.rows[0];
  },

  async deleteByHash(tokenHash) {
    const SQLQuery = `
      DELETE FROM refresh_tokens
      WHERE token_hash = $1
    `;
    await db.query(SQLQuery, [tokenHash]);
  },
};
