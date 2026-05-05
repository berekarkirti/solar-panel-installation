import { motion, useReducedMotion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button'
}) => {
  const shouldReduceMotion = useReducedMotion();

  const baseStyles = `
    inline-flex items-center justify-center gap-2
    px-6 py-3 rounded-xl font-semibold text-sm
    transition-all duration-300 relative overflow-hidden
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-primary text-white 
      hover:bg-primary-hover 
      shadow-md hover:shadow-lg
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
      before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700
    `,
    secondary: `
      bg-bg-subtle text-text-primary 
      hover:bg-border-soft 
      shadow-sm hover:shadow-md
    `,
    ghost: `
      bg-transparent text-primary 
      hover:bg-bg-subtle/50
    `,
  };

  const hoverAnimation = shouldReduceMotion || disabled || loading
    ? {}
    : { scale: 1.02, y: -2 };

  const tapAnimation = shouldReduceMotion || disabled || loading
    ? {}
    : { scale: 0.98, y: 0 };

  return (
    <motion.button
      type={type}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;