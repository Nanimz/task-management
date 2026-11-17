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
};
