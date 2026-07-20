/**
 * Authentication & Authorization Middleware
 * Protects routes based on user roles
 */

// Check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error', 'Please log in to access this page');
    res.redirect('/login');
};

// Check if user is a customer
const isCustomer = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'customer') {
        return next();
    }
    req.flash('error', 'Access denied. Customer account required.');
    res.redirect('/');
};

// Check if user is a vendor
const isVendor = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'vendor') {
        return next();
    }
    req.flash('error', 'Access denied. Vendor account required.');
    res.redirect('/');
};

// Check if user is a rider
const isRider = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'rider') {
        return next();
    }
    req.flash('error', 'Access denied. Rider account required.');
    res.redirect('/');
};

// Check if user is an admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'Access denied. Admin account required.');
    res.redirect('/');
};

// Redirect if already logged in
const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        const role = req.session.user.role;
        if (role === 'customer') return res.redirect('/customer/dashboard');
        if (role === 'vendor') return res.redirect('/vendor/dashboard');
        if (role === 'rider') return res.redirect('/rider/dashboard');
        if (role === 'admin') return res.redirect('/admin/dashboard');
    }
    next();
};

module.exports = {
    isAuthenticated,
    isCustomer,
    isVendor,
    isRider,
    isAdmin,
    redirectIfAuthenticated
};
