import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wrench,
  User,
  Users,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, isMobile }) => {
  const shouldReduceMotion = useReducedMotion();
  const { user } = useAuth();

  const allMenuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'CUSTOMER', 'TECHNICIAN'],
    },
    {
      path: '/panels',
      label: 'Panels',
      icon: Sun,
      roles: ['ADMIN', 'CUSTOMER', 'TECHNICIAN'],
    },
    {
      path: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      roles: ['CUSTOMER'],
    },
    {
      path: '/orders',
      label: 'Orders',
      icon: Package,
      roles: ['ADMIN', 'CUSTOMER'],
    },
    {
      path: '/installations',
      label: 'Installations',
      icon: Wrench,
      roles: ['ADMIN', 'TECHNICIAN', 'CUSTOMER'],
    },
    {
      path: '/users',
      label: 'Users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      path: '/reviews',
      label: 'Reviews',
      icon: MessageSquare,
      roles: ['ADMIN', 'CUSTOMER'],
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
      roles: ['ADMIN', 'CUSTOMER', 'TECHNICIAN'],
    },
  ];

  const menuItems = allMenuItems.filter(item =>
    item.roles.includes(user?.role)
  );

  const sidebarVariants = shouldReduceMotion
    ? {}
    : {
      collapsed: {
        width: isMobile ? 0 : 58,
        transition: {
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        },
      },
      expanded: {
        width: 192,
        transition: {
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    };

  const labelVariants = shouldReduceMotion
    ? {}
    : {
      hidden: {
        opacity: 0,
        x: -10,
        transition: {
          duration: 0.2,
        },
      },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.3,
          delay: 0.1,
        },
      },
    };

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={false}
      animate={isOpen ? 'expanded' : 'collapsed'}
      className={`
        fixed left-0 top-0 h-full hero-gradient z-40
        overflow-hidden shadow-2xl theme-transition
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-500 ease-out
        border-r border-white/5
      `}
    >
      <div className="flex flex-col h-full">

        <div className={`h-16 flex items-center border-b border-white/5 flex-shrink-0 transition-all duration-500 ${isOpen ? 'px-4' : 'px-[9px] justify-center'}`}>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20"
            >
              <Sun className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.div>
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  variants={labelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex flex-col"
                >
                  <span className="text-white font-bold text-base leading-tight whitespace-nowrap">
                    Solar<span className="text-amber-400">Pro</span>
                  </span>
                  <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Management</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `
                    flex items-center gap-3 px-3 py-3 rounded-xl
                    transition-all duration-300 ease-out
                    no-underline relative group
                    ${isActive
                    ? 'bg-white/10 text-amber-400 shadow-inner'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }
                  `
                }
                style={{ textDecoration: 'none' }}
              >
                {({ isActive }) => (
                  <>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                          initial={shouldReduceMotion ? {} : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>

                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      className={`
                        flex items-center justify-center w-8 h-8 rounded-lg transition-colors
                        ${isActive ? 'bg-amber-400/10' : 'group-hover:bg-white/5'}
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-400' : ''}`} strokeWidth={2} />
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {isOpen && (
                        <motion.span
                          variants={labelVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="font-medium whitespace-nowrap text-xs tracking-wide"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-hover flex-shrink-0">
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                variants={labelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-2"
              >
                <div className="text-xs text-gray-400">
                  Logged in as
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-400">
                  Role: {user?.role}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.aside>
  );
};

export default Sidebar;