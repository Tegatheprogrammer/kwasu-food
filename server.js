/**
 * KWASU Food Ordering System
 * Main Server Entry Point
 */
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'kwasu_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages
app.use(flash());

// Global variables for views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.info_msg = req.flash('info');
    res.locals.user = req.session.user || null;
    next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/auth'));
app.use('/customer', require('./routes/customer'));
app.use('/vendor', require('./routes/vendor'));
app.use('/rider', require('./routes/rider'));
app.use('/admin', require('./routes/admin'));

// Home redirect based on auth status
app.get('/', (req, res) => {
    if (req.session.user) {
        const role = req.session.user.role;
        if (role === 'customer') return res.redirect('/customer/dashboard');
        if (role === 'vendor') return res.redirect('/vendor/dashboard');
        if (role === 'rider') return res.redirect('/rider/dashboard');
        if (role === 'admin') return res.redirect('/admin/dashboard');
    }
    res.redirect('/login');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('404', { title: 'Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`\uD83C\uDF5C KWASU Food Ordering System running on http://localhost:${PORT}`);
});
