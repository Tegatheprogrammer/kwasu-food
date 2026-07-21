/**
 * Auth Routes
 * Handles login, register, logout, forgot/reset password
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

// Forgot Password
router.get('/forgot-password', redirectIfAuthenticated, authController.getForgotPassword);
router.post('/forgot-password', redirectIfAuthenticated, authController.postForgotPassword);

// Reset Password
router.get('/reset-password', redirectIfAuthenticated, authController.getResetPassword);
router.post('/reset-password', redirectIfAuthenticated, authController.postResetPassword);

// Logout
router.get('/logout', authController.logout);

module.exports = router;