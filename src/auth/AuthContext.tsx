import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth } from '../firebaseConfig'; // VERIFIED PATH
import { type User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; // Added type User, createUserWithEmailAndPassword, signInWithEmailAndPassword

interface AuthContextType {
  currentUser: User | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>; // ADDED signup
  login: (email: string, password: string) => Promise<void>; // ADDED login (email/password)
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("Google Sign-In successful!");
    } catch (error) {
      console.error("Error logging in with Google:", error);
      throw error; // Re-throw for error handling in components
    }
  };

  // Added email/password signup function
  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  // Added email/password login function
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error logging in with email/password:", error);
      throw error;
    }
  };


  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error; // Re-throw for error handling in components
    }
  };

  return (
   <AuthContext.Provider value={{
    currentUser,
    login,
    logout,
    signup, // Assuming you have a signup function
    signInWithGoogle, // <--- THIS MUST BE signInWithGoogle
    loading
}}>
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
