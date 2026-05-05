import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Sun,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

const AuthPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.pathname === '/login');

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setMessage({ type: '', text: '' });
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const splitName = (fullName) => {
    const trimmed = fullName.trim();
    const parts = trimmed.split(' ');

    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }

    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      let payload;

      if (isLogin) {
        payload = {
          email: formData.email,
          password: formData.password
        };
      } else {
        const { firstName, lastName } = splitName(formData.fullName);

        if (!firstName) {
          setMessage({ type: 'error', text: 'Please enter your name' });
          setLoading(false);
          return;
        }

        payload = {
          firstName,
          lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = data.data?.user;
        const accessToken = data.data?.accessToken;

        if (!userData || !accessToken) {
          setMessage({ type: 'error', text: 'Invalid response from server' });
          setLoading(false);
          return;
        }

        setMessage({ type: 'success', text: data.message || 'Success!' });

        if (isLogin) {
          login(userData, accessToken);
          const from = location.state?.from?.pathname || '/dashboard';
          // Add a small delay for the success animation
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 800);
        } else {
          setTimeout(() => {
            navigate('/login');
            setFormData({ fullName: '', email: '', password: '', role: 'CUSTOMER' });
            setMessage({ type: 'success', text: 'Registration successful! Please login.' });
          }, 1500);
        }
      } else {
        const errorMessage = data.message || data.error || 'Something went wrong';
        setMessage({ type: 'error', text: errorMessage });
      }

    } catch (error) {
      let errorText = 'Network connection failed. ';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorText += 'Please ensure the backend server is running.';
      } else {
        errorText += 'Please try again later.';
      }
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = data.data?.user;
        const accessToken = data.data?.accessToken;

        if (!userData || !accessToken) {
          setMessage({ type: 'error', text: 'Invalid response from server' });
          setLoading(false);
          return;
        }

        setMessage({ type: 'success', text: data.message || 'Login successful!' });
        login(userData, accessToken);

        const from = location.state?.from?.pathname || '/dashboard';
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 800);
      } else {
        setMessage({ type: 'error', text: data.message || 'Google authentication failed' });
      }
    } catch (error) {
      console.error('Google login error:', error);
      setMessage({ type: 'error', text: 'Connection to server failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setMessage({ type: 'error', text: 'Google Login Failed' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-app p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <Card className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 overflow-hidden relative">

          {/* Header Section */}
          <div className="p-2">
            <div className="relative h-48 overflow-hidden bg-slate-900 rounded-[2rem]">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 opacity-90" />

              {/* Abstract Shapes */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-32 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl" />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-6 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 1.5, bounce: 0.5 }}
                  className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20 shadow-xl"
                >
                  <Sun className="w-10 h-10 text-white" strokeWidth={2} />
                </motion.div>
                <h1 className="text-3xl font-black tracking-tight uppercase">Solar Panel</h1>
                <p className="text-white/80 font-medium text-xs tracking-widest uppercase mt-2">Next Gen Energy Systems</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Toggle Switch */}
            <div className="flex bg-bg-subtle p-1.5 rounded-2xl mb-8 relative">
              <motion.div
                className="absolute top-1.5 bottom-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm z-0"
                initial={false}
                animate={{
                  left: isLogin ? '6px' : '50%',
                  width: 'calc(50% - 6px)',
                  x: isLogin ? 0 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => navigate('/login')}
                className={`flex-1 relative z-10 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${isLogin ? 'text-amber-600 dark:text-amber-500' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Access Portal
              </button>
              <button
                onClick={() => navigate('/register')}
                className={`flex-1 relative z-10 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${!isLogin ? 'text-amber-600 dark:text-amber-500' : 'text-text-secondary hover:text-text-primary'}`}
              >
                New Account
              </button>
            </div>

            {/* Notifications */}
            <AnimatePresence mode='wait'>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className={`rounded-2xl p-4 flex items-start gap-3 overflow-hidden ${message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
                    }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-sm font-bold">{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    key="name-field"
                    className="overflow-hidden"
                  >
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-4 rounded-2xl bg-bg-subtle/50 border-2 border-transparent focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-bold text-text-primary placeholder:font-medium placeholder:text-text-secondary/50 group-hover:bg-bg-subtle"
                        placeholder="Full Legal Name"
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div layout key="email-field" className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-bg-subtle/50 border-2 border-transparent focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-bold text-text-primary placeholder:font-medium placeholder:text-text-secondary/50 group-hover:bg-bg-subtle"
                    placeholder="Email Address"
                  />
                </motion.div>

                <motion.div layout key="password-field" className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-11 pr-12 py-4 rounded-2xl bg-bg-subtle/50 border-2 border-transparent focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-bold text-text-primary placeholder:font-medium placeholder:text-text-secondary/50 group-hover:bg-bg-subtle"
                    placeholder="Secure Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-amber-500 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </motion.div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    key="role-field"
                    className="overflow-hidden"
                  >
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ShieldCheck className="h-5 w-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                      </div>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-4 rounded-2xl bg-bg-subtle/50 border-2 border-transparent focus:border-amber-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-bold text-text-primary cursor-pointer group-hover:bg-bg-subtle appearance-none"
                      >
                        <option value="CUSTOMER">Customer Account</option>
                        <option value="TECHNICIAN">Certified Technician</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <div className="w-2 h-2 border-b-2 border-r-2 border-text-secondary transform rotate-45 mb-1" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full btn-primary-gradient py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20 group/btn uppercase tracking-widest text-xs"
                >
                  <span className="mr-2">{isLogin ? 'Authenticate' : 'Initialize Account'}</span>
                  {!loading && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </form>

            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-4 w-full">
                <div className="h-[1px] flex-1 bg-border-soft" />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-50">Secure Access</span>
                <div className="h-[1px] flex-1 bg-border-soft" />
              </div>

              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_blue"
                  shape="pill"
                  width="100%"
                />
              </div>
            </div>
          </div>

          <div className="bg-bg-subtle/30 px-8 py-6 flex items-center justify-between border-t border-border-soft backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest text-text-secondary">System Online</span>
            </div>
            <Zap className="w-4 h-4 text-amber-500 opacity-50" />
          </div>
        </Card>

        <p className="text-center mt-8 text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-40">
          © 2024 Solar Panel Infrastructure
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;