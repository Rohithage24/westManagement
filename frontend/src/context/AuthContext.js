import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Set global axios defaults for cookies
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/me');
        if (res.data.success) setUser(res.data.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (gmail, password) => {
    const res = await axios.post('http://localhost:5000/api/user/login', { gmail, password });
    if (res.data.success) setUser(res.data.data.user);
    return res.data;
  };

  const logout = async () => {
    await axios.post('http://localhost:5000/api/user/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);