import { motion, useReducedMotion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AccessDenied = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

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
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <Card className="landing-card border-none text-center p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />

          <motion.div
            animate={shouldReduceMotion ? {} : {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/30"
          >
            <ShieldAlert className="w-12 h-12 text-white" strokeWidth={3} />
          </motion.div>

          <h1 className="text-4xl font-black text-text-primary mb-4 tracking-tighter uppercase">
            Security Breach
          </h1>

          <p className="text-text-secondary font-medium mb-10 leading-relaxed italic opacity-80">
            Authorization failure. Your current credentials lack the necessary clearance level to initialize this sector.
          </p>

          <div className="mb-10 p-6 rounded-[2rem] bg-bg-subtle/50 border border-border-soft">
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">Identified Clearance</p>
            <div className="inline-block px-6 py-2 rounded-xl bg-slate-900 dark:bg-amber-500/10 text-white dark:text-amber-500 text-xs font-black uppercase tracking-[0.2em]">
              {user?.role || 'UNIDENTIFIED'}
            </div>
          </div>

          <div className="space-y-4">
            <Button onClick={handleGoHome} className="w-full btn-primary-gradient py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20 text-xs uppercase tracking-widest">
              Return to Nexus
            </Button>
            <Button onClick={handleGoBack} variant="secondary" className="w-full py-4 rounded-2xl border-2 border-border-soft font-black text-[10px] uppercase tracking-widest hover:bg-bg-subtle transition-all">
              Revert Vector
            </Button>
            <button
              onClick={logout}
              className="w-full text-xs font-black text-text-secondary hover:text-red-500 transition-colors uppercase tracking-widest pt-4"
            >
              Terminate Session
            </button>
          </div>
        </Card>

        <p className="text-center text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mt-8 opacity-40">
          Contact System Administrator for clearance elevation.
        </p>
      </motion.div>
    </div>
  );
};

export default AccessDenied;