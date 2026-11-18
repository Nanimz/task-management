import bcrypt from "bcrypt";
import User from "../models/user.mjs";
import tokenService from "./refreshTokens.mjs";

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
  const accessToken = tokenService.createAccessToken(existingUser);
  const refreshToken = await tokenService.issueRefreshToken(existingUser.id);

  return { accessToken, refreshToken };
}

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }
  return user;
}

async function updateProfile(userId, name, email) {
  if (email) {
    const existing = await User.findByEmail(email);
    if (existing && existing.id !== userId) {
      const error = new Error("Email sudah digunakan");
      error.statusCode = 409;
      throw error;
    }
  }
  const updatedUser = await User.update(userId, name, email);
  if (!updatedUser) {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }
  return updatedUser;
}

async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findByIdWithPassword(userId);
  if (!user) {
    const error = new Error("User tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) {
    const error = new Error("Old password salah");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.updatePassword(userId, hashedPassword);
}

export default { login, register, getProfile, updateProfile, changePassword };
