import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import FullScreenLoader from '../components/ui/FullScreenLoader';
import { Star, MessageSquare, ArrowLeft } from 'lucide-react';
import { reviewService } from '../services/reviewService';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';

const CreateReviewPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getById(orderId);

      if (response.success) {
        setOrder(response.data);

        if (response.data.status !== 'PAID') {
          setError('Validation Error: Reviews can only be submitted for established financial settlements.');
        }
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Order fetch error:', err);
      setError('System Link Failure: Could not retrieve acquisition metadata.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      showError('Calibration Required: Please assign a performance metric');
      return;
    }

    try {
      setSubmitting(true);
      const response = await reviewService.create(orderId, rating, comment);

      if (response.success) {
        showSuccess('Transmission Successful: Field report initialized.');
        navigate('/reviews');
      } else {
        showError(response.error);
      }
    } catch (err) {
      console.error('Review submit error:', err);
      showError('Upload Failure: Service interrupted during transmission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="landing-card border-none text-center p-16">
          <EmptyState
            icon={MessageSquare}
            title="Authorization Denied"
            description={error || 'The specified infrastructure record could not be located.'}
          />
          <div className="mt-8">
            <Button
              onClick={() => navigate('/orders')}
              className="btn-primary-gradient px-8 py-3 rounded-xl font-black text-white"
            >
              Return to Registry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">

      <button
        onClick={() => navigate('/orders')}
        className="group flex items-center gap-3 text-text-secondary hover:text-amber-500 transition-all font-black text-xs uppercase tracking-widest px-4"
      >
        <div className="w-8 h-8 rounded-xl bg-bg-subtle flex items-center justify-center group-hover:bg-amber-500/10 transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
        </div>
        Registry Overview
      </button>

      <Card className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 p-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />

        <div className="flex items-center gap-6 mb-12 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
            <MessageSquare className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-text-primary tracking-tight uppercase">Generate report</h2>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mt-1">
              Infrastructure Trace: <span className="text-amber-500">#{order._id.slice(-12).toUpperCase()}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">

          <div className="p-8 rounded-[2.5rem] bg-bg-subtle/30 border border-border-soft">
            <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-6 px-1">
              Performance Metric *
            </label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-12 h-12 transition-all ${star <= (hoveredRating || rating)
                      ? 'text-amber-500 fill-amber-500 drop-shadow-lg'
                      : 'text-text-secondary/20'
                      }`}
                    strokeWidth={2.5}
                  />
                </button>
              ))}
            </div>
            <div className="mt-6 min-h-[1.5rem] px-1">
              {rating > 0 && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-black uppercase tracking-[0.3em] text-amber-500"
                >
                  {rating === 1 && 'Critical Failure'}
                  {rating === 2 && 'Sub-optimal'}
                  {rating === 3 && 'Nominal Performance'}
                  {rating === 4 && 'High Efficiency'}
                  {rating === 5 && 'Peak Optimization'}
                </motion.p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">
              Detailed Narrative (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={5}
              className="w-full px-6 py-5 rounded-[2.5rem] border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-card outline-none resize-none font-medium text-sm leading-relaxed"
              placeholder="Log your qualitative analysis of the hardware installation..."
            />
            <div className="flex justify-between items-center mt-3 px-2">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                Buffer: {comment.length}/500 bits
              </p>
              <div className="h-1 bg-border-soft w-24 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${(comment.length / 500) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              loading={submitting}
              disabled={submitting || rating === 0}
              className="flex-[2] btn-primary-gradient py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-amber-500/30 uppercase tracking-[0.2em] text-xs"
            >
              Transmit Metadata
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/orders')}
              disabled={submitting}
              className="flex-1 py-5 rounded-[1.5rem] border-2 border-border-soft font-black text-text-secondary uppercase tracking-widest text-[9px] hover:bg-bg-subtle transition-all"
            >
              Abort
            </Button>
          </div>

        </form>
      </Card>

    </div>
  );
};

export default CreateReviewPage;