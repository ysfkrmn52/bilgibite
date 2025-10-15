// Firebase Debug Utilities
export const logFirebaseConfig = () => {
  console.log('Firebase Configuration:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing', 
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing',
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    currentDomain: window.location.hostname,
    currentOrigin: window.location.origin
  });
};

export const testGoogleAuth = async () => {
  try {
    const { GoogleAuthProvider, getAuth } = await import('firebase/auth');
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    
    console.log('Google Auth Test:', {
      provider: '✓ Provider created',
      auth: '✓ Auth initialized',
      domain: window.location.hostname,
      isLocalhost: window.location.hostname === 'localhost'
    });
    
    return true;
  } catch (error) {
    console.error('Google Auth Test Failed:', error);
    return false;
  }
};