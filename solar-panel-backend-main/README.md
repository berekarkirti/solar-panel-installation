# Solar Panel Management System - Backend API

A robust RESTful API built with Node.js, Express, and MongoDB for managing a solar panel e-commerce and installation tracking platform.

## 🚀 Features

-   **Authentication & Authorization**
    -   JWT-based authentication (Access & Refresh tokens).
    -   Role-based access control (Admin, Customer, Technician).
    -   Secure password hashing with bcrypt.

-   **Solar Panel Management**
    -   CRUD operations for solar panels (Admin only).
    -   Filtering capabilities (Residential vs. Commercial).
    -   Capacity and pricing management.

-   **Order Processing**
    -   Cart management and checkout flow.
    -   **Shipping Validation**: Enforces `address` and `city` requirements before order creation.
    -   Order history tracking with immutable `shippingAddress` snapshots.
    -   Integration with frontend payment flows.

-   **Installation Services**
    -   Professional installation tracking system.
    -   **Deployment Site Tracking**: Linkage to order shipping details for precise onsite coordination.
    -   Technician assignment system (Admin) - creates an installation record upon assignment.
    -   Installation progress tracking (Pending -> In Progress -> Completed).
    -   Technician dashboard endpoints.

-   **Admin Dashboards & Analytics**
    -   Real-time statistics for users, orders, and installations.
    -   Revenue tracking and inventory oversight.

-   **User Management**
    -   Profile management (Image upload, Password change, **Address & City management**).
    -   Admin dashboards for managing technicians and customers.
    -   Technician status toggling (Active/Inactive).

-   **Reviews & Ratings**
    -   Product review system with star ratings.

## 🛠️ Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (with Mongoose ODM)
-   **Authentication**: JSON Web Tokens (JWT)
-   **Validation**: Joi / Custom Validators
-   **File Handling**: Multer (for profile images)
-   **Security**: Helmet, CORS, Rate Limiting
-   **Logging**: Morgan / Winston

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd solar-panel-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory based on `.env.example`:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/solar_panel_db
    JWT_SECRET=your_super_secret_jwt_key
    JWT_EXPIRE=1d
    NODE_ENV=development
    ```

4.  **Start the server:**
    ```bash
    # Development mode (with nodemon)
    npm run dev

    # Production mode
    npm start
    ```

## 🔑 API Endpoints

### 🔐 Authentication (`/api/v1/auth`)
-   `POST /register` - Register a new customer
-   `POST /login` - Login user
-   `GET /me` - Get current user profile
-   `PUT /me` - Update current user profile (Supports `firstName`, `lastName`, `phoneNumber`, `address`, `city`, `profileImage`, `password`)
-   `GET /admin-only` - Test endpoint for Admin
-   `GET /customer-only` - Test endpoint for Customer
-   `GET /technician-only` - Test endpoint for Technician

### ☀️ Solar Panels (`/api/v1/panels`)
-   `GET /` - Get all solar panels (supports filtering)
-   `GET /:id` - Get details of a specific panel
-   `POST /` - Create a new panel (Admin only)
-   `PUT /:id` - Update an existing panel (Admin only)
-   `DELETE /:id` - Soft delete a panel (Admin only)

### 🛒 Cart (`/api/v1/cart`)
-   `GET /` - Get current user's cart
-   `POST /add` - Add item to cart
-   `DELETE /remove/:panelId` - Remove specific item from cart
-   `DELETE /clear` - Clear entire cart

### 📦 Orders (`/api/v1/orders`)
-   `POST /` - Create a new order from cart (Requires `address` and `city` in request body)
-   `GET /my` - Get logged-in customer's order history
-   `GET /` - Get all system orders (Admin only)
-   `GET /:id` - Get specific order details (Admin)
-   `PUT /:id/cancel` - Cancel an order (Customer/Admin)

### 💳 Payments (`/api/v1/payments`)
-   `POST /create-intent` - Create Stripe Payment Intent
-   `POST /confirm` - Confirm payment and finalize order
-   `GET /my` - Get logged-in customer's payment history
-   `GET /` - Get all system payments (Admin only)

### 🔧 Installations (`/api/v1/installations`)
-   `GET /` - Get all installations (Admin only)
-   `GET /my` - Get assigned/owned installations
-   `POST /assign` - Assign technician to an order (Admin only)
-   `PUT /:id/status` - Update installation status (Technician only)

### 👥 Users & Technicians (`/api/v1/users`)
-   `GET /` - Get all users (Admin only)
-   `GET /:id` - Get specific user details (Admin only)
-   `POST /technicians` - Create a new technician account (Admin only)
-   `PUT /technicians/:id` - Update technician details (Admin only)
-   `DELETE /technicians/:id` - Delete a technician (Admin only)
-   `PATCH /:id/toggle-status` - Toggle technician active status (Admin only)

### ⭐ Reviews (`/api/v1/reviews`)
-   `POST /` - Add a review for a purchased product
-   `GET /my` - Get logged-in customer's reviews
-   `GET /product/:id` - Get all reviews for a specific product
-   `GET /` - Get all system reviews (Admin only)
-   `DELETE /:id` - Delete a review (Admin only)

### 📊 Admin Analytics (`/api/v1/admin`)
-   `GET /stats` - Get dashboard statistics (Admin & Technician)

## 🧪 Testing

Run the test suite using Jest:
```bash
npm test
```
