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

async function debugKey(req, res) {
  try {
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');
    const keyPath = path.join(__dirname, '../../keys/private.pem');
    
    if (!fs.existsSync(keyPath)) {
      return res.json({ status: 'missing', path: keyPath });
    }
    
    const key = fs.readFileSync(keyPath, 'utf8');
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    res.json({ status: 'present', fingerprint: hash.substring(0, 10) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    // req.user is set by verifyToken middleware (which needs to be applied to this route)
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await authService.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { register, login, debugKey, updateProfile };
