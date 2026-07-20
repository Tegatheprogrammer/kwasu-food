# KWASU FOOD ORDERING SYSTEM
## Complete Beginner's Guide
### For Final Year Computer Science Project Defense

---

## TABLE OF CONTENTS

1. What is this project?
2. What problem does it solve?
3. How the system works (Simple Explanation)
4. The 4 User Roles Explained
5. Technologies Used (Explained Simply)
6. Database Tables Explained
7. How Data Flows Through the System
8. Features Breakdown by Role
9. The TAM Survey Explained
10. How to Run the Project
11. How to Deploy to Vercel
12. Common Errors & Fixes
13. Questions Your Supervisor Might Ask

---

## 1. WHAT IS THIS PROJECT?

**KWASU Food Ordering System** is a web application (website) that allows students at Kwara State University (KWASU) to order food from campus vendors online, instead of walking to the vendor's shop.

Think of it like **Jumia Food** or **Uber Eats**, but specifically built for KWASU campus.

### What can people do on this website?
- Students (Customers) can browse food vendors, add items to a cart, and place orders
- Vendors (Food sellers) can manage their menu and see incoming orders
- Riders (Dispatch riders) can pick up ready orders and deliver them to hostels
- Admin can manage all users and view survey results

---

## 2. WHAT PROBLEM DOES IT SOLVE?

### The Problem Before This System:
1. Students had to physically walk to food vendors to order
2. Vendors had no way to track orders digitally
3. During rush hours (lunch time), there were long queues
4. No record of transactions or order history
5. No way for students to know if a vendor was open or closed
6. No delivery system -- students had to pick up food themselves

### How This System Solves It:
1. Students can order from their hostel using their phone/laptop
2. Vendors see orders instantly on their dashboard
3. No more queues -- orders are processed in sequence
4. Complete order history for both students and vendors
5. Vendors can toggle their shop open/closed status
6. Riders deliver food directly to hostels

---

## 3. HOW THE SYSTEM WORKS (SIMPLE EXPLANATION)

Imagine the system as a **restaurant with 4 different counters**:

```
                    +-----------------+
                    |   THE WEBSITE   |
                    |  (kwasu-food)   |
                    +--------+--------+
                             |
        +--------------------+--------------------+
        |                    |                    |
   +----v----+        +----v----+        +----v----+
   | CUSTOMER|        | VENDOR  |        |  RIDER  |
   | Counter |        | Counter |        | Counter |
   +----+----+        +----+----+        +----+----+
        |                    |                    |
        |  1. Browse Menu    |  2. See Orders     |  3. Pick Up
        |  2. Add to Cart    |  3. Prepare Food   |  4. Deliver
        |  3. Place Order    |  4. Mark Ready     |  5. Mark Delivered
        |  4. Track Order    |                    |
        |                    |                    |
        +--------------------+--------------------+
                             |
                    +--------v--------+
                    |      ADMIN      |
                    |   (Manages      |
                    |    Everything)  |
                    +-----------------+
```

### The Order Flow (Step by Step):

```
STEP 1: Customer places order
        v
STEP 2: Vendor receives notification and sees the order
        v
STEP 3: Vendor marks order as 'received' -> 'preparing' -> 'ready'
        v
STEP 4: Rider sees the order is 'ready' and accepts it
        v
STEP 5: Rider picks up food and marks 'out for delivery'
        v
STEP 6: Rider delivers to hostel and marks 'delivered'
        v
STEP 7: Customer gets notification that food has arrived!
```

---

## 4. THE 4 USER ROLES EXPLAINED

### ROLE 1: CUSTOMER (Student)
**Who:** Regular students living in hostels who want to order food

**What they can do:**
- Register with their matric number and hostel name
- See a list of all open vendors (with shop cards)
- Click on a vendor to see their menu (grouped by category like 'Rice', 'Swallow', 'Snacks')
- Add food items to a shopping cart (stored in browser, no page reload)
- Place an order with delivery details (hostel name, room number, special notes)
- Track order status in real-time (page refreshes every 10 seconds automatically)
- View all past orders with colored status badges
- Fill out the TAM survey (Technology Acceptance Model) -- only once

**Real-life example:**
> John is in A Block hostel. He opens the website, sees 'Mama Put' is open, clicks it, sees Jollof Rice for N500, adds 2 plates to cart, enters 'A Block, Room 12' as delivery address, and places the order. He can then watch his order go from 'pending' -> 'received' -> 'preparing' -> 'ready' -> 'out for delivery' -> 'delivered' without refreshing the page.

---

### ROLE 2: VENDOR (Food Seller)
**Who:** People who sell food on campus (like Mama Put, Bukka, etc.)

**What they can do:**
- Register with their shop name and location
- Open or close their shop (toggle button)
- Add menu items (name, description, price, category)
- Edit or delete menu items
- Toggle items as available/unavailable
- See all incoming orders (auto-refreshes every 15 seconds)
- Update order status: pending -> received -> preparing -> ready
- See today's revenue and pending orders count on dashboard

**Real-life example:**
> Mama Put logs in and sees she has 3 pending orders. She clicks 'Mark Received' on order #15, starts cooking, then clicks 'Mark Preparing', finishes cooking, then clicks 'Mark Ready'. A rider will then see this order and pick it up.

---

### ROLE 3: RIDER (Dispatch Rider)
**Who:** People who deliver food from vendors to student hostels

**What they can do:**
- See all orders marked as 'ready' that need delivery
- Accept a delivery (assigns it to themselves)
- Mark order as 'out for delivery' (when they pick it up)
- Mark order as 'delivered' (when they reach the hostel)
- See their active deliveries and completed count for the day

**Real-life example:**
> Musa the rider logs in, sees 2 orders ready for pickup from Mama Put. He clicks 'Accept Delivery' on order #15, goes to Mama Put's shop, picks up the food, clicks 'Out for Delivery', rides to A Block, hands the food to John, clicks 'Delivered'.

---

### ROLE 4: ADMIN (System Manager)
**Who:** The person managing the entire platform

**What they can do:**
- See total statistics: number of users, total orders, total revenue
- See breakdown of users by role (how many customers, vendors, riders)
- View all recent orders
- Activate or deactivate any user account
- View TAM survey results with calculated averages

**Real-life example:**
> The admin logs in and sees: 150 users, 45 orders today, N125,000 total revenue. They notice a vendor has been reported for bad behavior, so they click 'Deactivate' on that vendor's account.

---

## 5. TECHNOLOGIES USED (EXPLAINED SIMPLY)

Think of building a website like building a house. You need different materials and tools:

### The 'House' Structure:

| Technology | What It Is | Analogy |
|------------|-----------|----------|
| **Node.js** | JavaScript that runs on the server (computer) | The engine that powers the house |
| **Express** | A framework that makes Node.js easier | The blueprint/architecture of the house |
| **EJS** | A templating engine that mixes HTML with data | The interior decorator that puts furniture (data) in rooms (pages) |
| **MySQL** | A database that stores all information | The filing cabinet where all records are kept |
| **bcryptjs** | A tool that scrambles passwords for security | A safe that locks passwords so no one can read them |
| **express-session** | Remembers who is logged in | A name tag that the system gives you when you log in |
| **connect-flash** | Shows temporary messages (like 'Order placed!') | A sticky note that appears then disappears |
| **dotenv** | Loads secret settings from a hidden file | A locked drawer with the house keys |

### How They Work Together:

```
BROWSER (Student's phone/laptop)
    |
    |  Types URL: localhost:3000
    v
EXPRESS SERVER (Node.js)
    |
    |  'What page does this user want?'
    v
ROUTER (Decides which controller to use)
    |
    |  'This is a customer page, check if they're logged in'
    v
MIDDLEWARE (Auth check)
    |
    |  'Yes, they're a customer. Proceed.'
    v
CONTROLLER (Business logic)
    |
    |  'I need to get their recent orders from the database'
    v
MySQL DATABASE
    |
    |  'Here are their 5 most recent orders'
    v
CONTROLLER receives data
    |
    |  'Send this data to the view'
    v
EJS VIEW (HTML template)
    |
    |  'I'll put the order data into this HTML table'
    v
BROWSER displays the finished page
```

---

## 6. DATABASE TABLES EXPLAINED

Think of the database as a **library with 7 filing cabinets** (tables). Each cabinet stores a specific type of information:

### Table 1: users
**What it stores:** Everyone who has an account

| Column | What It Means | Example |
|--------|--------------|---------|
| `id` | Unique number for each user | 1, 2, 3... |
| `full_name` | Person's real name | 'John Doe' |
| `email` | Login email | 'john@kwasu.edu.ng' |
| `password` | Scrambled (hashed) password | '$2a$10$...' |
| `role` | What type of user | 'customer', 'vendor', 'rider', 'admin' |
| `matric_number` | Student ID (for customers) | '18/52HA001' |
| `phone` | Phone number | '08012345678' |
| `hostel` | Where they live (for customers) | 'A Block' |
| `is_active` | Is the account enabled? | 1 = yes, 0 = no |
| `created_at` | When they registered | '2026-07-20 10:30:00' |

**Why it matters:** This is the master list of everyone. When someone logs in, the system checks this table to find their email and password.

---

### Table 2: vendors
**What it stores:** Extra information for vendor accounts

| Column | What It Means | Example |
|--------|--------------|---------|
| `id` | Vendor's unique ID | 1 |
| `user_id` | Links to the users table | 5 (means user #5 is a vendor) |
| `shop_name` | Name of the food shop | 'Mama Put' |
| `description` | What they sell | 'Best jollof rice on campus' |
| `location` | Where on campus | 'Student Centre' |
| `is_open` | Are they currently open? | 1 = yes, 0 = no |

**Why it matters:** A vendor is both a 'user' (for login) AND a 'vendor' (for shop details). The `user_id` connects these two tables.

---

### Table 3: menu_items
**What it stores:** Food items that vendors sell

| Column | What It Means | Example |
|--------|--------------|---------|
| `id` | Item's unique ID | 1 |
| `vendor_id` | Which vendor sells this | 1 (Mama Put) |
| `name` | Food name | 'Jollof Rice & Chicken' |
| `description` | What's in it | 'Rice with spicy stew and grilled chicken' |
| `price` | How much it costs | 500.00 |
| `category` | Type of food | 'Rice', 'Swallow', 'Snacks' |
| `is_available` | Can customers order it? | 1 = yes, 0 = no |

**Why it matters:** When a customer clicks on a vendor, the system looks here to show all food items for that vendor.

---

### Table 4: orders
**What it stores:** Every food order placed

| Column | What It Means | Example |
|--------|--------------|---------|
| `id` | Order number | 15 |
| `customer_id` | Who ordered | 3 (John) |
| `vendor_id` | Who is cooking | 1 (Mama Put) |
| `rider_id` | Who is delivering | 7 (Musa) |
| `delivery_hostel` | Where to deliver | 'A Block' |
| `delivery_address` | Specific location | 'Room 12, Ground Floor' |
| `total_amount` | Total cost | 1000.00 |
| `status` | Current stage | 'pending', 'preparing', 'delivered' |
| `notes` | Special requests | 'No pepper please' |

**Why it matters:** This is the most important table. It tracks every order from start to finish.

---

### Table 5: order_items
**What it stores:** Individual items inside each order

| Column | What It Means | Example |
|--------|--------------|---------|
| `id` | Unique ID | 1 |
| `order_id` | Which order this belongs to | 15 |
| `menu_item_id` | Which food item | 3 (Jollof Rice) |
| `quantity` | How many plates | 2 |
| `unit_price` | Price at time of order | 500.00 |

**Why it matters:** One order can have multiple items (2 plates of rice + 1 Coke). This table stores each item separately while linking them to the main order.

---

### Table 6: notifications
**What it stores:** Messages sent to users

| Column | What It Means | Example |
|--------|--------------|---------|
| `id` | Unique ID | 1 |
| `user_id` | Who receives it | 3 (John) |
| `message` | What it says | 'Your order #15 is out for delivery!' |
| `is_read` | Has the user seen it? | 0 = no, 1 = yes |

**Why it matters:** When a vendor marks an order 'ready', the system automatically creates a notification for the customer.

---

### Table 7: tam_responses
**What it stores:** Survey answers from customers

| Column | What It Means | Example |
|--------|--------------|---------|
| `id` | Unique ID | 1 |
| `user_id` | Who answered | 3 (John) |
| `pu1` to `pu4` | Perceived Usefulness answers | 4, 5, 4, 5 |
| `peou1` to `peou4` | Perceived Ease of Use answers | 5, 4, 5, 4 |
| `bi1` to `bi3` | Behavioral Intention answers | 5, 4, 5 |

**Why it matters:** This data proves whether students actually find the system useful and easy to use -- important for your project defense!

---

## 7. HOW DATA FLOWS THROUGH THE SYSTEM

### Example: Placing an Order

```
1. CUSTOMER opens /customer/vendors
   -> Controller queries: SELECT * FROM vendors WHERE is_open = 1
   -> Database returns: Mama Put, Bukka, etc.
   -> EJS renders: Vendor cards on the page

2. CUSTOMER clicks 'View Menu' on Mama Put
   -> URL: /customer/menu/1
   -> Controller queries: SELECT * FROM menu_items WHERE vendor_id = 1
   -> Database returns: Jollof Rice N500, Fried Rice N600...
   -> EJS renders: Menu page with categories

3. CUSTOMER clicks 'Add to Cart' on Jollof Rice
   -> JavaScript saves to localStorage (browser memory)
   -> NO database call yet!
   -> Cart sidebar updates instantly

4. CUSTOMER clicks 'Place Order'
   -> JavaScript sends cart data + delivery details to server
   -> Controller calculates total: 2 x N500 = N1000
   -> INSERT INTO orders (customer_id, vendor_id, total_amount, status, ...)
   -> INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price)
   -> INSERT INTO notifications (vendor_user_id, 'New order #15 received!')
   -> Clear localStorage cart
   -> Redirect to order detail page

5. VENDOR sees new order on /vendor/orders
   -> Auto-refresh every 15 seconds checks for new orders
   -> Controller queries: SELECT * FROM orders WHERE vendor_id = 1
   -> Vendor clicks 'Mark Received'
   -> UPDATE orders SET status = 'received' WHERE id = 15
   -> INSERT INTO notifications (customer_id, 'Order #15 status: RECEIVED')
```

---

## 8. FEATURES BREAKDOWN BY ROLE

### Customer Features:
| Feature | How It Works | File(s) Involved |
|---------|-------------|------------------|
| Browse Vendors | SQL query gets open vendors | customerController.js getVendors() |
| View Menu | Groups items by category | customerController.js getMenu() |
| Add to Cart | JavaScript + localStorage | main.js addToCart() |
| Place Order | Form POST with cart JSON | customerController.js placeOrder() |
| Track Order | Fetch API polls every 10s | order-detail.ejs JavaScript |
| View Orders | SQL query by customer_id | customerController.js getOrders() |
| TAM Survey | 11 questions, 5-point scale | tam-survey.ejs, postTamSurvey() |

### Vendor Features:
| Feature | How It Works | File(s) Involved |
|---------|-------------|------------------|
| Dashboard Stats | COUNT and SUM queries | vendorController.js getDashboard() |
| Toggle Shop | UPDATE vendors SET is_open | vendorController.js toggleShop() |
| Manage Menu | CRUD operations on menu_items | vendorController.js menu functions |
| View Orders | SELECT with ORDER BY created_at DESC | vendorController.js getOrders() |
| Update Status | UPDATE orders SET status | vendorController.js updateOrderStatus() |

### Rider Features:
| Feature | How It Works | File(s) Involved |
|---------|-------------|------------------|
| Available Deliveries | SELECT WHERE status = 'ready' AND rider_id IS NULL | riderController.js getDeliveries() |
| Accept Delivery | UPDATE orders SET rider_id, status | riderController.js acceptDelivery() |
| Mark Delivered | UPDATE orders SET status = 'delivered' | riderController.js markDelivered() |

### Admin Features:
| Feature | How It Works | File(s) Involved |
|---------|-------------|------------------|
| Dashboard Stats | COUNT(*), SUM(total_amount) | adminController.js getDashboard() |
| Manage Users | SELECT all, UPDATE is_active | adminController.js getUsers(), toggleUser() |
| TAM Results | AVG() calculations per construct | adminController.js getTamResults() |

---

## 9. THE TAM SURVEY EXPLAINED

### What is TAM?
**TAM = Technology Acceptance Model**

It's a research framework that explains WHY people accept or reject new technology. For your project, it proves that students actually WANT to use your food ordering system.

### The 3 Constructs (Categories):

#### 1. Perceived Usefulness (PU) -- 4 Questions
**Definition:** Does the user believe the system will help them perform their task better?

| Question | What It Measures |
|----------|-----------------|
| PU1: 'Improves my ordering efficiency' | Is it faster than walking to the vendor? |
| PU2: 'Saves me time' | Does it reduce waiting time? |
| PU3: 'Easier to get food on campus' | Is it more convenient? |
| PU4: 'Useful for my daily needs' | Overall usefulness |

**High score (4-5)** = Students find the system useful
**Low score (1-2)** = Students don't see the point

---

#### 2. Perceived Ease of Use (PEOU) -- 4 Questions
**Definition:** Does the user believe the system is easy to learn and use?

| Question | What It Measures |
|----------|-----------------|
| PEOU1: 'Learning to use was easy' | Is the interface intuitive? |
| PEOU2: 'Easy to get system to do what I want' | Does it work as expected? |
| PEOU3: 'Clear and understandable' | Is the design confusing? |
| PEOU4: 'Overall easy to use' | General ease of use |

**High score (4-5)** = Students find it easy to use
**Low score (1-2)** = Students struggle with the interface

---

#### 3. Behavioral Intention (BI) -- 3 Questions
**Definition:** Will the user actually continue using the system in the future?

| Question | What It Measures |
|----------|-----------------|
| BI1: 'Intend to continue using' | Will they keep using it? |
| BI2: 'Would recommend to others' | Word-of-mouth potential |
| BI3: 'Plan to use frequently' | Regular usage intention |

**High score (4-5)** = Students will become regular users
**Low score (1-2)** = Students will abandon the system

---

### How Results Are Calculated:

```
PU Average = (pu1 + pu2 + pu3 + pu4) / 4
PEOU Average = (peou1 + peou2 + peou3 + peou4) / 4
BI Average = (bi1 + bi2 + bi3) / 3
```

The admin dashboard shows these averages. For a successful project, you want all averages to be **above 3.5** (on a 1-5 scale).

---

## 10. HOW TO RUN THE PROJECT

### Step-by-Step:

1. **Install Node.js**
   - Download from nodejs.org
   - Run installer, keep default settings

2. **Install XAMPP (for MySQL)**
   - Download from apachefriends.org
   - Install to C:\xampp
   - Open XAMPP Control Panel
   - Start Apache and MySQL

3. **Extract the project**
   - Unzip kwasu-food.zip to your Downloads folder

4. **Open in VS Code**
   - File -> Open Folder -> Select kwasu-food

5. **Install dependencies**
   ```
   npm install
   ```

6. **Set up the database**
   - Open browser -> http://localhost/phpmyadmin
   - Click Import -> Choose File -> Select config/schema.sql
   - Click Go

7. **Configure .env**
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=kwasu_food
   SESSION_SECRET=kwasu_food_secret_key_2026
   ```

8. **Start the server**
   ```
   npm start
   ```

9. **Open browser**
   - Go to http://localhost:3001
   - Login with: admin@kwasu.edu.ng / admin123

---

## 11. HOW TO DEPLOY TO VERCEL

### IMPORTANT: Vercel is for FRONTEND-ONLY projects

Vercel is designed for React, Vue, Angular -- websites that run entirely in the browser. **Your project has a backend (Node.js + MySQL), so Vercel is NOT the best choice.**

### Better Options for Backend Projects:

| Platform | Best For | Difficulty |
|----------|----------|------------|
| **Render** | Full-stack Node.js + MySQL | Easy |
| **Railway** | Full-stack with database | Easy |
| **Heroku** | Full-stack (paid now) | Medium |
| **AWS EC2** | Complete control | Hard |

---

### Deploying to Render (Recommended):

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m 'Initial commit'
   git push origin main
   ```

2. **Go to render.com**
   - Sign up with GitHub
   - Click 'New Web Service'
   - Connect your GitHub repo

3. **Configure Build Settings:**
   - Build Command: npm install
   - Start Command: node server.js

4. **Add Environment Variables** (in Render dashboard):
   ```
   PORT=10000
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=kwasu_food
   SESSION_SECRET=your_secret_key
   ```

5. **For MySQL on Render:**
   - Render has PostgreSQL but not MySQL
   - Use **Railway** or **PlanetScale** for MySQL hosting
   - Or use **XAMPP MySQL** with ngrok tunnel (not recommended for production)

---

### Alternative: Deploy Database + Code Separately

**Database:** Use Railway (railway.app) -- free MySQL hosting
**Code:** Use Render (render.com) -- free Node.js hosting

Connect them using the database URL Railway gives you.

---

### If You MUST Use Vercel:

You would need to convert your project to **Serverless Functions** and use **Vercel Postgres** instead of MySQL. This requires significant code changes:
- Replace mysql2 with @vercel/postgres
- Replace Express routes with Vercel API routes
- Rewrite database queries for PostgreSQL syntax

**Not recommended** for a student project due to complexity.

---

## 12. COMMON ERRORS & FIXES

| Error | Cause | Fix |
|-------|-------|-----|
| EADDRINUSE: port 3000 | Another app using port 3000 | Change PORT in .env to 3001 |
| mysql not recognized | MySQL not in PATH | Use full path: C:\xampp\mysql\bin\mysql.exe |
| Database connection failed | Wrong password in .env | Check XAMPP default is blank password |
| Invalid email or password | Admin hash doesn't match | Regenerate hash with bcrypt |
| Cannot find module 'express' | Forgot npm install | Run npm install |
| 404 Page Not Found | Wrong URL or route missing | Check URL matches route file |
| Cart not working | JavaScript error | Check browser console (F12) |
| TAM survey not submitting | Values sent as strings | Now fixed with parseInt() |

---

## 13. QUESTIONS YOUR SUPERVISOR MIGHT ASK

### Q1: 'Why did you choose Node.js and not PHP?'
**Answer:** Node.js uses JavaScript for both frontend and backend, making development faster. It's also non-blocking (handles many users at once), which is important for a real-time ordering system. PHP is older and requires learning a second language.

### Q2: 'How does the system handle multiple users ordering at the same time?'
**Answer:** MySQL handles concurrent requests. Each order gets a unique ID. The status field prevents conflicts -- once a rider accepts an order, its status changes so another rider can't accept it.

### Q3: 'What security measures did you implement?'
**Answer:**
- Passwords are hashed with bcrypt (not stored as plain text)
- Sessions expire after 24 hours
- Role-based access control (customers can't access vendor pages)
- SQL injection prevention through parameterized queries
- Input validation on all forms

### Q4: 'How do you know students will actually use this system?'
**Answer:** The TAM survey measures Perceived Usefulness, Perceived Ease of Use, and Behavioral Intention. If scores are high (above 3.5/5), it proves students find value in the system and intend to use it.

### Q5: 'What happens if the vendor's internet goes down?'
**Answer:** The vendor can still cook orders they already received. When internet returns, the page auto-refreshes and shows any new orders. However, they should ideally have a backup internet source for business continuity.

### Q6: 'Can this system work on mobile phones?'
**Answer:** Yes. The CSS is responsive -- it adapts to screen size. Students can order from their phones using the browser. A dedicated mobile app could be a future enhancement.

### Q7: 'How do you prevent fake orders?'
**Answer:** Currently, orders require a valid login. Future improvements could include:
- Phone number verification via SMS
- Payment integration (Paystack/Flutterwave) to confirm orders with payment
- Order cancellation penalties

### Q8: 'What is the TAM survey and why is it important?'
**Answer:** TAM (Technology Acceptance Model) is a validated research framework from Davis (1989). It measures whether users will accept new technology. For this project, it provides quantitative evidence that the system solves a real problem and students will use it.

### Q9: 'What are the limitations of this project?'
**Answer:**
- No real payment integration yet (cash on delivery only)
- No SMS notifications (relies on browser refresh)
- Requires internet connection
- No mobile app (web-only)
- Single campus focus (not scalable to multiple universities yet)

### Q10: 'What would you add in the future?'
**Answer:**
- Payment integration (Paystack/Flutterwave)
- Real-time notifications using WebSockets
- Mobile app (React Native/Flutter)
- Multi-campus support
- Rating and review system
- AI-powered food recommendations

---

## GLOSSARY OF TERMS

| Term | Simple Explanation |
|------|-------------------|
| **Backend** | The server-side code that processes data and talks to the database |
| **Frontend** | What the user sees and interacts with (HTML, CSS, JavaScript) |
| **Database** | A structured collection of data stored in tables |
| **SQL** | Language used to talk to databases (SELECT, INSERT, UPDATE, DELETE) |
| **API** | A way for different software to communicate with each other |
| **Hashing** | Scrambling passwords so they can't be read if stolen |
| **Session** | A way to remember who is logged in across multiple page visits |
| **Middleware** | Code that runs between the request and the response (like a security guard) |
| **LocalStorage** | Browser storage that persists even after closing the tab |
| **Polling** | Automatically checking for updates at regular intervals |
| **CRUD** | Create, Read, Update, Delete -- the 4 basic database operations |
| **Route** | A URL pattern that maps to a specific function in the code |
| **Controller** | A file that contains the logic for handling specific features |
| **Template (EJS)** | HTML files that can display dynamic data from the database |

---

## END OF GUIDE

**Good luck with your project defense!**

Remember:
- Speak confidently about the problem you're solving
- Demonstrate the system live if possible
- Show the TAM survey results as evidence
- Be honest about limitations and future improvements
- Your supervisor wants to see that you UNDERSTAND what you built, not just that it works