import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Send cookies with every request
axios.defaults.withCredentials = true;

const BASE = 'http://localhost:5000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null); // regular user
  const [admin, setAdmin]     = useState(null); // admin user
  const [loading, setLoading] = useState(true);

  // ── On mount: check both cookies in parallel ────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      await Promise.all([checkAdmin(), checkUser()]);
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Check admin_token cookie → GET /api/admin/me
  const checkAdmin = async () => {
    try {
      const res = await axios.get(`${BASE}/api/admin/me`);
      if (res.data.success) setAdmin(res.data.data.admin ?? res.data.data.user);
    } catch {
      setAdmin(null);
    }
  };

  // Check token cookie → GET /api/user/me
  const checkUser = async () => {
    try {
      const res = await axios.get(`${BASE}/api/user/me`);
      if (res.data.success) setUser(res.data.data.user);
    } catch {
      setUser(null);
    }
  };

  // ── Admin login → POST /api/admin/login ─────────────────────────────────
  const adminLogin = async (email, password) => {
    const res = await axios.post(`${BASE}/api/admin/login`, { email, password });
    if (res.data.success) setAdmin(res.data.data.admin ?? res.data.data.user);
    return res.data;
  };

  // ── Admin logout → POST /api/admin/logout ───────────────────────────────
  const adminLogout = async () => {
    try { await axios.post(`${BASE}/api/admin/logout`); } catch { /* ignore */ }
    setAdmin(null);
  };

  // ── User login (email + password) → POST /api/user/login ────────────────
  const login = async (email, password) => {
    const res = await axios.post(`${BASE}/api/user/login`, {email , password });
    if (res.data.success) setUser(res.data.data.user);
    return res.data;
  };

  // ── User logout → POST /api/user/logout ─────────────────────────────────
  const logout = async () => {
    try { await axios.post(`${BASE}/api/user/logout`); } catch { /* ignore */ }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        // State
        user,
        admin,
        loading,

        // Booleans
        isUser:  !!user,
        isAdmin: !!admin,

        // Actions
        login,
        logout,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);