import { Menu, ChevronDown, Sun, Moon, Monitor, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ pageTitle, toggleSidebar, isSidebarOpen, isMobile }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentThemeIcon = themeOptions.find(opt => opt.value === theme)?.icon || Moon;
  const ThemeIcon = currentThemeIcon;

  const dropdownVariants = shouldReduceMotion
    ? {}
    : {
      hidden: {
        opacity: 0,
        y: -10,
        scale: 0.95,
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.2,
          ease: [0.16, 1, 0.3, 1],
        },
      },
      exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: {
          duration: 0.15,
        },
      },
    };

  return (
    <header
      className={`
        fixed top-0 right-0 h-[51px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-white/5 z-20
        theme-transition
        transition-all duration-500 ease-out
        ${isMobile ? 'left-0' : isSidebarOpen ? 'left-[192px]' : 'left-[58px]'}
      `}
    >
      <div className="h-full px-4 lg:px-8 flex items-center justify-between">

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6 text-text-primary" />
          </motion.button>

          <motion.h1
            key={pageTitle}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg lg:text-xl font-black text-text-primary tracking-tight"
          >
            {pageTitle}
          </motion.h1>
        </div>

        <div className="flex items-center gap-4">

          <div className="relative">
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 15 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-transparent active:border-amber-400/30"
              aria-label="Change theme"
            >
              <ThemeIcon className="w-5 h-5 text-text-primary" />
            </motion.button>

            <AnimatePresence>
              {isThemeMenuOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-3 w-44 landing-card rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
                  onMouseLeave={() => setIsThemeMenuOpen(false)}
                >
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={shouldReduceMotion ? {} : { x: 4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                          setTheme(option.value);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 rounded-xl transition-all ${theme === option.value
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                          : 'text-text-primary hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-semibold">{option.label}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 pl-3 p-1 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-white/10"
            >
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-text-primary leading-tight">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-[10px] uppercase tracking-wider font-black text-amber-500 opacity-80">{user?.role}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/20">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-3 w-56 landing-card rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className="px-4 py-3 mb-1 bg-gray-50 dark:bg-white/5 rounded-xl">
                    <div className="text-sm font-bold text-text-primary">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-text-secondary truncate">{user?.email}</div>
                  </div>

                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { x: 4 }}
                    onClick={logout}
                    className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all font-bold flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    Logout
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </header>
  );
};

export default Topbar;