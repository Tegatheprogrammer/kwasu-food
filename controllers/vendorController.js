/**
 * Vendor Controller
 * Handles vendor-specific features
 */
const db = require('../config/db');

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

// POST - Add Menu Item
const addMenuItem = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { name, description, price, category } = req.body;

        const [vendors] = await db.execute(
            'SELECT id FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/vendor/menu');
        }

        await db.execute(
            `INSERT INTO menu_items (vendor_id, name, description, price, category)
             VALUES (?, ?, ?, ?, ?)`,
            [vendors[0].id, name, description || null, price, category]
        );

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
        const { name, description, price, category } = req.body;

        const [vendors] = await db.execute(
            'SELECT id FROM vendors WHERE user_id = ?',
            [userId]
        );

        if (vendors.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/vendor/menu');
        }

        await db.execute(
            `UPDATE menu_items
             SET name = ?, description = ?, price = ?, category = ?
             WHERE id = ? AND vendor_id = ?`,
            [name, description || null, price, category, itemId, vendors[0].id]
        );

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

module.exports = {
    getDashboard,
    toggleShop,
    getMenu,
    addMenuItem,
    updateMenuItem,
    toggleMenuItem,
    deleteMenuItem,
    getOrders,
    updateOrderStatus
};
