'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'chef' | 'student' | 'researcher' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('ccae_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, role: string): boolean => {
    const mockUsers = {
      chef: { email: 'chef@ccae.ai', password: 'chef123', name: 'Chef Anderson' },
      student: { email: 'student@ccae.ai', password: 'student123', name: 'Student Johnson' },
      researcher: { email: 'researcher@ccae.ai', password: 'research123', name: 'Dr. Smith' },
      admin: { email: 'admin@ccae.ai', password: 'admin123', name: 'Admin Davis' }
    };

    const mockUser = mockUsers[role as keyof typeof mockUsers];
    
    if (mockUser && mockUser.email === email && mockUser.password === password) {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: mockUser.email,
        name: mockUser.name,
        role: role as User['role']
      };

      setUser(user);
      localStorage.setItem('ccae_user', JSON.stringify(user));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ccae_user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
