/**
 * Rider Routes
 * Protected routes for rider role
 */
const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');
const { isRider } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', isRider, riderController.getDashboard);

// Offers (NEW)
router.get('/offers', isRider, riderController.getOffers);
router.post('/offers/accept/:id', isRider, riderController.acceptOffer);
router.post('/offers/reject/:id', isRider, riderController.rejectOffer);

// Deliveries
router.get('/deliveries', isRider, riderController.getDeliveries);
router.post('/deliveries/:id/delivered', isRider, riderController.markDelivered);

module.exports = router;