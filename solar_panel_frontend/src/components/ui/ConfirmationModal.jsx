import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import Button from './Button';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger', // 'danger' or 'warning'
    loading = false
}) => {
    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop - Removed backdrop-blur per request */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60"
                />

                {/* Modal Container to ensure perfect centering */}
                <div className="relative z-10 w-full max-w-md flex items-center justify-center pointer-events-none">
                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="pointer-events-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full overflow-hidden border border-border-soft flex flex-col"
                    >
                        <div className="p-8 lg:p-10">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg transform rotate-3 ${type === 'danger'
                                    ? 'bg-rose-500/10 text-rose-500 shadow-rose-500/10'
                                    : 'bg-amber-500/10 text-amber-500 shadow-amber-500/10'
                                    }`}>
                                    <AlertCircle className="w-10 h-10" strokeWidth={2.5} />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight">
                                        {title}
                                    </h3>
                                    <p className="text-text-secondary font-medium leading-relaxed max-w-[280px] mx-auto opacity-80">
                                        {message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mt-10">
                                <Button
                                    variant="secondary"
                                    onClick={onClose}
                                    className="flex-1 py-4.5 rounded-2xl border-2 border-slate-100 dark:border-white/10 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-text-secondary"
                                    disabled={loading}
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    className={`flex-2 py-4.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all border-none text-white ${type === 'danger'
                                        ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                                        : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                        }`}
                                    loading={loading}
                                    disabled={loading}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </div>

                        {/* Decorative Bottom Bar */}
                        <div className={`h-2 w-full ${type === 'danger' ? 'bg-rose-500' : 'bg-amber-500'} opacity-20`} />
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmationModal;
