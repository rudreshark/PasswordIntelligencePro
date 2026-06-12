import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = localStorage.getItem('passintell_user');
    if (localUser) {
      setUser(JSON.parse(localUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Demo login - just set a fake user
    const demoUser = { email, id: 'demo-123', created_at: Date.now() };
    localStorage.setItem('passintell_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const register = async (email: string, password: string) => {
    // Demo register
    const demoUser = { email, id: 'demo-123', created_at: Date.now() };
    localStorage.setItem('passintell_user', JSON.stringify(demoUser));
  };

  const verifyOtp = async (email: string, otp: string) => {
    // Demo OTP verification (any 6-digit code works)
    if (otp.length === 6) {
      const demoUser = { email, id: 'demo-123', created_at: Date.now() };
      localStorage.setItem('passintell_user', JSON.stringify(demoUser));
      setUser(demoUser);
    } else {
      throw new Error('Invalid OTP');
    }
  };

  const logout = async () => {
    localStorage.removeItem('passintell_user');
    setUser(null);
  };

  const loginWithGoogle = async () => {
    const demoUser = { email: 'demo@google.com', id: 'demo-google-123', created_at: Date.now() };
    localStorage.setItem('passintell_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  return React.createElement(AuthContext.Provider, {
    value: { user, loading, login, register, verifyOtp, logout, loginWithGoogle }
  }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
