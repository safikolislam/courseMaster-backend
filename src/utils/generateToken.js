

// utility to generate JWT token

const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured on the server");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = generateToken;
