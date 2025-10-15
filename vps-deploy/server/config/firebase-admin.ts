// Firebase Admin SDK configuration for server-side auth
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
  } else if (process.env.NODE_ENV === 'development') {
    // For development, you can use application default credentials
    console.warn('Firebase Admin: Using application default credentials');
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
  } else {
    throw new Error('Firebase service account key is required for production');
  }
}

export const auth = admin.auth;
export const firestore = admin.firestore;

// Helper functions for user management
export const verifyIdToken = async (idToken: string) => {
  try {
    const decodedToken = await auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

export const getUserByUid = async (uid: string) => {
  try {
    const userRecord = await auth().getUser(uid);
    return userRecord;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

export const createCustomToken = async (uid: string, additionalClaims?: object) => {
  try {
    const customToken = await auth().createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    throw new Error(`Failed to create custom token: ${error.message}`);
  }
};

export const setCustomUserClaims = async (uid: string, customClaims: object) => {
  try {
    await auth().setCustomUserClaims(uid, customClaims);
  } catch (error) {
    throw new Error(`Failed to set custom claims: ${error.message}`);
  }
};