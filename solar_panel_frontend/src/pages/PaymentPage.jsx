import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../config/stripe';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import FullScreenLoader from '../components/ui/FullScreenLoader';
import StripePaymentForm from '../components/payment/StripePaymentForm';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Package,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const hasFetched = useRef(false);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('INITIATED');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && user && !hasFetched.current) {
      hasFetched.current = true;
      fetchOrderAndPayment();
    }
  }, [authLoading, user, orderId]);

  const fetchOrderAndPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pass user role to getById so it knows which endpoint to use
      const orderResponse = await orderService.getById(orderId, user?.role);

      if (!orderResponse.success) {
        setError(orderResponse.error || 'Failed to load order');
        return;
      }

      const orderData = orderResponse.data;
      setOrder(orderData);

      if (orderData.status === 'PAID') {
        setPaymentStatus('SUCCESS');
        return;
      }

      // Try to get existing payment
      try {
        const paymentResponse = await paymentService.getPaymentByOrder(orderId);
        if (paymentResponse.success && paymentResponse.data) {
          setPayment(paymentResponse.data);
          setPaymentStatus(paymentResponse.data.status || 'CREATED');
        }
      } catch (paymentErr) {
        // No existing payment, that's okay
        console.log('No existing payment found');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (processing) return;

    try {
      setProcessing(true);

      const response = await paymentService.createPaymentIntent(orderId);

      if (response.success) {
        setPayment(response.data);
        setClientSecret(response.data.clientSecret);
        setPaymentStatus('CREATED');
        showSuccess('Payment initiated successfully');
      } else {
        setError(response.error);
        showError(response.error || 'Failed to create payment');
      }
    } catch (err) {
      console.error('Payment creation error:', err);
      showError('Failed to create payment');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setPaymentStatus('PROCESSING');

      // Verify payment with backend
      const response = await paymentService.verifyPayment(orderId, paymentIntent.id);

      if (response.success) {
        setPaymentStatus('SUCCESS');
        setPayment(response.data);
        showSuccess('Payment completed successfully!');

        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        setPaymentStatus('FAILED');
        setError(response.error);
        showError(response.error || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setPaymentStatus('FAILED');
      showError('Payment verification failed. Please contact support.');
    }
  };

  const handlePaymentError = (errorMessage) => {
    setPaymentStatus('FAILED');
    setError(errorMessage);
    showError(errorMessage);
  };

  const handleRetry = () => {
    setPaymentStatus('INITIATED');
    setClientSecret(null);
    setPayment(null);
    setError(null);
    hasFetched.current = false;
    fetchOrderAndPayment();
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
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    };

  // Stripe Elements appearance
  const stripeAppearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#f59e0b', // amber-500
      colorBackground: 'var(--color-card-bg)',
      colorText: 'var(--color-text-primary)',
      colorDanger: '#ef4444',
      fontFamily: '"Outfit", "Inter", sans-serif',
      borderRadius: '24px',
    },
  };

  // Show loading while auth is checking
  if (authLoading) {
    return <FullScreenLoader />;
  }

  if (loading) {
    return <FullScreenLoader />;
  }

  if (error && !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="landing-card border-none text-center p-12">
          <EmptyState
            icon={AlertCircle}
            title="Gateway Link Offline"
            description={error}
          />
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/orders')}
              className="px-8 py-3 rounded-xl border-2 border-border-soft font-black text-[10px] uppercase tracking-widest hover:bg-bg-subtle transition-all"
            >
              Back to Orders
            </Button>
            <Button
              onClick={() => { hasFetched.current = false; fetchOrderAndPayment(); }}
              className="btn-primary-gradient px-8 py-3 rounded-xl font-black text-white shadow-lg shadow-amber-500/20"
            >
              Retry Sync
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-10 pb-20"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => navigate('/orders')}
          className="group flex items-center gap-3 text-text-secondary hover:text-amber-500 transition-all font-black text-xs uppercase tracking-widest"
        >
          <div className="w-8 h-8 rounded-xl bg-bg-subtle flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
          </div>
          Registry Overflow
        </button>
      </motion.div>

      {/* Header Card */}
      <motion.div variants={itemVariants}>
        <Card className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 overflow-hidden p-0">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-8 lg:p-10 flex items-center justify-between text-white">
            <div>
              <h2 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                Secure Channel
                <ShieldCheck className="w-6 h-6 text-white/40" />
              </h2>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Financial Settlement Protocol</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <CreditCard className="w-8 h-8" />
            </div>
          </div>

          <div className="p-8 lg:p-10">
            {order && (
              <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-bg-subtle/30 border border-border-soft">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Infrastructure Ref</p>
                      <div className="text-xl font-black text-text-primary tracking-tight">
                        #{order._id?.slice(-12).toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Module Count</p>
                      <div className="text-lg font-black text-text-primary">{order.items?.length || 0} Units</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-border-soft/50 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <span className="text-xs font-black text-amber-500">{item.quantity}×</span>
                          </div>
                          <span className="text-sm font-black text-text-primary uppercase tracking-tight">
                            {item.solarPanel?.name || 'Solar Module'}
                          </span>
                        </div>
                        <span className="text-lg font-black text-text-primary tracking-tighter">
                          ${(item.priceAtPurchase * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 mt-8 border-t-2 border-dashed border-border-soft flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Total Valuation</p>
                      <span className="text-5xl font-black text-amber-500 tracking-tighter">
                        ${order.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-text-secondary tracking-widest bg-bg-subtle px-4 py-2 rounded-full mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Certified Rate
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Payment Status/Form Card */}
      <motion.div variants={itemVariants}>
        <Card className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 p-8 lg:p-10 relative overflow-hidden">
          {/* Success State */}
          {paymentStatus === 'SUCCESS' && (
            <motion.div
              initial={shouldReduceMotion ? {} : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/40">
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <h3 className="text-4xl font-black text-text-primary mb-4 tracking-tighter uppercase">Settled Successfully</h3>
              <p className="text-text-secondary font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                Your financial obligation has been verified. The acquisition process for your solar infrastructure is now authorized.
              </p>
              <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 mb-10 bg-green-500/5 py-3 px-6 rounded-full inline-flex">
                <ShieldCheck className="w-4 h-4" />
                <span>Encrypted Transaction Verified</span>
              </div>
              <br />
              <Button
                onClick={() => navigate('/orders')}
                className="btn-primary-gradient px-12 py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20"
              >
                Go to Registry
              </Button>
            </motion.div>
          )}

          {/* Failed State */}
          {paymentStatus === 'FAILED' && (
            <div className="text-center py-6">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/40">
                <XCircle className="w-12 h-12 text-white" strokeWidth={3} />
              </div>
              <h3 className="text-4xl font-black text-text-primary mb-4 tracking-tighter uppercase">Authorization Denied</h3>
              <p className="text-text-secondary font-medium mb-10 max-w-sm mx-auto leading-relaxed italic opacity-80">
                {error || 'The encryption handcheck failed during the financial stabilization phase.'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleRetry}
                  className="btn-primary-gradient px-10 py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20"
                >
                  Retry Protocol
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/orders')}
                  className="px-8 py-4 rounded-2xl border-2 border-border-soft font-black text-[10px] uppercase tracking-widest hover:bg-bg-subtle transition-all"
                >
                  Back to Orders
                </Button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {paymentStatus === 'PROCESSING' && (
            <div className="text-center py-10">
              <div className="w-24 h-24 rounded-[2rem] bg-amber-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/30">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="w-12 h-12 text-white" strokeWidth={3} />
                </motion.div>
              </div>
              <h3 className="text-3xl font-black text-text-primary mb-4 tracking-tighter uppercase">Verification In Progress</h3>
              <p className="text-text-secondary font-medium uppercase text-[10px] tracking-[0.3em] mb-10">
                Standby for financial handcheck...
              </p>
              <div className="h-2 bg-bg-subtle rounded-full overflow-hidden max-w-xs mx-auto border border-border-soft">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            </div>
          )}

          {/* Initiate Payment State */}
          {order && !clientSecret && paymentStatus !== 'SUCCESS' && paymentStatus !== 'FAILED' && paymentStatus !== 'PROCESSING' && (
            <div className="space-y-8">
              <div className="text-center py-6">
                <motion.div
                  animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-amber-400/20 to-orange-500/10 flex items-center justify-center mx-auto mb-8 border-2 border-amber-500/20 shadow-inner"
                >
                  <DollarSign className="w-12 h-12 text-amber-500" strokeWidth={3} />
                </motion.div>
                <h3 className="text-4xl font-black text-text-primary mb-3 tracking-tighter uppercase">Authorize Link</h3>
                <p className="text-text-secondary font-medium max-w-sm mx-auto leading-relaxed">
                  Ready to proceed with the financial settlement via the encrypted Stripe gateway.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-bg-subtle/50 p-6 rounded-3xl border border-border-soft mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-amber-500 shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Security Status</p>
                  <p className="text-sm font-black text-text-primary">256-bit AES Encryption Active</p>
                </div>
              </div>

              <Button
                onClick={handleCreatePayment}
                loading={processing}
                disabled={processing}
                className="w-full btn-primary-gradient py-6 rounded-[2rem] text-xl font-black text-white shadow-2xl shadow-amber-500/30 uppercase tracking-[0.2em]"
              >
                {processing ? 'SYNCING...' : 'TRANSMIT FUNDS'}
              </Button>
            </div>
          )}

          {/* Stripe Payment Form */}
          {paymentStatus === 'CREATED' && clientSecret && payment && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-border-soft pb-10 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Encryption Gateway</h3>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">Enter Authorization Credentials</p>
                </div>
              </div>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: stripeAppearance,
                }}
              >
                <StripePaymentForm
                  clientSecret={clientSecret}
                  amount={payment.amount}
                  currency={payment.currency}
                  orderId={orderId}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PaymentPage;