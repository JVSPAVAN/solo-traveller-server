const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { verifyToken } = require('../gateway/middleware');

router.use(verifyToken); // Protect all trip routes

router.post('/', tripController.createTrip);
router.get('/', tripController.getTrips);
router.get('/:id', tripController.getTrip);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;
