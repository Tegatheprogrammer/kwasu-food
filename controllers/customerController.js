/**
 * Customer Controller
 * Handles customer-specific features
 */
const db = require('../config/db');

// Attach an `images` array (gallery, falling back to the single cover image) to each menu item
const attachGalleryImages = async (items) => {
    if (items.length === 0) return;
    const itemIds = items.map(item => item.id);
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
    items.forEach(item => {
        item.images = galleryByItem[item.id] || (item.image_url ? [item.image_url] : []);
    });
};

// GET - Customer Dashboard
const getDashboard = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Recent orders
        const [recentOrders] = await db.execute(
            `SELECT o.*, v.shop_name FROM orders o
             JOIN vendors v ON o.vendor_id = v.id
             WHERE o.customer_id = ?
             ORDER BY o.created_at DESC LIMIT 5`,
            [userId]
        );

        // Unread notifications count
        const [notifCount] = await db.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [userId]
        );

        // Check if TAM survey submitted
        const [tamCheck] = await db.execute(
            'SELECT id FROM tam_responses WHERE user_id = ?',
            [userId]
        );

        res.render('customer/dashboard', {
            title: 'Customer Dashboard - KWASU Food',
            recentOrders,
            unreadCount: notifCount[0].count,
            tamSubmitted: tamCheck.length > 0
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
};

// GET - Browse Vendors (with search)
const getVendors = async (req, res) => {
    try {
        const { search } = req.query;
        let query = `SELECT v.*, u.phone FROM vendors v
                     JOIN users u ON v.user_id = u.id
                     WHERE v.is_open = 1 AND u.is_active = 1`;
        let params = [];

        if (search && search.trim()) {
            query += ` AND (v.shop_name LIKE ? OR v.location LIKE ?)`;
            params.push(`%${search.trim()}%`, `%${search.trim()}%`);
        }

        query += ` ORDER BY v.shop_name`;

        const [vendors] = await db.execute(query, params);

        res.render('customer/vendors', {
            title: 'Browse Vendors - KWASU Food',
            vendors,
            search: search || ''
        });
    } catch (error) {
        console.error('Vendors error:', error);
        req.flash('error', 'Failed to load vendors');
        res.render('customer/vendors', {
            title: 'Browse Vendors - KWASU Food',
            vendors: [],
            search: req.query.search || ''
        });
    }
};
// GET - View Vendor Menu
const getMenu = async (req, res) => {
    try {
        const vendorId = req.params.id;

        const [vendor] = await db.execute(
            `SELECT v.*, u.phone FROM vendors v
             JOIN users u ON v.user_id = u.id
             WHERE v.id = ?`,
            [vendorId]
        );

        if (vendor.length === 0) {
            req.flash('error', 'Vendor not found');
            return res.redirect('/customer/vendors');
        }

        const [menuItems] = await db.execute(
            `SELECT * FROM menu_items
             WHERE vendor_id = ? AND is_available = 1
             ORDER BY category, name`,
            [vendorId]
        );

        await attachGalleryImages(menuItems);

        // Group by category
        const groupedMenu = {};
        menuItems.forEach(item => {
            if (!groupedMenu[item.category]) {
                groupedMenu[item.category] = [];
            }
            groupedMenu[item.category].push(item);
        });

        res.render('customer/menu', {
            title: `${vendor[0].shop_name} - Menu`,
            vendor: vendor[0],
            groupedMenu
        });
    } catch (error) {
        console.error('Menu error:', error);
        req.flash('error', 'Failed to load menu');
        res.redirect('/customer/vendors');
    }
};

// POST - Place Order
const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { vendor_id, delivery_hostel, delivery_address, notes, cart_items } = req.body;
        const paymentMethod = req.body.payment_method === 'card' ? 'card' : 'cash';

        if (!cart_items || cart_items.length === 0) {
            req.flash('error', 'Your cart is empty');
            return res.redirect(`/customer/menu/${vendor_id}`);
        }

        // Calculate total
        let totalAmount = 0;
        const items = JSON.parse(cart_items);

        for (const item of items) {
            const [menuItem] = await db.execute(
                'SELECT price FROM menu_items WHERE id = ? AND is_available = 1',
                [item.id]
            );
            if (menuItem.length > 0) {
                totalAmount += menuItem[0].price * item.quantity;
            }
        }

        // Create order
        const [orderResult] = await db.execute(
            `INSERT INTO orders (customer_id, vendor_id, delivery_hostel, delivery_address, total_amount, notes, payment_method)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, vendor_id, delivery_hostel, delivery_address || null, totalAmount, notes || null, paymentMethod]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of items) {
            const [menuItem] = await db.execute(
                'SELECT price FROM menu_items WHERE id = ?',
                [item.id]
            );
            if (menuItem.length > 0) {
                await db.execute(
                    `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
                     VALUES (?, ?, ?, ?)`,
                    [orderId, item.id, item.quantity, menuItem[0].price]
                );
            }
        }

        // Notify vendor
        await db.execute(
            `INSERT INTO notifications (user_id, message)
             SELECT user_id, ? FROM vendors WHERE id = ?`,
            [`New order #${orderId} received!`, vendor_id]
        );

        if (paymentMethod === 'card') {
            req.flash('success', 'Order created! Complete payment to confirm it.');
            return res.redirect(`/customer/payment/${orderId}`);
        }

        req.flash('success', 'Order placed successfully!');
        res.redirect(`/customer/orders/${orderId}`);
    } catch (error) {
        console.error('Place order error:', error);
        req.flash('error', 'Failed to place order');
        res.redirect('/customer/vendors');
    }
};

// GET - Demo Payment Page (no real gateway - for project demo purposes only)
const getPaymentPage = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.orderId;

        const [orders] = await db.execute(
            `SELECT o.*, v.shop_name FROM orders o
             JOIN vendors v ON o.vendor_id = v.id
             WHERE o.id = ? AND o.customer_id = ?`,
            [orderId, userId]
        );

        if (orders.length === 0) {
            req.flash('error', 'Order not found');
            return res.redirect('/customer/orders');
        }

        if (orders[0].payment_status === 'paid') {
            req.flash('success', 'This order has already been paid for');
            return res.redirect(`/customer/orders/${orderId}`);
        }

        res.render('customer/payment', {
            title: `Pay for Order #${orderId} - KWASU Food`,
            order: orders[0]
        });
    } catch (error) {
        console.error('Payment page error:', error);
        req.flash('error', 'Failed to load payment page');
        res.redirect('/customer/orders');
    }
};

// POST - Confirm Demo Payment (simulated - marks the order paid, no real money moves)
const confirmPayment = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.orderId;

        const [orders] = await db.execute(
            'SELECT id, payment_status FROM orders WHERE id = ? AND customer_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            req.flash('error', 'Order not found');
            return res.redirect('/customer/orders');
        }

        if (orders[0].payment_status === 'paid') {
            req.flash('success', 'This order has already been paid for');
            return res.redirect(`/customer/orders/${orderId}`);
        }

        const reference = `DEMO-${orderId}-${Date.now()}`;
        await db.execute(
            `UPDATE orders SET payment_status = 'paid', payment_reference = ? WHERE id = ?`,
            [reference, orderId]
        );

        req.flash('success', 'Payment successful! Your order is confirmed.');
        res.redirect(`/customer/orders/${orderId}`);
    } catch (error) {
        console.error('Confirm payment error:', error);
        req.flash('error', 'Payment failed. Please try again.');
        res.redirect(`/customer/payment/${req.params.orderId}`);
    }
};

// GET - All Orders
const getOrders = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [orders] = await db.execute(
            `SELECT o.*, v.shop_name FROM orders o
             JOIN vendors v ON o.vendor_id = v.id
             WHERE o.customer_id = ?
             ORDER BY o.created_at DESC`,
            [userId]
        );

        res.render('customer/orders', {
            title: 'My Orders - KWASU Food',
            orders
        });
    } catch (error) {
        console.error('Orders error:', error);
        req.flash('error', 'Failed to load orders');
        res.redirect('/customer/dashboard');
    }
};

// GET - Order Detail
const getOrderDetail = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;

        const [orders] = await db.execute(
            `SELECT o.*, v.shop_name, v.location, u.phone as vendor_phone
             FROM orders o
             JOIN vendors v ON o.vendor_id = v.id
             JOIN users u ON v.user_id = u.id
             WHERE o.id = ? AND o.customer_id = ?`,
            [orderId, userId]
        );

        if (orders.length === 0) {
            req.flash('error', 'Order not found');
            return res.redirect('/customer/orders');
        }

        const [orderItems] = await db.execute(
            `SELECT oi.*, mi.name FROM order_items oi
             JOIN menu_items mi ON oi.menu_item_id = mi.id
             WHERE oi.order_id = ?`,
            [orderId]
        );

        res.render('customer/order-detail', {
            title: `Order #${orderId} - KWASU Food`,
            order: orders[0],
            orderItems
        });
    } catch (error) {
        console.error('Order detail error:', error);
        req.flash('error', 'Failed to load order details');
        res.redirect('/customer/orders');
    }
};

// GET - Order Status (AJAX polling)
const getOrderStatus = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;

        const [orders] = await db.execute(
            'SELECT status, updated_at FROM orders WHERE id = ? AND customer_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.json({ error: 'Order not found' });
        }

        res.json({
            status: orders[0].status,
            updated_at: orders[0].updated_at
        });
    } catch (error) {
        console.error('Order status error:', error);
        res.json({ error: 'Failed to fetch status' });
    }
};

// GET - TAM Survey
const getTamSurvey = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [tamCheck] = await db.execute(
            'SELECT id FROM tam_responses WHERE user_id = ?',
            [userId]
        );

        if (tamCheck.length > 0) {
            req.flash('error', 'You have already submitted the TAM survey');
            return res.redirect('/customer/dashboard');
        }

        res.render('customer/tam-survey', {
            title: 'TAM Survey - KWASU Food'
        });
    } catch (error) {
        console.error('TAM survey error:', error);
        req.flash('error', 'Failed to load survey');
        res.redirect('/customer/dashboard');
    }
};

// POST - Submit TAM Survey
const postTamSurvey = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { pu1, pu2, pu3, pu4, peou1, peou2, peou3, peou4, bi1, bi2, bi3 } = req.body;

        // Validate all fields are present
        const allFields = [pu1, pu2, pu3, pu4, peou1, peou2, peou3, peou4, bi1, bi2, bi3];
        if (allFields.some(f => f === undefined || f === null || f === '')) {
            req.flash('error', 'Please answer all questions before submitting.');
            return res.redirect('/customer/tam-survey');
        }

        // Parse all values as integers
        const values = allFields.map(v => parseInt(v, 10));
        if (values.some(v => isNaN(v) || v < 1 || v > 5)) {
            req.flash('error', 'Invalid response values. Please use the 1-5 scale.');
            return res.redirect('/customer/tam-survey');
        }

        // Check if already submitted
        const [tamCheck] = await db.execute(
            'SELECT id FROM tam_responses WHERE user_id = ?',
            [userId]
        );

        if (tamCheck.length > 0) {
            req.flash('error', 'You have already submitted the TAM survey');
            return res.redirect('/customer/dashboard');
        }

        const [pu1v, pu2v, pu3v, pu4v, peou1v, peou2v, peou3v, peou4v, bi1v, bi2v, bi3v] = values;

        await db.execute(
            `INSERT INTO tam_responses
             (user_id, pu1, pu2, pu3, pu4, peou1, peou2, peou3, peou4, bi1, bi2, bi3)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, pu1v, pu2v, pu3v, pu4v, peou1v, peou2v, peou3v, peou4v, bi1v, bi2v, bi3v]
        );

        req.flash('success', 'Thank you! Your feedback has been recorded.');
        res.redirect('/customer/dashboard');
    } catch (error) {
        console.error('TAM submit error:', error);
        req.flash('error', 'Failed to submit survey: ' + error.message);
        res.redirect('/customer/tam-survey');
    }
};


// GET - Search Foods Across All Vendors
const searchFoods = async (req, res) => {
    try {
        const { q } = req.query;
        const trimmed = (q || '').trim();

        let results;
        if (!trimmed) {
            // No query yet - show every available food across all open vendors
            [results] = await db.execute(
                `SELECT m.*, v.shop_name, v.id as vendor_id, v.location
                 FROM menu_items m
                 JOIN vendors v ON m.vendor_id = v.id
                 WHERE m.is_available = 1 AND v.is_open = 1
                 ORDER BY v.shop_name, m.name`
            );
        } else {
            const searchTerm = `%${trimmed}%`;
            [results] = await db.execute(
                `SELECT m.*, v.shop_name, v.id as vendor_id, v.location
                 FROM menu_items m
                 JOIN vendors v ON m.vendor_id = v.id
                 WHERE m.is_available = 1 AND v.is_open = 1
                 AND (m.name LIKE ? OR m.description LIKE ? OR m.category LIKE ?)
                 ORDER BY v.shop_name, m.name`,
                [searchTerm, searchTerm, searchTerm]
            );
        }

        await attachGalleryImages(results);

        res.render('customer/search', {
            title: trimmed ? `Search: ${q} - KWASU Food` : 'Search Foods - KWASU Food',
            results,
            query: q || ''
        });
    } catch (error) {
        console.error('Search foods error:', error);
        req.flash('error', 'Search failed');
        res.redirect('/customer/vendors');
    }
};


module.exports = {
    getDashboard,
    getVendors,
    getMenu,
    placeOrder,
    getPaymentPage,
    confirmPayment,
    getOrders,
    getOrderDetail,
    getOrderStatus,
    getTamSurvey,
    postTamSurvey,
    searchFoods
};