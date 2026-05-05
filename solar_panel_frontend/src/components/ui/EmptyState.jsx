import { motion, useReducedMotion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-bg-subtle/50 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-text-secondary" strokeWidth={2} />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-md mb-6">{description}</p>
      {action && (
        <p className="text-sm text-primary font-semibold">{action}</p>
      )}
    </motion.div>
  );
};

export default EmptyState;