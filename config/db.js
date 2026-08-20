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
    queueLimit: 0,
    // Helps avoid idle pooled connections getting silently dropped by the
    // database host or a network proxy in between (a common cause of
    // "Connection lost: The server closed the connection")
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Add a column to a table if it doesn't already exist (works across MySQL/MariaDB
// versions that don't all support "ADD COLUMN IF NOT EXISTS")
const ensureColumn = async (table, column, definition) => {
    const [rows] = await pool.execute(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    if (rows.length === 0) {
        await pool.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
};

// Widen a column to the given type if it isn't already at least that large
// (e.g. VARCHAR(255) -> MEDIUMTEXT, needed once image_url started storing base64 data)
const ensureColumnType = async (table, column, dataType, definition) => {
    const [rows] = await pool.execute(
        `SELECT DATA_TYPE FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    if (rows.length > 0 && rows[0].DATA_TYPE.toLowerCase() !== dataType.toLowerCase()) {
        await pool.execute(`ALTER TABLE ${table} MODIFY COLUMN ${column} ${definition}`);
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Connect and run the one-time schema migrations, retrying with backoff.
// This matters because the app can start up faster than a sleeping/restarting
// database host wakes up (e.g. a free-tier DB), so the very first connection
// attempt can fail with "Connection lost" even though the DB is fine seconds
// later. Without a retry here, that race would silently skip these
// migrations for the entire lifetime of the process.
const connectWithRetry = async (attempt = 1, maxAttempts = 6) => {
    try {
        const connection = await pool.getConnection();
        console.log('\u2705 Database connected successfully');
        connection.release();

        try {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS menu_item_images (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    menu_item_id INT NOT NULL,
                    image_url MEDIUMTEXT NOT NULL,
                    position TINYINT NOT NULL DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
                )
            `);
        } catch (err) {
            console.error('\u274C Failed to ensure menu_item_images table exists:', err.message);
        }

        try {
            await ensureColumn('orders', 'payment_method', "ENUM('cash','card') NOT NULL DEFAULT 'cash'");
            await ensureColumn('orders', 'payment_status', "ENUM('unpaid','paid') NOT NULL DEFAULT 'unpaid'");
            await ensureColumn('orders', 'payment_reference', 'VARCHAR(100) DEFAULT NULL');
        } catch (err) {
            console.error('\u274C Failed to ensure payment columns exist on orders:', err.message);
        }

        try {
            // Images are now stored as base64 data URIs directly in the DB (Render's
            // filesystem is ephemeral, so files written to disk got wiped on every
            // redeploy while the DB kept pointing at them - hence "images not showing")
            await ensureColumnType('menu_items', 'image_url', 'mediumtext', 'MEDIUMTEXT DEFAULT NULL');
            await ensureColumnType('menu_item_images', 'image_url', 'mediumtext', 'MEDIUMTEXT NOT NULL');
        } catch (err) {
            console.error('\u274C Failed to widen image_url columns:', err.message);
        }
    } catch (err) {
        console.error(`\u274C Database connection failed (attempt ${attempt}/${maxAttempts}):`, err.message);
        if (attempt < maxAttempts) {
            const delayMs = Math.min(2000 * attempt, 10000);
            await sleep(delayMs);
            return connectWithRetry(attempt + 1, maxAttempts);
        }
        console.error('\u274C Giving up on the startup DB connection after repeated failures. Individual requests will still retry their own connections once the database is reachable.');
    }
};

connectWithRetry();

module.exports = pool;
