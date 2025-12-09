const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../gateway/middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/debug-key', authController.debugKey);
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;
