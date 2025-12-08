const { Trip } = require('../models');

async function createTrip(userId, tripData) {
  return await Trip.create({
    ...tripData,
    user_id: userId,
  });
}

async function getTrips(userId) {
  // Mongoose find
  return await Trip.find({ user_id: userId });
}

async function getTrip(userId, tripId) {
  return await Trip.findOne({
    _id: tripId,
    user_id: userId,
  });
}

async function updateTrip(userId, tripId, updates) {
  const trip = await Trip.findOne({
    _id: tripId,
    user_id: userId,
  });

  if (!trip) {
    throw new Error('Trip not found');
  }

  // Update fields
  Object.keys(updates).forEach((key) => {
    trip[key] = updates[key];
  });
  
  // Save triggers hooks (encryption)
  return await trip.save();
}

async function deleteTrip(userId, tripId) {
  const result = await Trip.deleteOne({
    _id: tripId,
    user_id: userId,
  });

  if (result.deletedCount === 0) {
    throw new Error('Trip not found');
  }

  return { message: 'Trip deleted' };
}

module.exports = {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
};
