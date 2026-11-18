import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, storage } from '../api/client';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isLoading: boolean;
  loginCustomer: (email: string, pass: string) => Promise<any>;
  registerCustomer: (params: any) => Promise<any>;
  loginPandit: (email: string, pass: string) => Promise<any>;
  registerPandit: (params: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setRole(storedUser.role);
      }
    } catch (e) {
      console.warn('Failed to restore session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const handleLoginCustomer = async (email: string, pass: string) => {
    const res = await api.loginCustomer(email, pass);
    setUser(res.user);
    setRole(res.user.role);
    setToken(res.token);
    return res;
  };

  const handleRegisterCustomer = async (params: any) => {
    const res = await api.registerCustomer(params);
    setUser(res.user);
    setRole(res.user.role);
    setToken(res.token);
    return res;
  };

  const handleLoginPandit = async (email: string, pass: string) => {
    const res = await api.loginPandit(email, pass);
    setUser(res.user);
    setRole(res.user.role);
    setToken(res.token);
    return res;
  };

  const handleRegisterPandit = async (params: any) => {
    const res = await api.registerPandit(params);
    setUser(res.user);
    setRole(res.user.role);
    setToken(res.token);
    return res;
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setRole(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getMe();
      if (res) {
        setUser(res);
        setRole(res.role);
        await storage.setUser(res);
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        loginCustomer: handleLoginCustomer,
        registerCustomer: handleRegisterCustomer,
        loginPandit: handleLoginPandit,
        registerPandit: handleRegisterPandit,
        logout: handleLogout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
