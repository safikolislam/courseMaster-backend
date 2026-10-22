// controller for authentication routes

const authService = require("../services/auth.service");

const handleError = (res, err) => {
  res.status(err.statusCode || 500).json({ message: err.message });
};

const register = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  } catch (err) {
    handleError(res, err);
  }
};

const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (err) {
    handleError(res, err);
  }
};

const me = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = { register, login, me };

