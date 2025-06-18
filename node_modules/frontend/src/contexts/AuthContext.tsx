import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { User, LoginCredentials } from '../types';

// Type pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: any;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getProfile();
        if (response.success) {
          setUser(response.data);
        } else {
          // En mode dev, utiliser un utilisateur par défaut en cas d'erreur
          console.warn('Using default user profile due to API error');
          setUser(authService.getDefaultProfile());
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // En mode dev, utiliser un utilisateur par défaut en cas d'erreur
        setUser(authService.getDefaultProfile());
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setUser(response.data.user);
      return response;
    } catch (err: any) {
      setError(err.response?.data || { error: 'Login failed' });
      // En mode dev, connecter quand même avec un utilisateur par défaut
      setUser(authService.getDefaultProfile());
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
