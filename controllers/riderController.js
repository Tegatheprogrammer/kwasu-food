/**
 * Rider Controller
 * Handles dispatch rider features - receives offers from vendors
 */
const db = require('../config/db');

// GET - Rider Dashboard
const getDashboard = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Active deliveries (accepted offers)
        const [assigned] = await db.execute(
            `SELECT o.*, v.shop_name, v.location as vendor_location,
                    u.full_name as customer_name, u.phone as customer_phone
             FROM orders o
             JOIN vendors v ON o.vendor_id = v.id
             JOIN users u ON o.customer_id = u.id
             WHERE o.rider_id = ? AND o.status IN ('out_for_delivery', 'ready')
             AND o.rider_offer_status = 'accepted'
             ORDER BY o.updated_at DESC`,
            [userId]
        );

        // Pending offers for this rider
        const [offers] = await db.execute(
            `SELECT ro.*, o.delivery_hostel, o.total_amount, o.delivery_fee,
                    v.shop_name, v.location as vendor_location, u.full_name as customer_name
             FROM rider_offers ro
             JOIN orders o ON ro.order_id = o.id
             JOIN vendors v ON ro.vendor_id = v.id
             JOIN users u ON o.customer_id = u.id
             WHERE ro.rider_id = ? AND ro.status = 'pending'
             ORDER BY ro.created_at DESC`,
            [userId]
        );

        // Completed deliveries count
        const [completedCount] = await db.execute(
            `SELECT COUNT(*) as count FROM orders
             WHERE rider_id = ? AND status = 'delivered'`,
            [userId]
        );

        // Total earnings
        const [earnings] = await db.execute(
            `SELECT COALESCE(SUM(delivery_fee), 0) as total FROM orders
             WHERE rider_id = ? AND status = 'delivered'`,
            [userId]
        );

        res.render('rider/dashboard', {
            title: 'Rider Dashboard - KWASU Food',
            assigned,
            offers,
            completedCount: completedCount[0].count,
            totalEarnings: earnings[0].total
        });
    } catch (error) {
        console.error('Rider dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
};

// GET - Rider Offers Page
const getOffers = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [offers] = await db.execute(
            `SELECT ro.*, o.delivery_hostel, o.total_amount, o.delivery_fee, o.status as order_status,
                    v.shop_name, v.location as vendor_location, v.phone as vendor_phone,
                    u.full_name as customer_name, u.phone as customer_phone
             FROM rider_offers ro
             JOIN orders o ON ro.order_id = o.id
             JOIN vendors v ON ro.vendor_id = v.id
             JOIN users u ON o.customer_id = u.id
             WHERE ro.rider_id = ?
             ORDER BY 
                CASE ro.status 
                    WHEN 'pending' THEN 1 
                    WHEN 'accepted' THEN 2 
                    WHEN 'rejected' THEN 3 
                END,
                ro.created_at DESC`,
            [userId]
        );

        res.render('rider/offers', {
            title: 'My Offers - KWASU Food',
            offers
        });
    } catch (error) {
        console.error('Rider offers error:', error);
        req.flash('error', 'Failed to load offers');
        res.redirect('/rider/dashboard');
    }
};

// POST - Accept Rider Offer
const acceptOffer = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const offerId = req.params.id;

        const [offers] = await db.execute(
            `SELECT ro.*, o.vendor_id FROM rider_offers ro
             JOIN orders o ON ro.order_id = o.id
             WHERE ro.id = ? AND ro.rider_id = ? AND ro.status = 'pending'`,
            [offerId, userId]
        );

        if (offers.length === 0) {
            req.flash('error', 'Offer not found or already processed');
            return res.redirect('/rider/offers');
        }

        const offer = offers[0];

        await db.execute(
            `UPDATE rider_offers SET status = 'accepted' WHERE id = ?`,
            [offerId]
        );

        await db.execute(
            `UPDATE orders SET status = 'out_for_delivery', rider_offer_status = 'accepted'
             WHERE id = ?`,
            [offer.order_id]
        );

        await db.execute(
            `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
            [offer.vendor_id, `Rider has accepted delivery offer for Order #${offer.order_id}. Out for delivery!`]
        );

        const [orders] = await db.execute(
            'SELECT customer_id FROM orders WHERE id = ?',
            [offer.order_id]
        );
        if (orders.length > 0) {
            await db.execute(
                `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
                [orders[0].customer_id, `Your Order #${offer.order_id} is now out for delivery!`]
            );
        }

        req.flash('success', 'Offer accepted! Order is now out for delivery.');
        res.redirect('/rider/dashboard');
    } catch (error) {
        console.error('Accept offer error:', error);
        req.flash('error', 'Failed to accept offer');
        res.redirect('/rider/offers');
    }
};

// POST - Reject Rider Offer
const rejectOffer = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const offerId = req.params.id;

        const [offers] = await db.execute(
            `SELECT ro.*, o.vendor_id FROM rider_offers ro
             JOIN orders o ON ro.order_id = o.id
             WHERE ro.id = ? AND ro.rider_id = ? AND ro.status = 'pending'`,
            [offerId, userId]
        );

        if (offers.length === 0) {
            req.flash('error', 'Offer not found or already processed');
            return res.redirect('/rider/offers');
        }

        const offer = offers[0];

        await db.execute(
            `UPDATE rider_offers SET status = 'rejected' WHERE id = ?`,
            [offerId]
        );

        await db.execute(
            `UPDATE orders SET rider_offer_status = 'rejected', rider_id = NULL
             WHERE id = ?`,
            [offer.order_id]
        );

        await db.execute(
            `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
            [offer.vendor_id, `Rider rejected delivery offer for Order #${offer.order_id}. Please select another rider.`]
        );

        req.flash('success', 'Offer rejected. Vendor will be notified.');
        res.redirect('/rider/offers');
    } catch (error) {
        console.error('Reject offer error:', error);
        req.flash('error', 'Failed to reject offer');
        res.redirect('/rider/offers');
    }
};

// GET - Rider Deliveries
const getDeliveries = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [deliveries] = await db.execute(
            `SELECT o.*, v.shop_name, v.location as vendor_location,
                    u.full_name as customer_name, u.phone as customer_phone
             FROM orders o
             JOIN vendors v ON o.vendor_id = v.id
             JOIN users u ON o.customer_id = u.id
             WHERE o.rider_id = ? AND o.status IN ('out_for_delivery', 'ready')
             AND o.rider_offer_status = 'accepted'
             ORDER BY o.updated_at DESC`,
            [userId]
        );

        res.render('rider/deliveries', {
            title: 'My Deliveries - KWASU Food',
            deliveries
        });
    } catch (error) {
        console.error('Rider deliveries error:', error);
        req.flash('error', 'Failed to load deliveries');
        res.redirect('/rider/dashboard');
    }
};

// POST - Mark Order as Delivered
const markDelivered = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;

        const [orders] = await db.execute(
            `SELECT vendor_id, customer_id FROM orders
             WHERE id = ? AND rider_id = ? AND status = 'out_for_delivery'`,
            [orderId, userId]
        );

        if (orders.length === 0) {
            req.flash('error', 'Order not found or not out for delivery');
            return res.redirect('/rider/deliveries');
        }

        await db.execute(
            `UPDATE orders SET status = 'delivered' WHERE id = ?`,
            [orderId]
        );

        await db.execute(
            `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
            [orders[0].vendor_id, `Order #${orderId} has been delivered successfully!`]
        );
        await db.execute(
            `INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
            [orders[0].customer_id, `Your Order #${orderId} has been delivered! Enjoy your meal!`]
        );

        req.flash('success', 'Order marked as delivered!');
        res.redirect('/rider/deliveries');
    } catch (error) {
        console.error('Mark delivered error:', error);
        req.flash('error', 'Failed to mark as delivered');
        res.redirect('/rider/deliveries');
    }
};

module.exports = {
    getDashboard,
    getOffers,
    acceptOffer,
    rejectOffer,
    getDeliveries,
    markDelivered
};