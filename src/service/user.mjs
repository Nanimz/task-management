import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.mjs";

const SALT_ROUNDS = 10;

async function register(name, email, password) {
  const existingEmail = await User.findByEmail(email);
  if (existingEmail) {
    const error = new Error("Email sudah terdaftar");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await User.create(name, email, hashedPassword);
  return newUser;
}

async function login(email, password) {
  const existingUser = await User.findByEmail(email);
  if (!existingUser) {
    const error = new Error("Email atau password salah");
    error.statusCode = 401;
    throw error;
  }

  const validPassword = await bcrypt.compare(password, existingUser.password);
  if (!validPassword) {
    const error = new Error("Email atau password salah");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = jwt.sign(
    { id: existingUser.id, email: existingUser.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  return { accessToken };
}

export default { login, register };
