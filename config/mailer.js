/**
 * Email Configuration using Nodemailer
 * For production: Use Gmail App Password or a service like SendGrid
 */
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,      // your Gmail address
        pass: process.env.EMAIL_PASS       // Gmail App Password (NOT your regular password)
    }
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.log(' Email service not configured:', error.message);
    } else {
        console.log(' Email service ready');
    }
});

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetUrl - Password reset URL with token
 */
const sendResetEmail = async (to, resetUrl) => {
    const mailOptions = {
        from: `"KWASU Food Support" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Password Reset - KWASU Food Ordering System',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #0D1B4B;">KWASU Food Ordering System</h2>
                <p>Hello,</p>
                <p>You requested a password reset for your account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0;">Reset Password</a>
                <p>Or copy and paste this link:</p>
                <p style="word-break: break-all; color: #2563EB;">${resetUrl}</p>
                <p style="color: #64748b; font-size: 0.9rem;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="color: #64748b; font-size: 0.85rem;">KWASU Food Ordering System, Malete, Nigeria</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };