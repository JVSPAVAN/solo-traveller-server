const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = require('../src/index');
const User = require('../src/models/User');
const Trip = require('../src/models/Trip');

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
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.disconnect();
  await mongoose.connect(uri);

  // Register and Login
  await request(app)
    .post('/api/auth/register')
    .send({
      email: 'tripuser@example.com',
      encryptedPassword: encryptPassword('securepass'),
    });
  
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'tripuser@example.com',
      encryptedPassword: encryptPassword('securepass'),
    });
  
  token = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Trip Endpoints', () => {
  it('should create a new trip', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Tokyo',
        start_date: '2025-06-01',
        end_date: '2025-06-15',
        notes: 'Cherry blossoms',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.destination).toEqual('Tokyo');
  });

  it('should fetch user trips', async () => {
    const res = await request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].destination).toEqual('Tokyo');
  });

  it('should verify data encryption in DB', async () => {
    // Direct Mongoose access without decrypting via helper/hook?
    // Our 'post' hooks run on find. To see raw data, we need to use 'lean' and NOT let hooks run?
    // Or check the raw document from driver.
    
    const trip = await mongoose.connection.collection('trips').findOne({ destination: { $exists: true } });
    // Note: 'destination' field query usually works on plain text, but since we encrypt BEFORE save,
    // we can't query by plain text 'destination' easily unless we encrypt current search term.
    // So let's just find ANY trip.

    // Wait, we query by ID?
    // Let's get the one we just made.
    const trips = await Trip.find({});
    // This uses the model, so hooks run.
    
    // Access raw collection
    const rawTrips = await mongoose.connection.db.collection('trips').find({}).toArray();
    const rawDestination = rawTrips[0].destination;

    expect(rawDestination).not.toEqual('Tokyo');
    expect(rawDestination).toContain(':'); // IV:Content format
  });
});
