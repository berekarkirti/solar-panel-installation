import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import FullScreenLoader from '../components/ui/FullScreenLoader';
import { ArrowLeft, Zap, Package, DollarSign, Home, Building, ShoppingCart, Minus, Plus, Lock, Star, MessageSquare } from 'lucide-react';
import { panelService } from '../services/panelService';
import { cartService } from '../services/cartService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const getPanelImage = (panel) => {
  const { suitableFor, price, _id } = panel;
  const idNum = _id ? _id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;

  if (suitableFor === 'commercial') {
    return idNum % 2 === 0 ? '/panels/commercial2.jpg' : '/panels/commercial3.jpg';
  }

  if (suitableFor === 'residential_pro') {
    if (price >= 20000) return '/panels/residencePro2.png';
    return '/panels/residencePro.jpg';
  }

  if (suitableFor === 'residential_basic') {
    return idNum % 2 === 0 ? '/panels/residenceBasic2jpg.jpg' : '/panels/residence3.jpg';
  }

  return '/panels/residential.jpg';
};

const PanelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [panel, setPanel] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const isCustomer = user?.role === 'CUSTOMER';
  const isLoggedIn = !!user;

  useEffect(() => {
    fetchPanel();
    fetchReviews();
  }, [id]);

  const fetchPanel = async () => {
    try {
      setLoading(true);
      const response = await panelService.getById(id);

      if (response.success) {
        setPanel(response.data);
      } else {
        setError(response.error);
        showError(response.error);
      }
    } catch (err) {
      console.error('Panel fetch error:', err);
      const errorMsg = 'Failed to load panel details';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      // Import this dynamically or assume it's available via import if added
      // We need to update import statement to include reviewService first
      // Assuming I'll update imports in next chunk if needed, but here code is replaced inside component.
      // Wait, need to ensure reviewService is imported. I will handle it.
      const response = await reviewService.getProductReviews(id);
      if (response.success) {
        setReviews(response.data);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      const response = await cartService.addItem(panel._id, quantity);

      if (response.success) {
        showSuccess(`Added ${quantity} ${panel.name} to cart`);
        navigate('/cart');
      } else {
        showError(response.error);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      showError('Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      showError('Please write a comment');
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await reviewService.createProductReview(id, reviewForm.rating, reviewForm.comment);

      if (response.success) {
        showSuccess('Review added successfully');
        setReviewForm({ rating: 5, comment: '' });
        fetchReviews(); // Refresh reviews
      } else {
        showError(response.error);
      }
    } catch (err) {
      console.error('Submit review error:', err);
      showError('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  if (error || !panel) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="landing-card p-16 border-none text-center">
          <EmptyState
            icon={Package}
            title="Panel Not Found"
            description={error || 'The solar panel you are looking for could not be found.'}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">

      <button
        onClick={() => navigate('/panels')}
        className="group flex items-center gap-3 text-text-secondary hover:text-amber-500 transition-all font-black text-xs uppercase tracking-widest px-4"
      >
        <div className="w-8 h-8 rounded-xl bg-bg-subtle flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
        </div>
        Back to Panels
      </button>

      <Card className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

          <div className="lg:col-span-12 h-64 relative overflow-hidden">
            <img
              src={getPanelImage(panel)}
              alt={panel.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest">
                  Panel Details
                </span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">{panel.name}</h1>
            </div>
          </div>

          <div className="lg:col-span-8 p-8 lg:p-12 space-y-10">
            <div>
              <div className="flex items-center gap-6 mb-8 flex-wrap">
                {panel.suitableFor.includes('residential') ? (
                  <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border ${panel.suitableFor === 'residential_pro'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                    <Home className="w-5 h-5" strokeWidth={3} />
                    <span className="text-xs font-black uppercase tracking-widest">{panel.suitableFor.replace('_', ' ')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/10 border border-slate-900/20 text-slate-700 dark:text-slate-300">
                    <Building className="w-5 h-5" strokeWidth={3} />
                    <span className="text-xs font-black uppercase tracking-widest">Enterprise Ready</span>
                  </div>
                )}

                <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-bg-subtle/50 border border-border-soft text-text-secondary">
                  <Package className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">In Stock</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary decoration-amber-500/30 underline underline-offset-8">About this Panel</h3>
                <p className="text-lg font-medium text-text-primary leading-relaxed opacity-80 py-4 italic">
                  {panel.description || "High-quality solar panel designed for maximum energy efficiency and long-lasting durability. Built to withstand various weather conditions while providing reliable power for years."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[2rem] bg-bg-subtle/30 border border-border-soft group hover:border-amber-400/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Zap className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Power Output</span>
                </div>
                <div className="text-4xl font-black text-text-primary tracking-tighter">
                  {panel.capacity || (panel.capacityKW * 1000)}<span className="text-amber-500 text-xl ml-1">Watt</span>
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-bg-subtle/30 border border-border-soft group hover:border-amber-400/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Package className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Cell Architecture</span>
                </div>
                <div className="text-4xl font-black text-text-primary tracking-tighter uppercase line-clamp-1">
                  {panel.suitableFor.includes('residential') ? panel.suitableFor.replace('residential_', '') : 'Enterprise'}<span className="text-amber-500 text-xl ml-1">Grade</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-bg-subtle/30 p-8 lg:p-12 border-l border-border-soft flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 px-1">Market Valuation</p>
              <div className="flex items-baseline gap-2 mb-10">
                <DollarSign className="w-8 h-8 text-amber-500" strokeWidth={3} />
                <span className="text-6xl font-black text-text-primary tracking-tighter">{panel.price}</span>
                <span className="text-xs font-black text-text-secondary uppercase">per unit</span>
              </div>

              {isCustomer && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">
                      Procurement Quantity
                    </label>
                    <div className="flex items-center bg-white dark:bg-slate-800 p-2 rounded-2xl border-2 border-border-soft focus-within:border-amber-400 transition-all shadow-sm">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-bg-subtle transition-colors text-text-primary"
                      >
                        <Minus className="w-5 h-5" strokeWidth={3} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-1 bg-transparent text-center font-black text-2xl outline-none text-text-primary"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-bg-subtle transition-colors text-text-primary"
                      >
                        <Plus className="w-5 h-5" strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-800 border border-border-soft shadow-inner">
                    <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 text-center">Engagement Total</div>
                    <div className="text-4xl font-black text-amber-500 text-center tracking-tighter">
                      <span className="text-2xl mr-1 opacity-60">$</span>{(panel.price * quantity).toFixed(2)}
                    </div>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    loading={adding}
                    disabled={adding}
                    className="w-full btn-primary-gradient py-5 rounded-2xl font-black text-white shadow-2xl shadow-amber-500/20 group uppercase tracking-widest text-xs"
                  >
                    <ShoppingCart className="w-5 h-5 mr-3" />
                    Add to Cart
                  </Button>
                </div>
              )}
            </div>

            {!isCustomer && (
              <div className="text-center p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 italic text-sm font-medium text-text-secondary">
                Sign in with customer credentials to initiate procurement operations.
              </div>
            )}
          </div>

        </div>
      </Card>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-8 flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-500" fill="currentColor" />
            Performance Feedback
          </h2>

          <div className="space-y-6">
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 rounded-3xl bg-bg-subtle/50 animate-pulse" />
                ))}
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review._id} className="landing-card border-none bg-white dark:bg-slate-900 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
                        {review.customer?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-black text-text-primary uppercase tracking-tight">
                          {review.customer?.firstName} {review.customer?.lastName}
                        </div>
                        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-0.5 opacity-60">
                          Verified Acquisition · {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-xl">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} filled={i < review.rating} size="w-3.5 h-3.5" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-text-secondary leading-relaxed pl-16 py-2 italic opacity-80 border-l-2 border-amber-500/20 ml-6">
                    "{review.comment}"
                  </p>
                </Card>
              ))
            ) : (
              <div className="text-center py-16 bg-bg-subtle/20 rounded-[3rem] border-2 border-dashed border-border-soft">
                <div className="w-16 h-16 rounded-full bg-bg-subtle flex items-center justify-center text-text-secondary mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-text-secondary font-bold uppercase text-[10px] tracking-widest">No Field Reports Generated</p>
                <p className="text-sm text-text-secondary/60 mt-1">Operational data pending customer submission.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          {isCustomer ? (
            <div className="bg-bg-subtle/30 p-8 rounded-[2.5rem] border border-border-soft sticky top-24">
              <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-6">Submit Report</h3>
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">Performance Rating</label>
                  <div className="flex gap-2 p-2 bg-white dark:bg-slate-800 rounded-2xl border-2 border-border-soft shadow-inner">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="focus:outline-none transition-all hover:scale-125"
                      >
                        <StarIcon filled={star <= reviewForm.rating} size="w-8 h-8" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">Detailed Analysis</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Log your experience with this PV module..."
                    rows="4"
                    className="w-full px-5 py-4 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-white dark:bg-slate-800 outline-none resize-none font-medium text-sm leading-relaxed"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  loading={submittingReview}
                  disabled={submittingReview}
                  className="w-full btn-primary-gradient py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20 text-xs uppercase tracking-widest"
                >
                  Transmit Review
                </Button>
              </form>
            </div>
          ) : !isLoggedIn ? (
            <div className="bg-bg-subtle/30 p-8 rounded-[2.5rem] text-center sticky top-24 border border-border-soft">
              <div className="w-12 h-12 rounded-2xl bg-bg-subtle flex items-center justify-center text-text-secondary mx-auto mb-4">
                <Lock className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4">Authenticated Access Required</p>
              <Button
                onClick={() => navigate('/login')}
                variant="secondary"
                className="px-8 py-3 rounded-xl border-2 border-border-soft font-black text-[10px] uppercase tracking-widest hover:bg-bg-subtle transition-all"
              >
                Agent Login
              </Button>
            </div>
          ) : null}
        </div>
      </div>

    </div>
  );
};

// Simple Star Icon Component for Internal Use
const StarIcon = ({ filled, size = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${size} ${filled ? "text-amber-500" : "text-text-secondary/20"}`}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default PanelDetailPage;