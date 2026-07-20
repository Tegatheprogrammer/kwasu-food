/**
 * Database Configuration
 * MySQL connection pool using mysql2
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kwasu_food',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('\u2705 Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('\u274C Database connection failed:', err.message);
    });

module.exports = pool;
