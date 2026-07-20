/**
 * Admin Routes
 * Protected routes for admin role
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', isAdmin, adminController.getDashboard);

// Users
router.get('/users', isAdmin, adminController.getUsers);
router.post('/users/:id/toggle', isAdmin, adminController.toggleUser);

// TAM Results
router.get('/tam-results', isAdmin, adminController.getTamResults);

module.exports = router;
