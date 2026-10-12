import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload, rememberMe?: boolean) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Listen for 401 unauthorized events dispatched by axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (storedToken) {
        try {
          const currentUser = await userService.getMe();
          setUser(currentUser);
          if (localStorage.getItem('token')) {
            localStorage.setItem('user', JSON.stringify(currentUser));
          } else {
            sessionStorage.setItem('user', JSON.stringify(currentUser));
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (payload: LoginPayload, rememberMe: boolean = true) => {
    setIsLoading(true);
    try {
      const authData = await authService.login(payload);
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Clear opposite storage
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('token');
      otherStorage.removeItem('user');

      storage.setItem('token', authData.token);
      storage.setItem('user', JSON.stringify(authData.user));
      setToken(authData.token);
      setUser(authData.user);
      toast.success(`Welcome back, ${authData.user.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const authData = await authService.register(payload);
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      setToken(authData.token);
      setUser(authData.user);
      toast.success('Registration successful. Welcome to Expense Tracker.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully.');
    }
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    if (localStorage.getItem('token')) {
      localStorage.setItem('user', JSON.stringify(updated));
    } else {
      sessionStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
    if (currentToken) {
      try {
        const u = await userService.getMe();
        updateUser(u);
      } catch {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
