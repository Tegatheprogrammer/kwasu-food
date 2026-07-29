/**
 * Vendor Controller
 * Handles vendor-specific features
 */
const db = require('../config/db');
const path = require('path');
const fs = require('fs');
// GET - Vendor Dashboard
const getDashboard = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Get vendor info
        const [vendors] = await db.execute(
            'SELECT * FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor profile not found');
            return res.redirect('/');
        }

        const vendor = vendors[0];

        // Pending orders count
        const [pendingCount] = await db.execute(
            `SELECT COUNT(*) as count FROM orders
             WHERE vendor_id = ? AND status IN ('pending', 'received', 'preparing')`,
            [vendor.id]
        );

        // Today's revenue
        const [todayRevenue] = await db.execute(
            `SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders
             WHERE vendor_id = ? AND status = 'delivered'
             AND DATE(created_at) = CURDATE()`,
            [vendor.id]
        );

        // Unread notifications
        const [notifCount] = await db.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [userId]
        );

        res.render('vendor/dashboard', {
            title: 'Vendor Dashboard - KWASU Food',
            vendor,
            pendingCount: pendingCount[0].count,
            todayRevenue: todayRevenue[0].revenue,
            unreadCount: notifCount[0].count
        });
    } catch (error) {
        console.error('Vendor dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
};

// POST - Toggle Shop Status
const toggleShop = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [vendors] = await db.execute(
            'SELECT * FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/vendor/dashboard');
        }

        const newStatus = vendors[0].is_open ? 0 : 1;

        await db.execute(
            'UPDATE vendors SET is_open = ? WHERE user_id = ?',
            [newStatus, userId]
        );

        req.flash('success', `Shop is now ${newStatus ? 'OPEN' : 'CLOSED'}`);
        res.redirect('/vendor/dashboard');
    } catch (error) {
        console.error('Toggle shop error:', error);
        req.flash('error', 'Failed to update shop status');
        res.redirect('/vendor/dashboard');
    }
};

// GET - Manage Menu
const getMenu = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [vendors] = await db.execute(
            'SELECT id FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/vendor/dashboard');
        }

        const [menuItems] = await db.execute(
            `SELECT * FROM menu_items
             WHERE vendor_id = ?
             ORDER BY category, name`,
            [vendors[0].id]
        );

        if (menuItems.length > 0) {
            const itemIds = menuItems.map(item => item.id);
            const placeholders = itemIds.map(() => '?').join(',');
            const [galleryRows] = await db.execute(
                `SELECT menu_item_id, image_url FROM menu_item_images
                 WHERE menu_item_id IN (${placeholders})
                 ORDER BY position`,
                itemIds
            );
            const galleryByItem = {};
            galleryRows.forEach(row => {
                if (!galleryByItem[row.menu_item_id]) galleryByItem[row.menu_item_id] = [];
                galleryByItem[row.menu_item_id].push(row.image_url);
            });
            menuItems.forEach(item => {
                item.images = galleryByItem[item.id] || (item.image_url ? [item.image_url] : []);
            });
        }

        res.render('vendor/menu', {
            title: 'Manage Menu - KWASU Food',
            menuItems
        });
    } catch (error) {
        console.error('Menu management error:', error);
        req.flash('error', 'Failed to load menu');
        res.redirect('/vendor/dashboard');
    }
};


// Collect up to 5 uploaded image URLs from a request body (image_url, image_url_2..image_url_5)
const collectImageUrls = (body) => {
    const urls = [body.image_url, body.image_url_2, body.image_url_3, body.image_url_4, body.image_url_5];
    return urls.map(u => (u || '').trim()).filter(Boolean).slice(0, 5);
};

// Replace a menu item's gallery with the given ordered list of image URLs
const saveMenuItemImages = async (menuItemId, imageUrls) => {
    await db.execute('DELETE FROM menu_item_images WHERE menu_item_id = ?', [menuItemId]);
    for (let i = 0; i < imageUrls.length; i++) {
        await db.execute(
            'INSERT INTO menu_item_images (menu_item_id, image_url, position) VALUES (?, ?, ?)',
            [menuItemId, imageUrls[i], i + 1]
        );
    }
};

// POST - Add Menu Item
const addMenuItem = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { name, description, price, category, stock_status } = req.body;
        const imageUrls = collectImageUrls(req.body);

        const [vendors] = await db.execute(
            'SELECT id FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/vendor/menu');
        }

        const [result] = await db.execute(
            `INSERT INTO menu_items (vendor_id, name, description, price, category, image_url, stock_status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [vendors[0].id, name, description || null, price, category, imageUrls[0] || null, stock_status || 'in_stock']
        );

        if (imageUrls.length > 0) {
            await saveMenuItemImages(result.insertId, imageUrls);
        }

        req.flash('success', 'Menu item added successfully');
        res.redirect('/vendor/menu');
    } catch (error) {
        console.error('Add menu item error:', error);
        req.flash('error', 'Failed to add menu item');
        res.redirect('/vendor/menu');
    }
};


// POST - Update Menu Item
const updateMenuItem = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const itemId = req.params.id;
        const { name, description, price, category, stock_status } = req.body;
        const imageUrls = collectImageUrls(req.body);

        const [vendors] = await db.execute(
            'SELECT id FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/vendor/menu');
        }

        const [existing] = await db.execute(
            'SELECT id FROM menu_items WHERE id = ? AND vendor_id = ?',
            [itemId, vendors[0].id]
        );

        if (existing.length === 0) {
            req.flash('error', 'Item not found');
            return res.redirect('/vendor/menu');
        }

        await db.execute(
            `UPDATE menu_items
             SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock_status = ?
             WHERE id = ? AND vendor_id = ?`,
            [name, description || null, price, category, imageUrls[0] || null, stock_status || 'in_stock', itemId, vendors[0].id]
        );

        await saveMenuItemImages(itemId, imageUrls);

        req.flash('success', 'Menu item updated successfully');
        res.redirect('/vendor/menu');
    } catch (error) {
        console.error('Update menu item error:', error);
        req.flash('error', 'Failed to update menu item');
        res.redirect('/vendor/menu');
    }
};

// POST - Toggle Menu Item Availability
const toggleMenuItem = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const itemId = req.params.id;

        const [vendors] = await db.execute(
            'SELECT id FROM vendors WHERE user_id = ?',
            [userId]
        );

        const [items] = await db.execute(
            'SELECT is_available FROM menu_items WHERE id = ? AND vendor_id = ?',
            [itemId, vendors[0].id]
        );

        if (items.length === 0) {
            req.flash('error', 'Item not found');
            return res.redirect('/vendor/menu');
        }

        const newStatus = items[0].is_available ? 0 : 1;

        await db.execute(
            'UPDATE menu_items SET is_available = ? WHERE id = ?',
            [newStatus, itemId]
        );

        req.flash('success', 'Item availability updated');
        res.redirect('/vendor/menu');
    } catch (error) {
        console.error('Toggle item error:', error);
        req.flash('error', 'Failed to update item');
        res.redirect('/vendor/menu');
    }
};

// POST - Delete Menu Item
const deleteMenuItem = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const itemId = req.params.id;

        const [vendors] = await db.execute(
            'SELECT id FROM vendors WHERE user_id = ?',
            [userId]
        );

        await db.execute(
            'DELETE FROM menu_items WHERE id = ? AND vendor_id = ?',
            [itemId, vendors[0].id]
        );

        req.flash('success', 'Menu item deleted');
        res.redirect('/vendor/menu');
    } catch (error) {
        console.error('Delete menu item error:', error);
        req.flash('error', 'Failed to delete menu item');
        res.redirect('/vendor/menu');
    }
};

// GET - Vendor Orders
const getOrders = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [vendors] = await db.execute(
            'SELECT id FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/vendor/dashboard');
        }

        const [orders] = await db.execute(
            `SELECT o.*, u.full_name as customer_name, u.phone as customer_phone
             FROM orders o
             JOIN users u ON o.customer_id = u.id
             WHERE o.vendor_id = ?
             ORDER BY o.created_at DESC`,
            [vendors[0].id]
        );

        res.render('vendor/orders', {
            title: 'Orders - KWASU Food',
            orders
        });
    } catch (error) {
        console.error('Vendor orders error:', error);
        req.flash('error', 'Failed to load orders');
        res.redirect('/vendor/dashboard');
    }
};

// POST - Update Order Status
const updateOrderStatus = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;
        const { status } = req.body;

        const [vendors] = await db.execute(
            'SELECT id FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/vendor/orders');
        }

        await db.execute(
            `UPDATE orders SET status = ?
             WHERE id = ? AND vendor_id = ?`,
            [status, orderId, vendors[0].id]
        );

        // If status is 'ready', redirect to rider selection page
        if (status === 'ready') {
            return res.redirect(`/vendor/select-rider/${orderId}`);
        }

        // Notify customer
        const [orders] = await db.execute(
            'SELECT customer_id FROM orders WHERE id = ?',
            [orderId]
        );

        if (orders.length > 0) {
            await db.execute(
                `INSERT INTO notifications (user_id, message)
                 VALUES (?, ?)`,
                [orders[0].customer_id, `Order #${orderId} status updated to: ${status.replace(/_/g, ' ').toUpperCase()}`]
            );
        }

        req.flash('success', 'Order status updated');
        res.redirect('/vendor/orders');
    } catch (error) {
        console.error('Update order status error:', error);
        req.flash('error', 'Failed to update order status');
        res.redirect('/vendor/orders');
    }
};

// GET - Select Rider Page (vendor chooses a rider)
const getSelectRider = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;

        const [vendors] = await db.execute(
            'SELECT * FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/vendor/orders');
        }

        const vendor = vendors[0];

        const [orders] = await db.execute(
            `SELECT o.*, u.full_name as customer_name, u.phone as customer_phone, u.hostel as customer_hostel
             FROM orders o
             JOIN users u ON o.customer_id = u.id
             WHERE o.id = ? AND o.vendor_id = ? AND o.status = 'ready'`,
            [orderId, vendor.id]
        );

        if (orders.length === 0) {
            req.flash('error', 'Order not found or not ready for dispatch');
            return res.redirect('/vendor/orders');
        }

        const [riders] = await db.execute(
            `SELECT u.id, u.full_name, u.phone, u.email
             FROM users u
             WHERE u.role = 'rider' AND u.is_active = 1
             ORDER BY u.full_name`
        );

        res.render('vendor/select-rider', {
            title: 'Select Rider - KWASU Food',
            order: orders[0],
            riders,
            vendorDeliveryFee: vendor.delivery_fee || 500
        });
    } catch (error) {
        console.error('Select rider error:', error);
        req.flash('error', 'Failed to load rider selection');
        res.redirect('/vendor/orders');
    }
};

// POST - Send Offer to Rider
const sendRiderOffer = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;
        const { rider_id, delivery_fee } = req.body;

        const [vendors] = await db.execute(
            'SELECT id FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/vendor/orders');
        }

        const vendorId = vendors[0].id;

        const [orders] = await db.execute(
            'SELECT * FROM orders WHERE id = ? AND vendor_id = ? AND status = ?',
            [orderId, vendorId, 'ready']
        );

        if (orders.length === 0) {
            req.flash('error', 'Order not found or not ready');
            return res.redirect('/vendor/orders');
        }

        await db.execute(
            `INSERT INTO rider_offers (order_id, rider_id, vendor_id, delivery_fee, status)
             VALUES (?, ?, ?, ?, 'pending')`,
            [orderId, rider_id, vendorId, delivery_fee || 500]
        );

        await db.execute(
            `UPDATE orders SET rider_id = ?, delivery_fee = ?, rider_offer_status = 'pending'
             WHERE id = ?`,
            [rider_id, delivery_fee || 500, orderId]
        );

        await db.execute(
            `INSERT INTO notifications (user_id, message)
             VALUES (?, ?)`,
            [rider_id, `New delivery offer! Order #${orderId} - Delivery fee: ₦${delivery_fee || 500}. Check your dashboard.`]
        );

        req.flash('success', 'Delivery offer sent to rider successfully!');
        res.redirect('/vendor/orders');
    } catch (error) {
        console.error('Send rider offer error:', error);
        req.flash('error', 'Failed to send rider offer');
        res.redirect(`/vendor/select-rider/${req.params.id}`);
    }
};

// POST - Upload Food Image
const uploadMenuImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }

        const imageUrl = '/uploads/food/' + req.file.filename;
        res.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: 'Upload failed' });
    }
};

module.exports = {
    getDashboard,
    toggleShop,
    getMenu,
    addMenuItem,
    updateMenuItem,
    toggleMenuItem,
    deleteMenuItem,
    getOrders,
    updateOrderStatus,
    getSelectRider,
    sendRiderOffer,
    uploadMenuImage 
};