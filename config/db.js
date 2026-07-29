/**
 * Database Configuration
 * MySQL connection pool using mysql2
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,  
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kwasu_food',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection, then make sure tables added after initial setup exist
// (schema.sql is not re-run automatically against deployed databases)
pool.getConnection()
    .then(async (connection) => {
        console.log('\u2705 Database connected successfully');
        connection.release();
        try {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS menu_item_images (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    menu_item_id INT NOT NULL,
                    image_url VARCHAR(255) NOT NULL,
                    position TINYINT NOT NULL DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
                )
            `);
        } catch (err) {
            console.error('\u274C Failed to ensure menu_item_images table exists:', err.message);
        }
    })
    .catch(err => {
        console.error('\u274C Database connection failed:', err.message);
    });

module.exports = pool;
