'use client';

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import { useRouter } from 'next/navigation';
import { 
  BusinessUser, 
  login as loginService, 
  register as registerService,
  getCurrentUser,
  logout as logoutService
} from './authService';

interface AuthContextType {
  user: BusinessUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string, email: string, password: string, businessName: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // Login function
  // Replace the login function with this:
// Replace the login function with this:
const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
        const userData = await loginService(email, password);
        setUser(userData);
        return userData;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    } finally {
        setIsLoading(false);
    }
};

// Replace the register function with this:
const register = async (userData: { name: string, email: string, password: string, businessName: string }) => {
    setIsLoading(true);
    try {
        const newUser = await registerService(userData);
        setUser(newUser);
        return newUser;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    } finally {
        setIsLoading(false);
    }
};

// Replace the logout function with this:
const logout = () => {
    logoutService();
    setUser(null);
    router.push('/login');
};

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}