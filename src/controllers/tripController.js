const tripService = require('../services/tripService');

async function createTrip(req, res) {
  try {
    const trip = await tripService.createTrip(req.user.id, req.body);
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getTrips(req, res) {
  try {
    const trips = await tripService.getTrips(req.user.id);
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getTrip(req, res) {
  try {
    const trip = await tripService.getTrip(req.user.id, req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateTrip(req, res) {
  try {
    const trip = await tripService.updateTrip(req.user.id, req.params.id, req.body);
    res.json(trip);
  } catch (error) {
    if (error.message === 'Trip not found') {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.status(400).json({ error: error.message });
  }
}

async function deleteTrip(req, res) {
  try {
    await tripService.deleteTrip(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Trip not found') {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
};
