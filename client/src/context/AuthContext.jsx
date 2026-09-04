import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ridesense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ridesense_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('ridesense_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to fetch user, logging out', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, role });
      const { token: jwtToken, user: userData } = res.data;

      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('ridesense_token', jwtToken);
      localStorage.setItem('ridesense_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset login for fast demo access without typing passwords
  const quickDemoLogin = async (role) => {
    const demoCredentials = {
      student: { email: 'vinod@ridesense.ai', password: 'password123' },
      driver: { email: 'driver03@ridesense.ai', password: 'password123' },
      admin: { email: 'admin@ridesense.ai', password: 'password123' }
    };
    const creds = demoCredentials[role] || demoCredentials.student;
    return await login(creds.email, creds.password, role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ridesense_token');
    localStorage.removeItem('ridesense_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, quickDemoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
