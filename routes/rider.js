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

// Deliveries
router.get('/deliveries', isRider, riderController.getDeliveries);
router.post('/deliveries/:id/accept', isRider, riderController.acceptDelivery);
router.post('/deliveries/:id/delivered', isRider, riderController.markDelivered);

module.exports = router;
