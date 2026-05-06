import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/auth/AuthPage';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FullScreenLoader from './components/ui/FullScreenLoader';
import { useToast } from './context/ToastContext';
import { setToastCallback } from './lib/axios';

// Lazy load pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PanelsPage = lazy(() => import('./pages/PanelsPage'));
const PanelDetailPage = lazy(() => import('./pages/PanelDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const InstallationsPage = lazy(() => import('./pages/InstallationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const CreateReviewPage = lazy(() => import('./pages/CreateReviewPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

function App() {
  const { error: showErrorToast } = useToast();

  useEffect(() => {
    setToastCallback(showErrorToast);
  }, [showErrorToast]);

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard - All authenticated users */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Panels - All authenticated users */}
          <Route path="/panels" element={<PanelsPage />} />
          <Route path="/panels/:id" element={<PanelDetailPage />} />

          {/* Cart - Customer only */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CartPage />
              </ProtectedRoute>
            }
          />

          {/* Orders - Admin and Customer */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CUSTOMER']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Payment - Admin and Customer */}
          <Route
            path="/payment/:orderId"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CUSTOMER']}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          {/* Installations - Admin, Technician, and Customer */}
          <Route
            path="/installations"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN', 'CUSTOMER']}>
                <InstallationsPage />
              </ProtectedRoute>
            }
          />

          {/* User Management - Admin only */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Reviews - Admin and Customer */}
          <Route
            path="/reviews"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CUSTOMER']}>
                <ReviewsPage />
              </ProtectedRoute>
            }
          />

          {/* Create Review - Customer only */}
          <Route
            path="/reviews/create/:orderId"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CreateReviewPage />
              </ProtectedRoute>
            }
          />

          {/* Profile - All authenticated users */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Role-based landing routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;