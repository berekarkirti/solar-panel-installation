import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import TableRowSkeleton from '../components/ui/skeletons/TableRowSkeleton';
import { ShoppingCart, Package, Clock, CheckCircle, XCircle, CreditCard, Ban, Zap } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const hasFetched = useRef(false);

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasFetched.current) {
      hasFetched.current = true;
      fetchOrders();
    }
  }, [authLoading, isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use appropriate endpoint based on role
      const response = isAdmin
        ? await orderService.getAll()
        : await orderService.getMyOrders();

      if (response.success) {
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData);
      } else {
        setError(response.error);
        showError(response.error);
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      const errorMsg = 'An unexpected error occurred';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedOrderId || cancellingId) return;

    try {
      setCancellingId(selectedOrderId);

      const response = await orderService.cancelOrder(selectedOrderId);

      if (response.success) {
        // Update local state
        setOrders(prev =>
          prev.map(order =>
            order._id === selectedOrderId ? { ...order, status: 'CANCELLED' } : order
          )
        );
        showSuccess('Transaction successfully voided');
      } else {
        showError(response.error || 'Failed to sync cancellation');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      showError('Critical transaction error occurred');
    } finally {
      setCancellingId(null);
      setShowCancelModal(false);
      setSelectedOrderId(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return { icon: Clock, color: 'text-accent bg-accent/10' };
      case 'PAID':
        return { icon: CheckCircle, color: 'text-primary-hover bg-primary-hover/10' };
      case 'CANCELLED':
        return { icon: XCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/20' };
      default:
        return { icon: Package, color: 'text-text-secondary bg-bg-subtle' };
    }
  };

  const handlePayment = (orderId) => {
    navigate(`/payment/${orderId}`);
  };

  const containerVariants = shouldReduceMotion
    ? {}
    : {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    };

  const itemVariants = shouldReduceMotion
    ? {}
    : {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    };

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">

      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center text-white"
          >
            <ShoppingCart className="w-8 h-8" strokeWidth={2.5} />
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-text-primary tracking-tight">
              {isAdmin ? 'All Orders' : 'My Orders'}
            </h2>
            <p className="text-text-secondary font-medium">
              {isAdmin ? 'See all orders made by customers' : 'Track your solar panel orders'}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-bg-subtle/50 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="landing-card p-16 border-none text-center bg-red-50/10">
          <EmptyState
            icon={ShoppingCart}
            title="Failed to load"
            description={error}
          />
        </Card>
      )}

      {!loading && !error && orders.length === 0 && (
        <Card className="landing-card p-16 border-none text-center">
          <EmptyState
            icon={ShoppingCart}
            title="Empty Transaction Log"
            description={isAdmin
              ? "No orders found in the system."
              : "Buy your first solar panel to see it here!"
            }
          />
        </Card>
      )}

      {!loading && !error && orders.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6"
        >
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const canPay = isCustomer && order.status === 'PENDING';
            const canCancel = order.status === 'PENDING';
            const isCancelling = cancellingId === order._id;

            return (
              <motion.div key={order._id} variants={itemVariants}>
                <Card
                  hover={true}
                  className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 overflow-hidden group p-0"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-6 lg:p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Order ID</div>
                          <div className="text-2xl font-black text-text-primary tracking-tight group-hover:text-amber-500 transition-colors">
                            #{order._id?.slice(-8).toUpperCase()}
                          </div>
                          {isAdmin && order.user && (
                            <div className="text-sm font-bold text-text-secondary mt-1 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-bg-subtle flex items-center justify-center text-[10px] uppercase font-black">
                                {order.user?.firstName?.charAt(0)}
                              </div>
                              {order.user?.firstName} {order.user?.lastName} · <span className="opacity-60">{order.user?.email}</span>
                            </div>
                          )}
                        </div>
                        <motion.div
                          whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                          className={`${statusConfig.color} px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10 shadow-sm`}
                        >
                          <StatusIcon className="w-4 h-4" strokeWidth={2.5} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 rounded-2xl bg-bg-subtle/50 border border-border-soft">
                          <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1">Module Count</p>
                          <p className="text-lg font-black text-text-primary">{order.items?.length || 0} Panels</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-bg-subtle/50 border border-border-soft">
                          <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1">Total Value</p>
                          <p className="text-lg font-black text-amber-500">${order.totalAmount?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-bg-subtle/50 border border-border-soft col-span-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary mb-1">Order Date</p>
                          <p className="text-lg font-black text-text-primary">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Items</div>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-bg-subtle/30 border border-border-soft/50 group/item hover:border-amber-400/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-amber-500 shadow-sm">
                                    <Zap className="w-5 h-5" />
                                  </div>
                                  <span className="font-black text-text-primary uppercase text-sm tracking-tight">{item.solarPanel?.name || 'Solar Module'}</span>
                                </div>
                                <div className="text-right">
                                  <span className="block text-xs font-bold text-text-primary">Qty: {item.quantity}</span>
                                  <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-tighter">${item.priceAtPurchase} each</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full lg:w-80 bg-bg-subtle/30 p-6 lg:p-8 flex flex-col justify-center border-l border-border-soft">
                      {canPay ? (
                        <div className="space-y-4">
                          <Button
                            onClick={() => handlePayment(order._id)}
                            className="w-full btn-primary-gradient py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20"
                            disabled={isCancelling}
                          >
                            <CreditCard className="w-5 h-5 mr-3" />
                            Authorize Payment
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleCancelOrder(order._id)}
                            className="w-full px-8 py-4 rounded-2xl border-2 border-border-soft font-black text-xs uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                            disabled={isCancelling}
                            loading={isCancelling}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Abort Order
                          </Button>
                        </div>
                      ) : isAdmin && canCancel ? (
                        <Button
                          variant="secondary"
                          onClick={() => handleCancelOrder(order._id)}
                          className="w-full px-8 py-4 rounded-2xl border-2 border-border-soft font-black text-xs uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                          disabled={isCancelling}
                          loading={isCancelling}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Void Transaction
                        </Button>
                      ) : order.status === 'PAID' ? (
                        <div className="text-center p-6 rounded-[2rem] bg-green-500/10 border border-green-500/20">
                          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-green-500/30">
                            <CheckCircle className="w-8 h-8" strokeWidth={3} />
                          </div>
                          <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-1">Settled</p>
                          <p className="text-sm font-black text-text-primary tracking-tight">Paid Successfully</p>
                        </div>
                      ) : order.status === 'CANCELLED' ? (
                        <div className="text-center p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20">
                          <div className="w-16 h-16 rounded-2xl bg-red-500/80 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-red-500/20">
                            <XCircle className="w-8 h-8" strokeWidth={3} />
                          </div>
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Rejected</p>
                          <p className="text-sm font-black text-text-primary tracking-tight">Cancelled</p>
                        </div>
                      ) : (
                        <div className="text-center p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20">
                          <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-amber-500/20">
                            <Clock className="w-8 h-8" strokeWidth={3} />
                          </div>
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">Standby</p>
                          <p className="text-sm font-black text-text-primary tracking-tight">Waiting for next steps</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => {
          if (!cancellingId) {
            setShowCancelModal(false);
            setSelectedOrderId(null);
          }
        }}
        onConfirm={confirmCancel}
        title={isAdmin ? "Void Transaction" : "Abort Order"}
        message={isAdmin
          ? "This will permanently invalidate this transaction record. The client will be notified of the adjustment."
          : "Are you sure you want to stop this order process? This action is permanent."
        }
        confirmText={isAdmin ? "Void Record" : "Confirm Abort"}
        loading={!!cancellingId}
        type="danger"
      />
    </div>
  );
};

export default OrdersPage;