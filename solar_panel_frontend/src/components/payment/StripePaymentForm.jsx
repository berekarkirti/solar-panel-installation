import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Calendar, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Beautiful Stripe Payment Form Component
 * Uses Stripe Elements for secure card input
 */

const StripePaymentForm = ({
    clientSecret,
    amount,
    currency = 'INR',
    onSuccess,
    onError,
    orderId,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const shouldReduceMotion = useReducedMotion();

    const [processing, setProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState({
        cardNumber: false,
        cardExpiry: false,
        cardCvc: false,
    });
    const [cardErrors, setCardErrors] = useState({
        cardNumber: null,
        cardExpiry: null,
        cardCvc: null,
    });
    const [focused, setFocused] = useState(null);

    // Check if all fields are complete
    const isFormComplete = cardComplete.cardNumber && cardComplete.cardExpiry && cardComplete.cardCvc;

    // Stripe Elements styling
    const elementStyle = {
        style: {
            base: {
                fontSize: '16px',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: '500',
                color: 'var(--color-text-primary)',
                '::placeholder': {
                    color: 'var(--color-text-secondary)',
                    fontWeight: '400',
                },
                iconColor: 'var(--color-primary)',
            },
            invalid: {
                color: '#ef4444',
                iconColor: '#ef4444',
            },
            complete: {
                color: 'var(--color-primary-hover)',
                iconColor: 'var(--color-primary-hover)',
            },
        },
    };

    const handleCardChange = (field) => (event) => {
        setCardComplete((prev) => ({
            ...prev,
            [field]: event.complete,
        }));
        setCardErrors((prev) => ({
            ...prev,
            [field]: event.error ? event.error.message : null,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!isFormComplete) {
            return;
        }

        setProcessing(true);

        try {
            const cardNumber = elements.getElement(CardNumberElement);

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardNumber,
                },
            });

            if (error) {
                console.error('Payment error:', error);
                onError?.(error.message || 'Payment failed. Please try again.');
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess?.(paymentIntent);
            } else {
                onError?.(`Payment status: ${paymentIntent.status}. Please try again.`);
            }
        } catch (err) {
            console.error('Payment processing error:', err);
            onError?.('An unexpected error occurred. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const formatAmount = (amt) => {
        if (currency === 'INR') {
            return `₹${amt?.toLocaleString('en-IN')}`;
        }
        return `$${amt?.toFixed(2)}`;
    };

    const containerVariants = shouldReduceMotion
        ? {}
        : {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.08,
                },
            },
        };

    const itemVariants = shouldReduceMotion
        ? {}
        : {
            hidden: { opacity: 0, y: 15 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                },
            },
        };

    return (
        <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            {/* Payment Amount Header */}
            <motion.div
                variants={itemVariants}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary-hover/5 to-accent/10 border border-primary/20"
            >
                <div className="text-sm font-medium text-text-secondary mb-1">Amount to Pay</div>
                <div className="text-4xl font-black text-text-primary tracking-tight">
                    {formatAmount(amount)}
                </div>
                <div className="text-xs text-text-secondary mt-2 uppercase tracking-wider">
                    Order #{orderId?.slice(-8)}
                </div>
            </motion.div>

            {/* Card Input Fields */}
            <motion.div variants={itemVariants} className="space-y-4">
                {/* Card Number */}
                <div className="relative">
                    <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Card Number
                    </label>
                    <div
                        className={`
              relative p-4 rounded-xl border-2 transition-all duration-300
              ${focused === 'cardNumber'
                                ? 'border-primary bg-card shadow-lg shadow-primary/10'
                                : 'border-border-soft bg-bg-subtle/30 hover:border-primary/50'}
              ${cardErrors.cardNumber ? 'border-red-500 bg-red-50/10' : ''}
              ${cardComplete.cardNumber && !cardErrors.cardNumber ? 'border-green-500/50' : ''}
            `}
                    >
                        <CardNumberElement
                            options={elementStyle}
                            onChange={handleCardChange('cardNumber')}
                            onFocus={() => setFocused('cardNumber')}
                            onBlur={() => setFocused(null)}
                        />
                        {cardComplete.cardNumber && !cardErrors.cardNumber && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </motion.div>
                        )}
                    </div>
                    {cardErrors.cardNumber && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-1 mt-2 text-xs text-red-500"
                        >
                            <AlertCircle className="w-3 h-3" />
                            {cardErrors.cardNumber}
                        </motion.p>
                    )}
                </div>

                {/* Expiry and CVC Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Expiry Date */}
                    <div className="relative">
                        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Expiry Date
                        </label>
                        <div
                            className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${focused === 'cardExpiry'
                                    ? 'border-primary bg-card shadow-lg shadow-primary/10'
                                    : 'border-border-soft bg-bg-subtle/30 hover:border-primary/50'}
                ${cardErrors.cardExpiry ? 'border-red-500 bg-red-50/10' : ''}
                ${cardComplete.cardExpiry && !cardErrors.cardExpiry ? 'border-green-500/50' : ''}
              `}
                        >
                            <CardExpiryElement
                                options={elementStyle}
                                onChange={handleCardChange('cardExpiry')}
                                onFocus={() => setFocused('cardExpiry')}
                                onBlur={() => setFocused(null)}
                            />
                            {cardComplete.cardExpiry && !cardErrors.cardExpiry && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                </motion.div>
                            )}
                        </div>
                        {cardErrors.cardExpiry && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1 mt-2 text-xs text-red-500"
                            >
                                <AlertCircle className="w-3 h-3" />
                                {cardErrors.cardExpiry}
                            </motion.p>
                        )}
                    </div>

                    {/* CVC */}
                    <div className="relative">
                        <label className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                            <Lock className="w-4 h-4 text-primary" />
                            CVC
                        </label>
                        <div
                            className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${focused === 'cardCvc'
                                    ? 'border-primary bg-card shadow-lg shadow-primary/10'
                                    : 'border-border-soft bg-bg-subtle/30 hover:border-primary/50'}
                ${cardErrors.cardCvc ? 'border-red-500 bg-red-50/10' : ''}
                ${cardComplete.cardCvc && !cardErrors.cardCvc ? 'border-green-500/50' : ''}
              `}
                        >
                            <CardCvcElement
                                options={elementStyle}
                                onChange={handleCardChange('cardCvc')}
                                onFocus={() => setFocused('cardCvc')}
                                onBlur={() => setFocused(null)}
                            />
                            {cardComplete.cardCvc && !cardErrors.cardCvc && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                </motion.div>
                            )}
                        </div>
                        {cardErrors.cardCvc && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1 mt-2 text-xs text-red-500"
                            >
                                <AlertCircle className="w-3 h-3" />
                                {cardErrors.cardCvc}
                            </motion.p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Security Badge */}
            <motion.div
                variants={itemVariants}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-bg-subtle/50 border border-border-soft"
            >
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs text-text-secondary">
                    Your payment is secured with <span className="text-primary font-semibold">256-bit SSL encryption</span>
                </span>
            </motion.div>



            {/* Submit Button */}
            <motion.div variants={itemVariants}>
                <Button
                    type="submit"
                    disabled={!stripe || !isFormComplete || processing}
                    loading={processing}
                    className={`
            w-full py-4 text-lg font-bold tracking-wide
            ${isFormComplete && !processing
                            ? 'bg-gradient-to-r from-primary to-primary-hover hover:shadow-xl hover:shadow-primary/30 transform hover:scale-[1.02]'
                            : 'opacity-70 cursor-not-allowed'
                        }
            transition-all duration-300
          `}
                >
                    {processing ? (
                        <span className="flex items-center justify-center gap-2">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <CreditCard className="w-5 h-5" />
                            </motion.div>
                            Processing Payment...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <Lock className="w-5 h-5" />
                            Pay {formatAmount(amount)}
                        </span>
                    )}
                </Button>
            </motion.div>

            {/* Payment Logos */}
            <motion.div
                variants={itemVariants}
                className="flex items-center justify-center gap-6 pt-2"
            >
                <div className="flex items-center gap-4 opacity-60">
                    <svg className="h-6" viewBox="0 0 50 32" fill="currentColor">
                        <title>Visa</title>
                        <path d="M21.5 23.5H18L20.5 8.5H24L21.5 23.5ZM15 8.5L11.5 19L11 16.5L9.5 9.5C9.5 9.5 9.3 8.5 8 8.5H2L2 8.8C2 8.8 4 9.2 6.5 10.5L9.5 23.5H13.5L19 8.5H15ZM42 23.5H45.5L42.5 8.5H39.5C38.5 8.5 38 9 37.5 10L31.5 23.5H35.5L36.3 21H41.2L41.8 23.5H42ZM37.4 18L39.5 12L40.7 18H37.4ZM33 12L33.5 9C33.5 9 31.5 8.2 29.5 8.2C27.3 8.2 22.5 9.2 22.5 13.5C22.5 17.5 28 17.5 28 19.5C28 21.5 23 21 21 19.5L20.5 22.5C20.5 22.5 22.5 23.5 25.5 23.5C28.5 23.5 32.5 21.5 32.5 17.5C32.5 13.4 27 13 27 11.5C27 10 31 10.2 33 12Z" />
                    </svg>
                    <svg className="h-6" viewBox="0 0 50 32" fill="currentColor">
                        <title>Mastercard</title>
                        <circle cx="18" cy="16" r="10" opacity="0.8" />
                        <circle cx="32" cy="16" r="10" opacity="0.6" />
                    </svg>
                    <svg className="h-5" viewBox="0 0 50 20" fill="currentColor">
                        <title>Amex</title>
                        <rect width="50" height="20" rx="3" opacity="0.7" />
                        <text x="25" y="14" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">AMEX</text>
                    </svg>
                </div>
            </motion.div>
        </motion.form>
    );
};

export default StripePaymentForm;
