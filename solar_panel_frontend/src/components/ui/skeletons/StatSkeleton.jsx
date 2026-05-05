import { motion, useReducedMotion } from 'framer-motion';

const StatSkeleton = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 lg:p-8 theme-transition">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className={`h-3 bg-bg-subtle rounded-xl w-1/3 ${!shouldReduceMotion && 'animate-pulse'}`}></div>
          <div className={`h-10 bg-bg-subtle rounded-xl w-1/2 ${!shouldReduceMotion && 'animate-pulse'}`}></div>
          <div className={`h-3 bg-bg-subtle rounded-xl w-2/5 ${!shouldReduceMotion && 'animate-pulse'}`}></div>
        </div>
        <div className={`w-12 h-12 bg-bg-subtle rounded-xl ${!shouldReduceMotion && 'animate-pulse'}`}></div>
      </div>
    </div>
  );
};

export default StatSkeleton;