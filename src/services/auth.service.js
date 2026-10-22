// authentication service

const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendWelcomeEmail } = require("./email.service");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const register = async ({ name, email, password, adminKey }) => {
  const exists = await User.findOne({ email });
  if (exists) throw createError("Email already registered", 409);

  // role ক্লায়েন্ট থেকে নেওয়া হয় না, শুধু adminKey যাচাই করে ঠিক হয়
  let role = "student";
  if (adminKey) {
    const validKey = process.env.ADMIN_REGISTRATION_KEY;
    if (!validKey || adminKey !== validKey) {
      throw createError("Invalid admin registration key", 403);
    }
    role = "admin";
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });

  const token = generateToken({ id: user._id, role: user.role });

  // Send welcome email (non-blocking - don't wait for it)
  sendWelcomeEmail(user.email, user.name).catch((err) => {
    console.error("Email sending failed (non-critical):", err.message);
  });

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createError("Invalid email or password", 401);

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw createError("Invalid email or password", 401);

  const token = generateToken({ id: user._id, role: user.role });

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) throw createError("User not found", 404);
  return user;
};

module.exports = { register, login, getMe };
