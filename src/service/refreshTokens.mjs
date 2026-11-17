import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.mjs";
import refreshTokens from "../models/refreshTokens.mjs";

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
