import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate(user ? '/dashboard' : '/login');
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Card className="landing-card border-none text-center p-12 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />

          <div className="mb-8 relative">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
              <Lock className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-0 right-1/4 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white border-4 border-white dark:border-slate-900"
            >
              <ShieldAlert className="w-4 h-4" />
            </motion.div>
          </div>

          <div className="text-6xl font-black text-amber-500 mb-4 tracking-tighter opacity-20">
            403
          </div>

          <h1 className="text-3xl font-black text-text-primary mb-4 tracking-tight uppercase">
            Access Restricted
          </h1>

          <p className="text-text-secondary font-medium mb-10 leading-relaxed italic opacity-80">
            Authentication verified, but high-level clearance is missing. This sector is partitioned from your current role permissions.
          </p>

          <div className="mb-10 p-6 rounded-[2rem] bg-bg-subtle/50 border border-border-soft">
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">Verified Persona</p>
            <div className="inline-block px-6 py-2 rounded-xl bg-slate-900 dark:bg-amber-500/10 text-white dark:text-amber-500 text-xs font-black uppercase tracking-[0.2em]">
              {user?.role || 'UNIDENTIFIED'}
            </div>
          </div>

          <Button
            onClick={handleGoToDashboard}
            className="w-full btn-primary-gradient py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-amber-500/30 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 group"
          >
            Go to Sub-Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
          </Button>
        </Card>

        <p className="text-center text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mt-8 opacity-40">
          Request administrative override for expanded clearance.
        </p>
      </motion.div>
    </div>
  );
};

export default Unauthorized;