const mongoose = require('mongoose');
const argon2 = require('argon2');
const connectDB = require('./config/database');
const User = require('./models/User');
const Trip = require('./models/Trip');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Trip.deleteMany({});
    console.log('Cleared existing data...');

    // Create a demo user
    const password_hash = await argon2.hash('password123');
    const user = await User.create({
      email: 'demo@solotraveller.com',
      password_hash,
    });
    console.log(`Created user: ${user.email}`);

    // Create some trips
    const trips = [
      {
        user_id: user._id,
        destination: 'Paris, France',
        start_date: new Date('2024-05-10'),
        end_date: new Date('2024-05-17'),
        notes: 'Visit the Louvre and Eiffel Tower. Stay in Le Marais.',
      },
      {
        user_id: user._id,
        destination: 'Tokyo, Japan',
        start_date: new Date('2024-10-01'),
        end_date: new Date('2024-10-14'),
        notes: 'Shinjuku area, day trip to Hakone.',
      },
      {
        user_id: user._id,
        destination: 'Reykjavik, Iceland',
        start_date: new Date('2025-01-15'),
        end_date: new Date('2025-01-20'),
        notes: 'Northern lights tour booked.',
      },
    ];

    // Create one by one to trigger encryption hooks
    for (const tripData of trips) {
      await Trip.create(tripData);
      console.log(`Created trip to: ${tripData.destination}`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
