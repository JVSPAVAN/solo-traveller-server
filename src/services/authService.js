const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { User } = require('../models');

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../../keys/private.pem'), 'utf8');

function decryptPassword(encryptedPassword) {
  try {
    // Fix common transmission issue where + becomes space
    const safePassword = encryptedPassword.replace(/ /g, '+');
    const buffer = Buffer.from(safePassword, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: PRIVATE_KEY,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error('Password decryption failed');
  }
}

async function register({ email, encryptedPassword }) {
  const existingUser = await User.findOne({ email }); // Mongoose syntax
  if (existingUser) {
    throw new Error('User already exists');
  }

  const password = decryptPassword(encryptedPassword);
  const password_hash = await argon2.hash(password);

  const user = await User.create({
    email,
    password_hash,
  });

  return { id: user._id, email: user.email };
}

async function login({ email, encryptedPassword }) {
  const user = await User.findOne({ email }); // Mongoose syntax
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const password = decryptPassword(encryptedPassword);
  const valid = await argon2.verify(user.password_hash, password);

  if (!valid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, user: { id: user._id, email: user.email } };
}

module.exports = {
  register,
  login,
  decryptPassword,
};
