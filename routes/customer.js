/**
 * Customer Routes
 * Protected routes for customer role
 */
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { isCustomer, requireCustomerForOrder } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', isCustomer, customerController.getDashboard);

// Vendors & Menu - open to everyone so visitors can browse before signing up
router.get('/vendors', customerController.getVendors);
router.get('/menu/:id', customerController.getMenu);

// Orders - placing an order requires a customer account
router.post('/place-order', requireCustomerForOrder, customerController.placeOrder);
router.get('/orders', isCustomer, customerController.getOrders);
router.get('/orders/:id', isCustomer, customerController.getOrderDetail);
router.get('/orders/:id/status', isCustomer, customerController.getOrderStatus);

// Demo payment gateway (no real money moves - for project demo purposes only)
router.get('/payment/:orderId', isCustomer, customerController.getPaymentPage);
router.post('/payment/:orderId/pay', isCustomer, customerController.confirmPayment);

// TAM Survey
router.get('/tam-survey', isCustomer, customerController.getTamSurvey);
router.post('/tam-survey', isCustomer, customerController.postTamSurvey);

// Search foods across all vendors - open to everyone
router.get('/search', customerController.searchFoods);
module.exports = router;
