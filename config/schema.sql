-- KWASU Food Ordering System - Database Schema
-- Database: kwasu_food

CREATE DATABASE IF NOT EXISTS kwasu_food CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kwasu_food;

-- Users table (all roles: customer, vendor, rider, admin)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'vendor', 'rider', 'admin') NOT NULL DEFAULT 'customer',
    matric_number VARCHAR(20) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    hostel VARCHAR(50) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vendors table (extra info for vendor role)
CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shop_name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    is_open TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url MEDIUMTEXT DEFAULT NULL,
    is_available TINYINT(1) NOT NULL DEFAULT 1,
    stock_status ENUM('in_stock','almost_sold','sold_out','restocked') DEFAULT 'in_stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Extra photos per menu item (up to 5 total, including the cover image above)
CREATE TABLE IF NOT EXISTS menu_item_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id INT NOT NULL,
    image_url MEDIUMTEXT NOT NULL,
    position TINYINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vendor_id INT NOT NULL,
    rider_id INT DEFAULT NULL,
    delivery_hostel VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('pending', 'received', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    rider_offer_status ENUM('pending','accepted','rejected') DEFAULT NULL,
    payment_method ENUM('cash','card') NOT NULL DEFAULT 'cash',
    payment_status ENUM('unpaid','paid') NOT NULL DEFAULT 'unpaid',
    payment_reference VARCHAR(100) DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (rider_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TAM Survey Responses table
CREATE TABLE IF NOT EXISTS tam_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    pu1 INT NOT NULL,
    pu2 INT NOT NULL,
    pu3 INT NOT NULL,
    pu4 INT NOT NULL,
    peou1 INT NOT NULL,
    peou2 INT NOT NULL,
    peou3 INT NOT NULL,
    peou4 INT NOT NULL,
    bi1 INT NOT NULL,
    bi2 INT NOT NULL,
    bi3 INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rider offers table (vendor selects rider, rider accepts/rejects)
CREATE TABLE IF NOT EXISTS rider_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    rider_id INT NOT NULL,
    vendor_id INT NOT NULL,
    delivery_fee DECIMAL(10,2) NOT NULL,
    status ENUM('pending','accepted','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (rider_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);



-- Insert default admin user (password: admin123 - change in production)
-- Password is hashed with bcrypt: admin123
INSERT INTO users (full_name, email, password, role, is_active) VALUES
('System Administrator', 'admin@kwasu.edu.ng', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1);
