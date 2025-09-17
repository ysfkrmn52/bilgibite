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
import { auth, googleProvider, isFirebaseConfigured, isDemoMode } from '@/lib/firebase';
import { apiRequest } from '@/lib/queryClient';

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

  // Demo mode user for development
  const demoUser: User = {
    uid: 'demo-user-123',
    email: 'demo@bilgibite.com',
    displayName: 'Demo Kullanıcı',
    emailVerified: true,
    photoURL: null,
    phoneNumber: null,
    isAnonymous: false,
    providerId: 'firebase',
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    },
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'demo-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({})
  } as User;

  // Sync Firebase user with database
  async function syncUserWithDatabase(user: User) {
    if (!user || isDemoMode) return; // Skip sync in demo mode
    
    try {
      // Extract relevant user data
      const userData = {
        firebaseUid: user.uid,
        email: user.email || '',
        username: user.displayName || user.email?.split('@')[0] || `user_${user.uid.slice(0, 8)}`,
        role: 'user',
        subscriptionType: 'free',
        hasAiPackage: false
      };

      // Try to create or update user in database
      await apiRequest('POST', '/api/users', userData);
      console.log('✅ User synced with database:', user.uid);
    } catch (error: any) {
      // If user already exists (409) or other errors, that's ok
      if (error.message?.includes('409')) {
        console.log('ℹ️ User already exists in database:', user.uid);
      } else {
        console.warn('Failed to sync user with database:', error);
      }
    }
  }

  async function signup(email: string, password: string, displayName: string) {
    if (isDemoMode) {
      // Demo mode: simulate successful signup
      setCurrentUser({ ...demoUser, email, displayName });
      return;
    }
    
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase authentication not configured');
    }
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    await sendEmailVerification(user);
  }

  async function login(email: string, password: string) {
    if (isDemoMode) {
      // Demo mode: simulate successful login
      setCurrentUser({ ...demoUser, email });
      return;
    }
    
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase authentication not configured');
    }
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    if (isDemoMode) {
      // Demo mode: simulate successful Google login
      setCurrentUser({ ...demoUser, displayName: 'Google Demo User', email: 'google-demo@bilgibite.com' });
      return;
    }
    
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
    if (isDemoMode) {
      // Demo mode: simulate successful logout
      setCurrentUser(null);
      return;
    }
    
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
    if (isDemoMode) {
      // Demo mode: Use pure demo user, no backend login storage
      setCurrentUser(demoUser);
      setLoading(false);
      return;
    }

    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setCurrentUser(user);
      
      // Sync user with database when they sign in
      if (user) {
        await syncUserWithDatabase(user);
      }
      
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