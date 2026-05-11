import React, { createContext, useState, useContext, useEffect } from 'react';
import { api, auth } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (auth.isAuthenticated()) {
        try {
          const userData = await api.get('/auth/me');
          setUser(userData);
        } catch (err) {
          auth.logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    // Ahora data = { token, usuario: {...} }
    auth.login(data.token, data.usuario);
    setUser(data.usuario);
    return data;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);