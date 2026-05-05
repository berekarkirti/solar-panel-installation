import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent double initialization in StrictMode
  const isInitialized = useRef(false);
  const isInitializing = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (isInitialized.current || isInitializing.current) {
      return;
    }

    const initAuth = async () => {
      isInitializing.current = true;

      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!storedToken) {
          setIsLoading(false);
          isInitialized.current = true;
          isInitializing.current = false;
          return;
        }

        // First, try to use stored user data for immediate hydration
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.role) {
              setUser(parsedUser);
              setToken(storedToken);
              setIsAuthenticated(true);
            }
          } catch (e) {
            console.warn('Failed to parse stored user');
          }
        }

        // Verify token with backend
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!res.ok) {
          throw new Error('Invalid token');
        }

        const response = await res.json();
        const userData = response.data?.user || response.user || response;

        if (!userData || !userData.role) {
          throw new Error('Invalid user data');
        }

        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));

      } catch (err) {
        console.error('Auth init error:', err);
        // Clear auth state but don't call logout() to avoid navigation loops
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
        isInitialized.current = true;
        isInitializing.current = false;
      }
    };

    initAuth();
  }, []);

  const login = (userData, authToken) => {
    try {
      const user = userData?.user || userData;
      setUser(user);
      setToken(authToken);
      setIsAuthenticated(true);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    role: user?.role,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};