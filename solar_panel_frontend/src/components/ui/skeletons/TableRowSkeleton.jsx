import { motion, useReducedMotion } from 'framer-motion';

const TableRowSkeleton = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm theme-transition">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 bg-bg-subtle rounded-full ${!shouldReduceMotion && 'animate-pulse'}`}></div>
        <div className="flex-1 space-y-2">
          <div className={`h-4 bg-bg-subtle rounded-xl w-3/4 ${!shouldReduceMotion && 'animate-pulse'}`}></div>
          <div className={`h-3 bg-bg-subtle rounded-xl w-1/2 ${!shouldReduceMotion && 'animate-pulse'}`}></div>
        </div>
        <div className={`h-8 w-24 bg-bg-subtle rounded-lg ${!shouldReduceMotion && 'animate-pulse'}`}></div>
      </div>
    </div>
  );
};

export default TableRowSkeleton;