/**
 * Customer Routes
 * Protected routes for customer role
 */
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { isCustomer } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', isCustomer, customerController.getDashboard);

// Vendors & Menu
router.get('/vendors', isCustomer, customerController.getVendors);
router.get('/menu/:id', isCustomer, customerController.getMenu);

// Orders
router.post('/place-order', isCustomer, customerController.placeOrder);
router.get('/orders', isCustomer, customerController.getOrders);
router.get('/orders/:id', isCustomer, customerController.getOrderDetail);
router.get('/orders/:id/status', isCustomer, customerController.getOrderStatus);

// TAM Survey
router.get('/tam-survey', isCustomer, customerController.getTamSurvey);
router.post('/tam-survey', isCustomer, customerController.postTamSurvey);

// Search foods across all vendors (NEW)
router.get('/search', isCustomer, customerController.searchFoods);
module.exports = router;
