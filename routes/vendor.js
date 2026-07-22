/**
 * Vendor Routes
 * Protected routes for vendor role
 */
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { isVendor } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', isVendor, vendorController.getDashboard);
router.post('/toggle-shop', isVendor, vendorController.toggleShop);

// Menu Management
router.get('/menu', isVendor, vendorController.getMenu);
router.post('/menu/add', isVendor, vendorController.addMenuItem);
router.post('/menu/edit/:id', isVendor, vendorController.updateMenuItem);
router.post('/menu/toggle/:id', isVendor, vendorController.toggleMenuItem);
router.post('/menu/delete/:id', isVendor, vendorController.deleteMenuItem);
const upload = require('../config/multer'); // ADD THIS

// Orders
router.get('/orders', isVendor, vendorController.getOrders);
router.post('/orders/:id/status', isVendor, vendorController.updateOrderStatus);
// ADD THIS - Image upload route
router.post('/menu/upload-image', isVendor, upload.single('food_image'), vendorController.uploadMenuImage);

// Rider selection (NEW)
router.get('/select-rider/:id', isVendor, vendorController.getSelectRider);
router.post('/send-offer/:id', isVendor, vendorController.sendRiderOffer);

module.exports = router;
