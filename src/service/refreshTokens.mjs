import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.mjs";
import RefreshTokens from "../models/refreshTokens.mjs";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
}

async function issueRefreshToken(userId) {
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const days = process.env.REFRESH_TOKEN_EXPIRES_DAYS;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await RefreshTokens.create(userId, hashToken(refreshToken), expiresAt);
  return refreshToken;
}
