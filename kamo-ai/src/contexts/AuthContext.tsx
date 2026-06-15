import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error?.code === 'auth/cancelled-popup-request') {
        console.warn('Login popup was closed before completion.');
      } else if (error?.code === 'auth/popup-blocked') {
        alert('Login popup was blocked by your browser. Please allow popups for this site to log in.');
      } else {
        throw error;
      }
    }
  }

  async function logout() {
    await signOut(auth);
  }

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
