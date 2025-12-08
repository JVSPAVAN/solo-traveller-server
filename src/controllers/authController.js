const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { email, encryptedPassword } = req.body;
    if (!email || !encryptedPassword) {
      return res.status(400).json({ error: 'Email and encryptedPassword are required' });
    }
    const result = await authService.register({ email, encryptedPassword });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, encryptedPassword } = req.body;
    if (!email || !encryptedPassword) {
      return res.status(400).json({ error: 'Email and encryptedPassword are required' });
    }
    const result = await authService.login({ email, encryptedPassword });
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

module.exports = { register, login };
