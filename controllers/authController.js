/**
 * Auth Controller
 * Handles user registration, login, and logout
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// GET - Login page
const getLogin = (req, res) => {
    res.render('auth/login', { title: 'Login - KWASU Food' });
};

// POST - Login
const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            req.flash('error', 'Please enter both email and password');
            return res.redirect('/login');
        }

        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        const user = users[0];

        if (!user.is_active) {
            req.flash('error', 'Your account has been deactivated. Contact admin.');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        // Set session
        req.session.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            matric_number: user.matric_number,
            hostel: user.hostel
        };

        req.flash('success', `Welcome back, ${user.full_name}!`);

        // Redirect based on role
        if (user.role === 'customer') return res.redirect('/customer/dashboard');
        if (user.role === 'vendor') return res.redirect('/vendor/dashboard');
        if (user.role === 'rider') return res.redirect('/rider/dashboard');
        if (user.role === 'admin') return res.redirect('/admin/dashboard');

        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/login');
    }
};

// GET - Register page
const getRegister = (req, res) => {
    res.render('auth/register', { title: 'Register - KWASU Food' });
};

// POST - Register
const postRegister = async (req, res) => {
    try {
        const {
            full_name, email, password, confirm_password,
            role, matric_number, phone, hostel, shop_name, location
        } = req.body;

        // Validation
        if (!full_name || !email || !password || !confirm_password || !role) {
            req.flash('error', 'Please fill in all required fields');
            return res.redirect('/register');
        }

        if (password !== confirm_password) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/register');
        }

        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters');
            return res.redirect('/register');
        }

        // Check if email exists
        const [existing] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            req.flash('error', 'Email already registered');
            return res.redirect('/register');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.execute(
            `INSERT INTO users (full_name, email, password, role, matric_number, phone, hostel)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [full_name, email, hashedPassword, role, matric_number || null, phone || null, hostel || null]
        );

        const userId = result.insertId;

        // If vendor, create vendor record
        if (role === 'vendor') {
            await db.execute(
                `INSERT INTO vendors (user_id, shop_name, location)
                 VALUES (?, ?, ?)`,
                [userId, shop_name || full_name + "'s Shop", location || 'KWASU Campus']
            );
        }

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'An error occurred during registration');
        res.redirect('/register');
    }
};

// GET - Logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
};

module.exports = {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    logout
};
