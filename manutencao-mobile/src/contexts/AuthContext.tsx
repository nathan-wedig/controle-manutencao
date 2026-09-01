import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authApi } from '../api/auth';
import { storage } from '../utils/storage';
import { setLogoutHandler } from '../utils/authCallback';
import { LoginResponse } from '../types';

interface AuthContextData {
  user: LoginResponse | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    await storage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    loadStoredData();
    setLogoutHandler(() => { signOut(); });
    return () => setLogoutHandler(null);
  }, [signOut]);

  const loadStoredData = async () => {
    try {
      const token = await storage.getToken();
      const userData = await storage.getUser();
      if (token && userData) {
        setUser(userData);
      }
    } catch (e) {
      console.error('Erro ao carregar dados', e);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    await storage.setToken(response.token);
    await storage.setUser(response);
    setUser(response);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
