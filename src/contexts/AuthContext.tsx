import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  bio?: string;
  profile_photo?: string;
  cover_photo?: string;
  travel_interests?: string[];
  verified: boolean;
  locations_added: number;
  contribution_points: number;
  trust_score: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // REMOVE AUTH: Always set a mock user for development, skip backend
    setUser({
      id: 0,
      email: 'dev@bypass.com',
      full_name: 'Dev Bypass',
      verified: true,
      locations_added: 0,
      contribution_points: 0,
      trust_score: 100,
      created_at: new Date().toISOString(),
    });
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
  };

  const register = async (data: any) => {
    const response = await apiClient.register(data);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
