import bcrypt from "bcrypt";
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

function login(email, password) {}

export { register };
