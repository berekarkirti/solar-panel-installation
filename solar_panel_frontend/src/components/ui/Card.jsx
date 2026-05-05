import { motion, useReducedMotion } from 'framer-motion';

const Card = ({ children, className = '', delay = 0, hover = true, onClick }) => {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = shouldReduceMotion
    ? {}
    : {
        initial: {
          opacity: 0,
          y: 20,
        },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            delay: delay,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      };

  const hoverVariants = hover && !shouldReduceMotion
    ? {
        y: -6,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 25,
        },
      }
    : {};

  const tapVariants = !shouldReduceMotion
    ? {
        scale: 0.98,
        y: 0,
      }
    : {};

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={hoverVariants}
      whileTap={onClick ? tapVariants : {}}
      onClick={onClick}
      className={`
        bg-card rounded-2xl shadow-card p-6 lg:p-8 
        theme-transition
        ${hover ? 'hover:shadow-card-hover cursor-pointer' : ''}
        ${className}
      `}
      style={{
        willChange: hover ? 'transform, box-shadow' : 'auto',
      }}
    >
      {children}
    </motion.div>
  );
};

export default Card;