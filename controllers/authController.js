/**
 * Auth Controller
 * Handles user registration, login, logout, and password reset
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { sendResetEmail } = require('../config/mailer');

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

        req.session.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            matric_number: user.matric_number,
            hostel: user.hostel
        };

        req.flash('success', `Welcome back, ${user.full_name}!`);

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

        const [existing] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            req.flash('error', 'Email already registered');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            `INSERT INTO users (full_name, email, password, role, matric_number, phone, hostel)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [full_name, email, hashedPassword, role, matric_number || null, phone || null, hostel || null]
        );

        const userId = result.insertId;

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

// ==================== FORGOT PASSWORD (PRODUCTION) ====================

// GET - Forgot Password page
const getForgotPassword = (req, res) => {
    res.render('auth/forgot-password', { title: 'Forgot Password - KWASU Food' });
};

// POST - Forgot Password (send email with reset link)
// POST - Forgot Password (send email with reset link)
const postForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            req.flash('error', 'Please enter your email address');
            return res.redirect('/forgot-password');
        }

        const [users] = await db.execute(
            'SELECT id, email, full_name FROM users WHERE email = ?',
            [email]
        );

        // Don't reveal if email exists (security best practice)
        if (users.length === 0) {
            req.flash('success', 'If an account exists with that email, a password reset link has been sent.');
            return res.redirect('/login');
        }

        // Generate secure token
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // Delete any existing unused tokens for this user
        await db.execute(
            'DELETE FROM password_resets WHERE user_id = ? AND used = 0',
            [users[0].id]
        );

        // Store new token
        await db.execute(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
            [users[0].id, token, expiresAt]
        );

        // Build reset URL (uses APP_URL from env, falls back to localhost)
        const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
        const resetUrl = `${appUrl}/reset-password?token=${token}`;

        // Send email
        let emailSent = false;
        try {
            await sendResetEmail(email, resetUrl);
            emailSent = true;
            req.flash('success', 'A password reset link has been sent to your email. Please check your inbox (and spam folder).');
        } catch (emailError) {
            console.error('Email send failed:', emailError.message);
            // Store token in session for display on login page
            req.flash('info', `Reset link (copy if email fails): ${resetUrl}`);
            req.flash('success', 'Password reset processed. If email delivery fails, use the link shown below.');
        }

        res.redirect('/login');
    } catch (error) {
        console.error('Forgot password error:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/forgot-password');
    }
};

// GET - Reset Password page
const getResetPassword = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            req.flash('error', 'Invalid or expired reset link');
            return res.redirect('/login');
        }

        const [resets] = await db.execute(
            'SELECT user_id, expires_at, used FROM password_resets WHERE token = ?',
            [token]
        );

        if (resets.length === 0) {
            req.flash('error', 'Invalid or expired reset link');
            return res.redirect('/login');
        }

        if (resets[0].used === 1) {
            req.flash('error', 'This reset link has already been used');
            return res.redirect('/login');
        }

        if (new Date(resets[0].expires_at) < new Date()) {
            req.flash('error', 'This reset link has expired');
            return res.redirect('/login');
        }

        res.render('auth/reset-password', {
            title: 'Reset Password - KWASU Food',
            token: token
        });
    } catch (error) {
        console.error('Reset password page error:', error);
        req.flash('error', 'An error occurred');
        res.redirect('/login');
    }
};

// POST - Reset Password (update password)
const postResetPassword = async (req, res) => {
    try {
        const { token, password, confirm_password } = req.body;

        if (!password || !confirm_password) {
            req.flash('error', 'Please fill in all fields');
            return res.redirect(`/reset-password?token=${token}`);
        }

        if (password !== confirm_password) {
            req.flash('error', 'Passwords do not match');
            return res.redirect(`/reset-password?token=${token}`);
        }

        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters');
            return res.redirect(`/reset-password?token=${token}`);
        }

        const [resets] = await db.execute(
            'SELECT user_id, expires_at, used FROM password_resets WHERE token = ?',
            [token]
        );

        if (resets.length === 0 || resets[0].used === 1) {
            req.flash('error', 'Invalid or expired reset link');
            return res.redirect('/login');
        }

        if (new Date(resets[0].expires_at) < new Date()) {
            req.flash('error', 'This reset link has expired');
            return res.redirect('/login');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, resets[0].user_id]
        );

        // Mark token as used
        await db.execute(
            'UPDATE password_resets SET used = 1 WHERE token = ?',
            [token]
        );

        req.flash('success', 'Password reset successful! Please log in with your new password.');
        res.redirect('/login');
    } catch (error) {
        console.error('Reset password error:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/login');
    }
};

module.exports = {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    logout,
    getForgotPassword,
    postForgotPassword,
    getResetPassword,
    postResetPassword
};