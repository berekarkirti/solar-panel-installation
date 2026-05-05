# Solar Panel Management System - Frontend

A modern, responsive, and interactive React application for browsing solar solutions, managing orders, and tracking installations. Built with a focus on premium aesthetics and user experience.

## ✨ Features

-   **Dynamic Dashboard**
    -   **Landing Page**: Professional introduction to solar solutions for all visitors.
    -   Role-based dashboards for Admin, Technician, and Customer.
    -   Real-time statistics and installation status counters.

-   **Profile Management**
    -   Update personal details, **Physical Address**, and **Operational City**.
    -   Secure password management.
    -   **Profile Image Upload**: Visualize your profile with custom avatar uploads.

-   **Product Catalog**
    -   Visualize solar panels with rich cards and details.
    -   **Smart Filtering**: Instantly toggle between Residential and Commercial panels.
    -   Search capabilities.

-   **Shopping Experience**
    -   Full-featured shopping cart (Add, Remove, Update Quantity).
    -   **Smart Checkout**: Automated check for shipping details with conditional "Installation Site" modal collection.
    -   Order history review.

-   **Installation Tracking**
    -   **For Customers**: Track the progress and **Deployment Site** of your installation.
    -   **For Technicians**: Manage assigned jobs with precise map-data and update statuses.
    -   **For Admins**: Orchestrate deployment lifecycles and professional assignments.

-   **Admin Powers**
    -   **Technician Management**: Add, edit, delete, or deactivate technicians.
    -   **Panel Management**: Add, update, or remove inventory items.
    -   **User Oversight**: View and manage system users.

-   **User Experience (UX)**
    -   **Glassmorphism Design**: Sleek, modern UI with blur effects and gradients.
    -   **Smooth Animations**: Powered by `framer-motion` for delightful interactions.
    -   **Interactive Modals**: Custom confirmation dialogs and forms.
    -   **Responsive Layout**: Fully optimized for desktop, tablet, and mobile.

## 🛠️ Tech Stack

-   **Framework**: React 18
-   **Build Tool**: Vite
-   **Styling**: TailwindCSS
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **State Management**: React Context API
-   **Routing**: React Router DOM (v6)
-   **HTTP Client**: Axios

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd solar_panel_frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root based on `.env.example`:
    ```env
    VITE_API_URL=http://localhost:5000/api/v1
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # Generic UI elements (Buttons, Cards, Modals)
│   └── ...
├── context/            # Global state (Auth, Toast)
├── pages/              # Main application views
│   ├── LandingPage.jsx     # Welcome & Features
│   ├── DashboardPage.jsx   # Role-specific overview
│   ├── PanelsPage.jsx      # Product catalog
│   ├── CartPage.jsx        # Shopping cart & Smart checkout
│   ├── OrdersPage.jsx      # Order history
│   ├── InstallationsPage.jsx # Deployment tracking & status
│   ├── UserManagementPage.jsx # Admin user oversight
│   ├── ProfilePage.jsx     # Personal settings
│   └── ...
├── services/           # API integration services
├── lib/                # Utilities and configurations
└── assets/             # Static images and icons
```
