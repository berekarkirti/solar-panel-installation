import { motion } from 'framer-motion';
import { Sun } from 'lucide-react';

const FullScreenLoader = () => {
  return (
    <div className="fixed inset-0 bg-app flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="inline-block mb-6"
        >
          <Sun className="w-16 h-16 text-primary" strokeWidth={2} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-text-primary mb-2"
        >
          Loading...
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-text-secondary"
        >
          Preparing your dashboard
        </motion.p>
      </div>
    </div>
  );
};

export default FullScreenLoader;