const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { User } = require('../models');

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../../keys/private.pem'), 'utf8');

function decryptPassword(encryptedPassword) {
  try {
    const buffer = Buffer.from(encryptedPassword, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: PRIVATE_KEY,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      buffer
    );
    return decrypted.toString('utf8');
  } catch (error) {
    // Debugging: Expose real error
    console.error("Decryption inner error:", error);
    throw new Error(`Decryption failed: ${error.message}. Payload len: ${encryptedPassword ? encryptedPassword.length : 0}`);
  }
}

async function register({ email, encryptedPassword, name, location, bio }) {
  const existingUser = await User.findOne({ email }); // Mongoose syntax
  if (existingUser) {
    throw new Error('User already exists');
  }

  const password = decryptPassword(encryptedPassword);
  const password_hash = await argon2.hash(password);

  const user = await User.create({
    email,
    password_hash,
    name: name || '',
    location: location || '',
    bio: bio || '',
  });

  return { id: user._id, email: user.email, name: user.name, location: user.location, bio: user.bio };
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

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      location: user.location,
      bio: user.bio
    }
  };
}

async function updateProfile(userId, data) {
  // Prevent updating sensitive fields like password or email directly here if not desired (simplified for now)
  const allowedUpdates = ['name', 'phone', 'location', 'bio'];
  const updateData = {};
  
  Object.keys(data).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updateData[key] = data[key];
    }
  });

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true, select: '-password_hash' });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

module.exports = {
  register,
  login,
  updateProfile,
  decryptPassword,
};
