import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import backend from '~backend/client';
import type { User } from '~backend/auth/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth-token');
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const authData = await backend.auth.verify({
        authorization: `Bearer ${tokenToVerify}`,
      });
      
      // Construct user object from auth data
      const userData: User = {
        id: parseInt(authData.userID),
        email: authData.email,
        role: authData.role,
        created_at: new Date(), // This would normally come from the token or another API call
      };
      
      setUser(userData);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth-token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await backend.auth.login({ email, password });
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('auth-token', response.token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth-token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
