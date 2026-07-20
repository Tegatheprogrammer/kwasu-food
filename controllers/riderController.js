/**
 * Rider Controller
 * Handles dispatch rider features
 */
const db = require('../config/db');

// GET - Rider Dashboard
const getDashboard = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Assigned deliveries
        const [assigned] = await db.execute(
            `SELECT o.*, v.shop_name, u.full_name as customer_name, u.phone as customer_phone
             FROM orders o
             JOIN vendors v ON o.vendor_id = v.id
             JOIN users u ON o.customer_id = u.id
             WHERE o.rider_id = ? AND o.status IN ('out_for_delivery', 'ready')
             ORDER BY o.updated_at DESC`,
            [userId]
        );

        // Completed today
        const [completed] = await db.execute(
            `SELECT COUNT(*) as count FROM orders
             WHERE rider_id = ? AND status = 'delivered'
             AND DATE(updated_at) = CURDATE()`,
            [userId]
        );

        res.render('rider/dashboard', {
            title: 'Rider Dashboard - KWASU Food',
            assigned,
            completedToday: completed[0].count
        });
    } catch (error) {
        console.error('Rider dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
};

// GET - Available Deliveries
const getDeliveries = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Orders ready for delivery (not assigned to any rider yet)
        const [available] = await db.execute(
            `SELECT o.*, v.shop_name, v.location as vendor_location,
                    u.full_name as customer_name, u.phone as customer_phone
             FROM orders o
             JOIN vendors v ON o.vendor_id = v.id
             JOIN users u ON o.customer_id = u.id
             WHERE o.status = 'ready' AND (o.rider_id IS NULL OR o.rider_id = 0)
             ORDER BY o.created_at DESC`
        );

        // My current deliveries
        const [myDeliveries] = await db.execute(
            `SELECT o.*, v.shop_name, v.location as vendor_location,
                    u.full_name as customer_name, u.phone as customer_phone
             FROM orders o
             JOIN vendors v ON o.vendor_id = v.id
             JOIN users u ON o.customer_id = u.id
             WHERE o.rider_id = ? AND o.status IN ('out_for_delivery', 'ready')
             ORDER BY o.updated_at DESC`,
            [userId]
        );

        res.render('rider/deliveries', {
            title: 'Deliveries - KWASU Food',
            available,
            myDeliveries
        });
    } catch (error) {
        console.error('Deliveries error:', error);
        req.flash('error', 'Failed to load deliveries');
        res.redirect('/rider/dashboard');
    }
};

// POST - Accept Delivery
const acceptDelivery = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;

        await db.execute(
            `UPDATE orders SET rider_id = ?, status = 'out_for_delivery'
             WHERE id = ? AND status = 'ready'`,
            [userId, orderId]
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
                [orders[0].customer_id, `Order #${orderId} is out for delivery!`]
            );
        }

        req.flash('success', 'Delivery accepted!');
        res.redirect('/rider/deliveries');
    } catch (error) {
        console.error('Accept delivery error:', error);
        req.flash('error', 'Failed to accept delivery');
        res.redirect('/rider/deliveries');
    }
};

// POST - Mark Delivered
const markDelivered = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;

        await db.execute(
            `UPDATE orders SET status = 'delivered'
             WHERE id = ? AND rider_id = ?`,
            [orderId, userId]
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
                [orders[0].customer_id, `Order #${orderId} has been delivered! Enjoy your meal!`]
            );
        }

        req.flash('success', 'Order marked as delivered!');
        res.redirect('/rider/deliveries');
    } catch (error) {
        console.error('Mark delivered error:', error);
        req.flash('error', 'Failed to update delivery status');
        res.redirect('/rider/deliveries');
    }
};

module.exports = {
    getDashboard,
    getDeliveries,
    acceptDelivery,
    markDelivered
};
