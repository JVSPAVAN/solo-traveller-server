const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = require('../src/index');
const User = require('../src/models/User');

const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../keys/public.pem'), 'utf8');

function encryptPassword(password) {
  const buffer = Buffer.from(password, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  );
  return encrypted.toString('base64');
}

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.disconnect();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        encryptedPassword: encryptPassword('password123'),
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should login with valid credentials', async () => {
    // Create user first
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        encryptedPassword: encryptPassword('password123'),
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        encryptedPassword: encryptPassword('password123'),
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
