import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, displayName: string) {
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase authentication not configured');
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    await sendEmailVerification(user);
  }

  async function login(email: string, password: string) {
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase authentication not configured');
    }
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    if (!auth || !googleProvider || !isFirebaseConfigured) {
      throw new Error('Firebase authentication not configured');
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Google giriş penceresi kapatıldı');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup engellenmiş. Lütfen tarayıcı ayarlarınızı kontrol edin');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('Domain yetkilendirilmemiş. Firebase ayarlarını kontrol edin');
      } else if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase ayarları eksik. Lütfen Firebase Console\'da Google Authentication\'ı etkinleştirin');
      }
      throw error;
    }
  }

  async function logout() {
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase authentication not configured');
    }
    await signOut(auth);
  }

  async function updateUserProfile(displayName: string, photoURL?: string) {
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase authentication not configured');
    }
    if (currentUser) {
      await updateProfile(currentUser, { displayName, photoURL });
    }
  }

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}