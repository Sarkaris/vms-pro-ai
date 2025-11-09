import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { mockApi } from '../utils/mockData';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await mockApi.getProfile();
          setUser(profile);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Hardcoded login credentials
      if (email === 'admin@vms.com' && password === '123') {
        const { token, admin } = await mockApi.login(email, password);
        
        localStorage.setItem('token', token);
        setUser(admin);
        
        toast.success(`Welcome back, ${admin.firstName}!`);
        return { success: true };
      } else {
        toast.error('Invalid credentials. Use email: admin@vms.com, password: 123');
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      const message = error.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    toast.error('Registration is disabled in demo mode');
    return { success: false, message: 'Registration disabled in demo' };
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    toast.error('Profile updates are disabled in demo mode');
    return { success: false, message: 'Profile updates disabled in demo' };
  };

  const changePassword = async (currentPassword, newPassword) => {
    toast.error('Password changes are disabled in demo mode');
    return { success: false, message: 'Password changes disabled in demo' };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
