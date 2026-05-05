import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import TableRowSkeleton from '../components/ui/skeletons/TableRowSkeleton';
import { Star, MessageSquare, User, Trash2 } from 'lucide-react';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const ReviewsPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const hasFetched = useRef(false);

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasFetched.current) {
      hasFetched.current = true;
      fetchReviews();
    }
  }, [authLoading, isAuthenticated]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use appropriate endpoint based on role
      const response = isAdmin
        ? await reviewService.getAll()
        : await reviewService.getMyReviews();

      if (response.success) {
        const reviewsData = Array.isArray(response.data) ? response.data : [];
        setReviews(reviewsData);
      } else {
        setError(response.error);
        showError(response.error);
      }
    } catch (err) {
      console.error('Reviews fetch error:', err);
      const errorMsg = 'Failed to load reviews';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = (review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedReview || deletingId) return;

    try {
      setDeletingId(selectedReview._id);
      const response = await reviewService.delete(selectedReview._id);

      if (response.success) {
        showSuccess('Review record successfully purged');
        setReviews(prev => prev.filter(r => r._id !== selectedReview._id));
      } else {
        showError(response.error || 'Failed to sync deletion');
      }
    } catch (err) {
      console.error('Delete review error:', err);
      showError('Critical registry synchronization error');
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setSelectedReview(null);
    }
  };

  const renderStars = (rating) => {
    const safeRating = typeof rating === 'number' ? rating : 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= safeRating ? 'text-accent fill-accent' : 'text-text-secondary'
              }`}
            strokeWidth={2}
          />
        ))}
      </div>
    );
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

  return (
    <div className="space-y-10 pb-20">

      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center text-white"
        >
          <MessageSquare className="w-8 h-8" strokeWidth={2.5} />
        </motion.div>
        <div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">
            {isAdmin ? 'Operational Feedback' : 'Performance Log'}
          </h2>
          <p className="text-text-secondary font-medium lowercase tracking-wide">
            {isAdmin ? 'Global acquisition sentiments and metrics' : 'Personal field reports and evaluations'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-bg-subtle/50 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="landing-card border-none text-center p-16">
          <EmptyState
            icon={MessageSquare}
            title="Registry Synchronization Error"
            description={error}
          />
        </Card>
      )}

      {!loading && !error && reviews.length === 0 && (
        <Card className="landing-card border-none text-center p-16">
          <EmptyState
            icon={MessageSquare}
            title="Sentiments Not Found"
            description={isAdmin
              ? "The global feedback registry is currently at zero entries. Metadata pending customer input."
              : "No historical performance logs detected in your account profile."
            }
          />
        </Card>
      )}

      {!loading && !error && reviews.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {reviews.map((review) => (
            <motion.div key={review._id} variants={itemVariants}>
              <Card className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 p-8 group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />

                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-amber-500/20 flex-shrink-0">
                    {review.customer?.firstName?.charAt(0) || 'U'}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">
                            {review.customer?.firstName || 'Anonymous'} {review.customer?.lastName || ''}
                          </h3>
                          <span className="px-3 py-1 rounded-full bg-bg-subtle text-[9px] font-black uppercase tracking-widest text-text-secondary">
                            Verified Trace
                          </span>
                        </div>
                        {review.solarPanel?.name && (
                          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-80">
                            System: <span className="text-amber-500 font-black">{review.solarPanel.name}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 bg-bg-subtle/50 px-4 py-2 rounded-xl border border-border-soft">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>

                        {isAdmin && (
                          <>
                            <div className="w-px h-6 bg-border-soft mx-2" />
                            <motion.button
                              whileHover={{ scale: 1.1, y: -2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteReview(review)}
                              disabled={deletingId === review._id}
                              className="w-9 h-9 rounded-xl bg-transparent border-2 border-slate-100 dark:border-white/5 text-rose-500 hover:bg-rose-500 hover:border-rose-500 hover:text-white flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/20 disabled:opacity-50"
                              title="Delete Review"
                            >
                              <Trash2 className={`w-4 h-4 ${deletingId === review._id ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-sm font-medium text-text-primary leading-relaxed border-l-3 border-amber-500/20 pl-6 py-2 italic opacity-90">
                        {review.comment}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-text-secondary flex-wrap pt-2">
                      {review.technician && (
                        <div className="flex items-center gap-2 bg-slate-900/5 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                          <User className="w-3.5 h-3.5 text-amber-500" strokeWidth={3} />
                          <span>
                            Assigned Engineer: {review.technician?.firstName} {review.technician?.lastName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>
                          Log Entry: {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }) : 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )
      }

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!deletingId) {
            setShowDeleteModal(false);
            setSelectedReview(null);
          }
        }}
        onConfirm={confirmDelete}
        title="Purge Record"
        message={`This will permanently remove the feedback entry from ${selectedReview?.customer?.firstName} ${selectedReview?.customer?.lastName}. This action cannot be reversed.`}
        confirmText="Confirm Purge"
        loading={!!deletingId}
        type="danger"
      />
    </div >
  );
};

export default ReviewsPage;