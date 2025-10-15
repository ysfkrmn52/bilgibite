// Firebase Admin SDK Configuration for Production
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminFirestore: Firestore | null = null;

// Firebase Admin SDK yapılandırması
export function initializeFirebaseAdmin(): { app: App; auth: Auth; firestore: Firestore } {
  if (adminApp && adminAuth && adminFirestore) {
    return { app: adminApp, auth: adminAuth, firestore: adminFirestore };
  }

  try {
    // Service Account Key'i environment variable'dan al
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required for Firebase Admin SDK'
      );
    }

    // JSON string'i parse et
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch (parseError) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON. Check the format of your service account key.'
      );
    }

    // Firebase Admin SDK'yı başlat
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
      databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
    });

    adminAuth = getAuth(adminApp);
    adminFirestore = getFirestore(adminApp);

    console.log('✅ Firebase Admin SDK successfully initialized');
    console.log(`📊 Project ID: ${serviceAccount.project_id}`);

    return { app: adminApp, auth: adminAuth, firestore: adminFirestore };

  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
    throw error;
  }
}

// Token doğrulama için helper function
export async function verifyFirebaseToken(idToken: string): Promise<any> {
  try {
    const { auth } = initializeFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
}

// User oluşturma helper function
export async function createFirebaseUser(userData: {
  email: string;
  password: string;
  displayName?: string;
  emailVerified?: boolean;
  disabled?: boolean;
}) {
  try {
    const { auth } = initializeFirebaseAdmin();
    const userRecord = await auth.createUser(userData);
    console.log('Successfully created new user:', userRecord.uid);
    return userRecord;
  } catch (error) {
    console.error('Error creating new user:', error);
    throw error;
  }
}

// User güncelleme helper function
export async function updateFirebaseUser(uid: string, updates: {
  email?: string;
  displayName?: string;
  emailVerified?: boolean;
  disabled?: boolean;
  customClaims?: Record<string, any>;
}) {
  try {
    const { auth } = initializeFirebaseAdmin();
    
    // Custom claims ayrı işlem
    if (updates.customClaims) {
      await auth.setCustomUserClaims(uid, updates.customClaims);
      delete updates.customClaims;
    }
    
    // Diğer updates
    if (Object.keys(updates).length > 0) {
      const userRecord = await auth.updateUser(uid, updates);
      console.log('Successfully updated user:', userRecord.uid);
      return userRecord;
    }
    
    return await auth.getUser(uid);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// User silme helper function
export async function deleteFirebaseUser(uid: string) {
  try {
    const { auth } = initializeFirebaseAdmin();
    await auth.deleteUser(uid);
    console.log('Successfully deleted user:', uid);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Bulk user operations
export async function listFirebaseUsers(maxResults = 1000, nextPageToken?: string) {
  try {
    const { auth } = initializeFirebaseAdmin();
    const listUsersResult = await auth.listUsers(maxResults, nextPageToken);
    return listUsersResult;
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

// Custom claims yönetimi
export async function setUserRole(uid: string, role: 'user' | 'admin' | 'super_admin') {
  try {
    const { auth } = initializeFirebaseAdmin();
    await auth.setCustomUserClaims(uid, { role });
    console.log(`Successfully set role '${role}' for user:`, uid);
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
}

// Email verification
export async function generateEmailVerificationLink(email: string) {
  try {
    const { auth } = initializeFirebaseAdmin();
    const link = await auth.generateEmailVerificationLink(email);
    return link;
  } catch (error) {
    console.error('Error generating email verification link:', error);
    throw error;
  }
}

// Password reset link
export async function generatePasswordResetLink(email: string) {
  try {
    const { auth } = initializeFirebaseAdmin();
    const link = await auth.generatePasswordResetLink(email);
    return link;
  } catch (error) {
    console.error('Error generating password reset link:', error);
    throw error;
  }
}

// Firestore operations helper
export async function saveUserToFirestore(uid: string, userData: any) {
  try {
    const { firestore } = initializeFirebaseAdmin();
    await firestore.collection('users').doc(uid).set({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    console.log('User data saved to Firestore:', uid);
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw error;
  }
}

// Health check for Firebase Admin
export function getFirebaseAdminHealth() {
  try {
    const isInitialized = adminApp !== null && adminAuth !== null;
    return {
      status: isInitialized ? 'healthy' : 'not_initialized',
      app: adminApp ? 'initialized' : 'not_initialized',
      auth: adminAuth ? 'initialized' : 'not_initialized',
      firestore: adminFirestore ? 'initialized' : 'not_initialized',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// Express middleware for Firebase token verification
export const firebaseAuthMiddleware = async (req: any, res: any, next: any) => {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }

    const idToken = authorization.split(' ')[1];
    const decodedToken = await verifyFirebaseToken(idToken);
    
    // User bilgilerini request'e ekle
    req.user = decodedToken;
    req.uid = decodedToken.uid;
    
    next();
  } catch (error) {
    console.error('Firebase auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token'
    });
  }
};

// Admin role check middleware
export const requireAdminRole = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.role || !['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin role required'
    });
  }
  next();
};

// Super admin role check middleware
export const requireSuperAdminRole = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.role || req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Super admin role required'
    });
  }
  next();
};