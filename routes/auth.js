/**
 * Auth Routes
 * Handles login, register, logout
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');

// Login
router.get('/login', redirectIfAuthenticated, authController.getLogin);
router.post('/login', redirectIfAuthenticated, authController.postLogin);

// Register
router.get('/register', redirectIfAuthenticated, authController.getRegister);
router.post('/register', redirectIfAuthenticated, authController.postRegister);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
