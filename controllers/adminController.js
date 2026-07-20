/**
 * Admin Controller
 * Handles admin dashboard and user management
 */
const db = require('../config/db');

// GET - Admin Dashboard
const getDashboard = async (req, res) => {
    try {
        // Total users
        const [usersCount] = await db.execute(
            'SELECT COUNT(*) as count FROM users'
        );

        // Total orders
        const [ordersCount] = await db.execute(
            'SELECT COUNT(*) as count FROM orders'
        );

        // Total revenue
        const [revenue] = await db.execute(
            `SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'delivered'`
        );

        // Recent orders
        const [recentOrders] = await db.execute(
            `SELECT o.*, u.full_name as customer_name, v.shop_name
             FROM orders o
             JOIN users u ON o.customer_id = u.id
             JOIN vendors v ON o.vendor_id = v.id
             ORDER BY o.created_at DESC LIMIT 10`
        );

        // Users by role
        const [usersByRole] = await db.execute(
            `SELECT role, COUNT(*) as count FROM users GROUP BY role`
        );

        res.render('admin/dashboard', {
            title: 'Admin Dashboard - KWASU Food',
            totalUsers: usersCount[0].count,
            totalOrders: ordersCount[0].count,
            totalRevenue: revenue[0].total,
            recentOrders,
            usersByRole
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/');
    }
};

// GET - Manage Users
const getUsers = async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT id, full_name, email, role, matric_number, phone, hostel, is_active, created_at
             FROM users
             ORDER BY created_at DESC`
        );

        res.render('admin/users', {
            title: 'Manage Users - KWASU Food',
            users
        });
    } catch (error) {
        console.error('Users error:', error);
        req.flash('error', 'Failed to load users');
        res.redirect('/admin/dashboard');
    }
};

// POST - Toggle User Status
const toggleUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const [users] = await db.execute(
            'SELECT is_active FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }

        const newStatus = users[0].is_active ? 0 : 1;

        await db.execute(
            'UPDATE users SET is_active = ? WHERE id = ?',
            [newStatus, userId]
        );

        req.flash('success', `User ${newStatus ? 'activated' : 'deactivated'} successfully`);
        res.redirect('/admin/users');
    } catch (error) {
        console.error('Toggle user error:', error);
        req.flash('error', 'Failed to update user status');
        res.redirect('/admin/users');
    }
};

// GET - TAM Results
const getTamResults = async (req, res) => {
    try {
        const [responses] = await db.execute(
            `SELECT t.*, u.full_name, u.email, u.matric_number
             FROM tam_responses t
             JOIN users u ON t.user_id = u.id
             ORDER BY t.submitted_at DESC`
        );

        // Calculate averages
        const [averages] = await db.execute(
            `SELECT
                ROUND(AVG(pu1), 2) as avg_pu1,
                ROUND(AVG(pu2), 2) as avg_pu2,
                ROUND(AVG(pu3), 2) as avg_pu3,
                ROUND(AVG(pu4), 2) as avg_pu4,
                ROUND(AVG(peou1), 2) as avg_peou1,
                ROUND(AVG(peou2), 2) as avg_peou2,
                ROUND(AVG(peou3), 2) as avg_peou3,
                ROUND(AVG(peou4), 2) as avg_peou4,
                ROUND(AVG(bi1), 2) as avg_bi1,
                ROUND(AVG(bi2), 2) as avg_bi2,
                ROUND(AVG(bi3), 2) as avg_bi3,
                ROUND(AVG((pu1+pu2+pu3+pu4)/4), 2) as overall_pu,
                ROUND(AVG((peou1+peou2+peou3+peou4)/4), 2) as overall_peou,
                ROUND(AVG((bi1+bi2+bi3)/3), 2) as overall_bi
             FROM tam_responses`
        );

        res.render('admin/tam-results', {
            title: 'TAM Results - KWASU Food',
            responses,
            averages: averages[0]
        });
    } catch (error) {
        console.error('TAM results error:', error);
        req.flash('error', 'Failed to load TAM results');
        res.redirect('/admin/dashboard');
    }
};

module.exports = {
    getDashboard,
    getUsers,
    toggleUser,
    getTamResults
};
