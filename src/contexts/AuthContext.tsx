import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

interface MockUser {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: MockUser | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    // Check localStorage for a mock session
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchProfile(parsedUser.uid);
    }
    setLoading(false);
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  const login = async (email: string, _password: string) => {
    // Simulate a minor delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real mock, we could validate credentials here
    // For now, let's just create a consistent ID from the email
    const uid = 'mock_' + btoa(email).substring(0, 10);
    const mockUser = { 
      uid, 
      email, 
      displayName: email.split('@')[0], 
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` 
    };
    
    setUser(mockUser);
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    await fetchProfile(uid);
  };

  const signup = async (email: string, _password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const uid = 'mock_' + btoa(email).substring(0, 10);
    const mockUser = { 
      uid, 
      email, 
      displayName: email.split('@')[0], 
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` 
    };
    
    setUser(mockUser);
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    setProfile(null); // Force onboarding for new signup
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, login, signup, logout }}>
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
