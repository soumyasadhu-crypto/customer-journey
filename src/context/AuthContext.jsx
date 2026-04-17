import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'cuemath_export_email';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem(STORAGE_KEY) || null);

  const authorizeWithEmail = (email) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.endsWith('@cuemath.com')) {
      return 'Only @cuemath.com email addresses are allowed.';
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    setUser(trimmed);
    return null; // no error
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authorizeWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
