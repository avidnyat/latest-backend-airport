
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signIn, signUp, signOut, getCurrentUser, getStoredSession, isSessionValid } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
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

  const isAuthenticated = !!user;

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const initializeAuth = async () => {
    console.log('Initializing authentication...');
    setIsLoading(true);
    
    try {
      // First check if we have a valid stored session
      const storedSession = getStoredSession();
      
      if (storedSession && isSessionValid()) {
        console.log('Found valid stored session, setting user:', storedSession.user);
        setUser(storedSession.user);
      } else {
        console.log('No valid stored session found');
        // Try to get current user from server to verify session
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log('Server confirmed valid session, setting user:', currentUser);
          setUser(currentUser);
        } else {
          console.log('No valid session on server');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error during auth initialization:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: signedInUser } = await signIn(email, password);
      setUser(signedInUser);
      console.log('User signed in successfully:', signedInUser);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, fullName: string, role: string = 'staff') => {
    setIsLoading(true);
    try {
      const { user: signedUpUser } = await signUp(email, password, fullName, role);
      setUser(signedUpUser);
      console.log('User signed up successfully:', signedUpUser);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        console.log('User refreshed successfully:', currentUser);
      } else {
        setUser(null);
        console.log('No user found during refresh');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshUser,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
