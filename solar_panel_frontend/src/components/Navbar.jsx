import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ui/ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDashboard = () => {
    const dashboardPath =
      user?.role === 'ADMIN' ? '/admin' :
        user?.role === 'TECHNICIAN' ? '/technician' :
          user?.role === 'CUSTOMER' ? '/customer' : '/login';

    navigate(dashboardPath);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 shadow-lg"
      style={{ backgroundColor: '#344e41' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: App Name */}
          <div className="flex items-center space-x-3">
            <svg
              className="w-8 h-8"
              style={{ color: '#C7DBC1' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: '#C7DBC1' }}
            >
              Solar Panel System
            </span>
          </div>

          {/* Right: Dashboard Link + Role Badge + Theme Toggle + Logout */}
          <div className="flex items-center space-x-4">

            <ThemeToggle className="bg-transparent text-[#dad7cd] hover:bg-[#2D6A4F] border border-[#dad7cd]/20" />

            {/* Dashboard Link */}
            <button
              onClick={handleDashboard}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
              style={{ color: '#dad7cd' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2D6A4F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Dashboard
            </button>

            {/* Role Badge */}
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: '#95D5B2',
                color: '#344e41'
              }}
            >
              {user?.role || 'USER'}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-300"
              style={{
                backgroundColor: '#1B4332',
                color: '#dad7cd'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2D6A4F';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1B4332';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Logout
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;