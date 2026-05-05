import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import TableRowSkeleton from '../components/ui/skeletons/TableRowSkeleton';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Zap } from 'lucide-react';
import { cartService } from '../services/cartService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Building, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const hasFetched = useRef(false);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
  });

  const { user } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasFetched.current) {
      hasFetched.current = true;
      fetchCart();
    }
  }, [authLoading, isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getCart();

      if (response.success && response.data) {
        setCart(response.data);
      } else {
        setError(response.error || 'Failed to load cart');
        setCart({ items: [], totalAmount: 0 });
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      setError('Failed to load cart');
      setCart({ items: [], totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Increment item quantity by 1
   */
  const handleIncrement = async (panelId) => {
    if (updating) return; // Prevent double-clicks

    try {
      setUpdating(panelId);

      // Optimistic update
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item => {
          const itemPanelId = item.solarPanel?._id || item.solarPanel;
          if (itemPanelId === panelId) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        }),
      }));

      const response = await cartService.incrementQuantity(panelId);

      if (response.success && response.data) {
        setCart(response.data);
      } else {
        // Revert on failure - only show ONE toast
        await fetchCart();
        showError(response.error || 'Failed to update quantity');
      }
    } catch (err) {
      console.error('Increment error:', err);
      await fetchCart();
      showError('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  /**
   * Decrement item quantity by 1
   */
  const handleDecrement = async (panelId, currentQuantity) => {
    if (currentQuantity <= 1 || updating) return;

    try {
      setUpdating(panelId);

      // Optimistic update
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item => {
          const itemPanelId = item.solarPanel?._id || item.solarPanel;
          if (itemPanelId === panelId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        }),
      }));

      const response = await cartService.decrementQuantity(panelId, currentQuantity);

      if (response.success && response.data) {
        setCart(response.data);
      } else {
        // Revert on failure - only show ONE toast
        await fetchCart();
        showError(response.error || 'Failed to update quantity');
      }
    } catch (err) {
      console.error('Decrement error:', err);
      await fetchCart();
      showError('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (panelId) => {
    if (updating) return;

    try {
      setUpdating(panelId);
      const response = await cartService.removeItem(panelId);

      if (response.success && response.data) {
        setCart(response.data);
        showSuccess('Item removed from cart');
      } else {
        showError(response.error || 'Failed to remove item');
      }
    } catch (err) {
      console.error('Remove item error:', err);
      showError('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const performCheckout = async (addressData) => {
    try {
      setUpdating('checkout');
      const response = await cartService.createOrder(addressData);

      if (response.success && response.data) {
        const orderId = response.data._id || response.data.id;
        if (orderId) {
          showSuccess('Order created successfully!');
          navigate(`/payment/${orderId}`);
        } else {
          showError('Order created but ID not found');
        }
      } else {
        showError(response.error || 'Failed to create order');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showError('Failed to create order');
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = async () => {
    if (updating) return;

    const hasAddress = user?.address && user?.address.trim() !== '';
    const hasCity = user?.city && user?.city.trim() !== '';

    if (hasAddress && hasCity) {
      // Direct checkout if details exist
      await performCheckout({
        address: user.address.trim(),
        city: user.city.trim(),
      });
    } else {
      // Show modal if details are missing
      setAddressForm({
        address: user?.address || '',
        city: user?.city || '',
      });
      setIsAddressModalOpen(true);
    }
  };

  const confirmCheckout = async (e) => {
    e.preventDefault();

    if (!addressForm.address.trim() || !addressForm.city.trim()) {
      showError('Please provide both address and city');
      return;
    }

    setIsAddressModalOpen(false);
    await performCheckout({
      address: addressForm.address.trim(),
      city: addressForm.city.trim(),
    });
  };

  // Safe access to cart items
  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const totalAmount = cart?.totalAmount || 0;

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
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-3xl bg-bg-subtle/50 animate-pulse" />
        ))}
      </div>
    );
  }

  // Show loading while fetching cart
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-3xl bg-bg-subtle/50 animate-pulse" />
        ))}
      </div>
    );
  }

  // Show error state
  if (error && cartItems.length === 0) {
    return (
      <Card className="landing-card p-16 border-none text-center">
        <EmptyState
          icon={ShoppingCart}
          title="Item removed from cart"
          description={error}
        />
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="secondary"
            onClick={() => { hasFetched.current = false; fetchCart(); }}
            className="px-8 py-4 rounded-2xl border-2 border-border-soft font-black text-xs uppercase tracking-widest hover:bg-bg-subtle transition-all"
          >
            Retry
          </Button>
          <Button
            onClick={() => navigate('/panels')}
            className="btn-primary-gradient px-8 py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20"
          >
            See Panels
          </Button>
        </div>
      </Card>
    );
  }

  // Show empty cart state ONLY when we have successfully fetched and cart is truly empty
  if (!loading && cartItems.length === 0) {
    return (
      <Card className="landing-card p-16 border-none text-center">
        <EmptyState
          icon={ShoppingCart}
          title="Your Cart is Empty"
          description="You haven't added any panels yet. Check out our panels to get started."
        />
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => navigate('/panels')}
            className="btn-primary-gradient px-12 py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20"
          >
            See Panels
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-20">

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
          <h2 className="text-3xl font-black text-text-primary tracking-tight">Your Cart</h2>
          <p className="text-text-secondary font-medium">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} added</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {cartItems.map((item) => {
              const panel = item.solarPanel || {};
              const panelId = panel._id || item.solarPanel;
              const panelPrice = panel.price || 0;
              const quantity = item.quantity || 1;
              const itemTotal = panelPrice * quantity;
              const isItemUpdating = updating === panelId;

              return (
                <motion.div key={item._id || panelId} variants={itemVariants}>
                  <Card className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 p-6 group">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-bg-subtle flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-105 transition-transform duration-500">
                        <Zap className="w-10 h-10" />
                      </div>

                      <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Product Designation</div>
                        <h3 className="text-xl font-black text-text-primary tracking-tight group-hover:text-amber-500 transition-colors uppercase">
                          {panel.name || 'Solar Module'}
                        </h3>
                        <p className="text-sm font-bold text-text-secondary mt-1">
                          ID: {panel._id?.slice(-6).toUpperCase()} · <span className="text-amber-500">${panelPrice.toFixed(2)} each</span>
                        </p>

                        <div className="flex items-center gap-4 mt-6">
                          <div className="flex items-center bg-bg-subtle/50 p-1.5 rounded-xl border border-border-soft">
                            <button
                              onClick={() => handleDecrement(panelId, quantity)}
                              disabled={isItemUpdating || quantity <= 1}
                              className="w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 text-text-primary hover:text-amber-500 shadow-sm transition-all disabled:opacity-30 disabled:grayscale"
                            >
                              <Minus className="w-4 h-4" strokeWidth={3} />
                            </button>

                            <span className="text-lg font-black text-text-primary min-w-[3.5rem] text-center font-mono">
                              {quantity.toString().padStart(2, '0')}
                            </span>

                            <button
                              onClick={() => handleIncrement(panelId)}
                              disabled={isItemUpdating}
                              className="w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 text-text-primary hover:text-amber-500 shadow-sm transition-all disabled:opacity-30"
                            >
                              <Plus className="w-4 h-4" strokeWidth={3} />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(panelId)}
                            disabled={isItemUpdating}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-widest"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="text-right border-t md:border-t-0 md:border-l border-border-soft pt-4 md:pt-0 md:pl-8 min-w-[140px]">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Line Subtotal</p>
                        <div className="text-3xl font-black text-text-primary tracking-tighter">
                          ${itemTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <div className="space-y-6">
          <Card className="landing-card border-none bg-slate-900 text-white p-8 sticky top-24 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />

            <h3 className="text-xl font-black tracking-tight uppercase mb-8 relative z-10">Total Cost</h3>

            <div className="space-y-4 mb-8 relative z-10">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Gross Value</span>
                <span className="font-mono text-white/90 font-black">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Tax Provision</span>
                <span className="font-mono text-white/40">CALCULATED AT STEP 2</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Delivery</span>
                <span className="font-mono text-white/40">FREE</span>
              </div>
            </div>

            <div className="mb-10 relative z-10">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2 text-center">Net Investment</p>
              <div className="text-5xl font-black text-center tracking-tighter">
                ${totalAmount.toFixed(2)}
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full btn-primary-gradient py-5 rounded-2xl font-black text-white shadow-2xl shadow-amber-500/20 group relative z-10"
              disabled={updating === 'checkout' || cartItems.length === 0}
              loading={updating === 'checkout'}
            >
              Checkout
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="mt-6 text-[9px] font-bold text-white/30 text-center leading-relaxed">
              Click checkout to start your order.
            </p>
          </Card>
        </div>

      </div>

      {/* Shipping Address Modal */}
      {createPortal(
        <AnimatePresence>
          {isAddressModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setIsAddressModalOpen(false)}
              />
              {/* Modal Container */}
              <div className="relative z-10 w-full max-w-lg flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full overflow-hidden border border-white/10"
                >
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-8 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-2xl font-black tracking-tight uppercase">Address</h3>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Delivery Info</p>
                </div>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={confirmCheckout} className="p-8 space-y-6">
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 italic text-[11px] text-text-secondary leading-relaxed">
                  Note: These details will be saved to your profile for setup.
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">Physical Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-black"
                      placeholder="e.g. 123 Solar Estate, Clean Energy Ave"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">City</label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-black"
                      placeholder="e.g. San Francisco"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 btn-primary-gradient py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20"
                  >
                    Confirm & Proceed
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default CartPage;