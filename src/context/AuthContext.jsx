import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'cuemath_export_auth';
const EXPORT_PASSWORD = 'CustomerJourney';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const authorizeWithPassword = (password) => {
    if (password !== EXPORT_PASSWORD) return 'Incorrect password.';
    localStorage.setItem(STORAGE_KEY, 'true');
    setUser(true);
    return null;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, authorizeWithPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
