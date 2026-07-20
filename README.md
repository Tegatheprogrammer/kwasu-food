# KWASU Food Ordering System

**A Complete Web-Based Food Ordering Platform for Kwara State University (KWASU), Malete, Nigeria**

This is a final year Computer Science project built with Node.js, Express, MySQL, and EJS templating.

---

## Features

### Authentication (All Roles)
- Single login/register page with role selection
- bcryptjs password hashing
- express-session for session management
- Role-based redirects after login
- connect-flash for success/error messages

### Customer Features
- Browse open vendors with card layout
- View vendor menus grouped by category
- Add items to cart (localStorage, no page reload)
- Place orders with hostel delivery location
- Real-time order status tracking (polls every 10s)
- View all past orders with color-coded status badges
- TAM survey (5-point Likert scale, one submission only)

### Vendor Features
- Dashboard with pending orders count & today's revenue
- Open/close shop toggle
- Manage menu items (add, edit, delete, toggle availability)
- View incoming orders (auto-refreshes every 15s)
- Update order status through workflow

### Rider Features
- Dashboard with assigned deliveries
- View available orders marked 'ready'
- Accept delivery assignments
- Mark deliveries as 'out_for_delivery' and 'delivered'

### Admin Features
- Dashboard with total users, orders, revenue stats
- Manage all users (activate/deactivate)
- View TAM survey results with averages for PU, PEOU, BI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Templating | EJS |
| Database | MySQL |
| Styling | Custom CSS (no frameworks) |
| Auth | bcryptjs + express-session |

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MySQL](https://www.mysql.com/) (v5.7 or higher)
- npm (comes with Node.js)

---

## Setup Instructions

### 1. Clone / Extract the Project

```bash
cd kwasu-food
```

### 2. Install Dependencies

```bash
npm install
```

This installs: `express`, `ejs`, `mysql2`, `bcryptjs`, `express-session`, `connect-flash`, `dotenv`

### 3. Configure Database

Edit the `.env` file with your MySQL credentials:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=kwasu_food
SESSION_SECRET=kwasu_food_secret_key_2026_change_this_in_production
```

### 4. Create the Database

Open MySQL and run the schema file:

```bash
mysql -u root -p < config/schema.sql
```

Or log into MySQL and run:

```sql
SOURCE config/schema.sql;
```

This creates:
- Database `kwasu_food`
- All required tables (users, vendors, menu_items, orders, order_items, notifications, tam_responses)
- Default admin user: `admin@kwasu.edu.ng` / `admin123`

### 5. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### 6. Access the Application

Open your browser and go to:

```
http://localhost:3000
```

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@kwasu.edu.ng` | `admin123` |

Register new accounts for Customer, Vendor, and Rider roles.

---

## Project Structure

```
kwasu-food/
├── server.js                 # Main entry point
├── .env                      # Environment variables
├── package.json              # Dependencies
├── config/
│   ├── db.js                 # MySQL connection pool
│   └── schema.sql            # Database schema
├── middleware/
│   └── auth.js               # Role-based auth middleware
├── controllers/
│   ├── authController.js     # Login, register, logout
│   ├── customerController.js # Customer features
│   ├── vendorController.js   # Vendor features
│   ├── riderController.js    # Rider features
│   └── adminController.js    # Admin features
├── routes/
│   ├── auth.js               # Auth routes
│   ├── customer.js           # Customer routes
│   ├── vendor.js             # Vendor routes
│   ├── rider.js              # Rider routes
│   └── admin.js              # Admin routes
├── views/                    # EJS templates
│   ├── partials/             # header, navbar, footer
│   ├── auth/                 # login, register
│   ├── customer/             # dashboard, vendors, menu, orders, tam-survey
│   ├── vendor/               # dashboard, menu, orders
│   ├── rider/                # dashboard, deliveries
│   ├── admin/                # dashboard, users, tam-results
│   └── 404.ejs               # Error page
└── public/
    ├── css/style.css         # Custom stylesheet
    └── js/main.js            # Client-side cart & UI
```

---

## Order Status Flow

```
pending → received → preparing → ready → out_for_delivery → delivered
```

- **Vendor** updates: pending → received → preparing → ready
- **Rider** updates: ready → out_for_delivery → delivered

---

## Color Scheme

| Element | Color |
|---------|-------|
| Primary Navy | `#0D1B4B` |
| Accent Blue | `#2563EB` |
| Success | `#059669` |
| Error | `#dc2626` |
| Warning | `#d97706` |
| Purple | `#7c3aed` |

---

## TAM Survey Constructs

| Construct | Questions | Description |
|-----------|-----------|-------------|
| **PU** (Perceived Usefulness) | pu1–pu4 | Whether the system is useful |
| **PEOU** (Perceived Ease of Use) | peou1–peou4 | Whether the system is easy to use |
| **BI** (Behavioral Intention) | bi1–bi3 | Intention to continue using |

Each question uses a 5-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree).

---

## Security Notes

- Change the `SESSION_SECRET` in `.env` for production
- Change the default admin password after first login
- Use HTTPS in production (set `secure: true` in session config)
- Never commit `.env` to version control

---

## License

MIT License - Academic Project

---

**Developed for:** Kwara State University (KWASU), Malete, Nigeria
**Department:** Computer Science
**Year:** 2026
