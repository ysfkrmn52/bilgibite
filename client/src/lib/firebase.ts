import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

// Check if Firebase environment variables are available
const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                          import.meta.env.VITE_FIREBASE_PROJECT_ID && 
                          import.meta.env.VITE_FIREBASE_APP_ID;

// Production/Demo mode configuration - use environment variables to control
const isProduction = import.meta.env.PROD;
const isDemoModeEnabled = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

// Only enable demo mode when explicitly set AND not in production
const isDevelopment = !isProduction && isDemoModeEnabled;

const firebaseConfig = hasFirebaseConfig && !isDevelopment ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} : null;

// Initialize Firebase only if config is available
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;

// Initialize Firebase Authentication and get a reference to the service
export const auth = app ? getAuth(app) : null;

// Auth providers - only initialize if Firebase is available
export const googleProvider = app ? (() => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/userinfo.email');
  provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  return provider;
})() : null;

// Facebook Auth Provider setup
import { FacebookAuthProvider } from "firebase/auth";
export const facebookProvider = app ? (() => {
  const provider = new FacebookAuthProvider();
  provider.addScope('email');
  provider.addScope('public_profile');
  provider.setCustomParameters({
    'display': 'popup'
  });
  return provider;
})() : null;

// Export config status for components to check
export const isFirebaseConfigured = hasFirebaseConfig && !isDevelopment;
export const isDemoMode = isDevelopment;

export default app;