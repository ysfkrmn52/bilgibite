import type { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../firebase-admin';

interface AuthenticatedUser {
  uid: string;
  email?: string;
  role?: string;
  organizationId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Production-safe authentication middleware that switches between demo and Firebase based on environment
export const authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDemoMode = process.env.ENABLE_DEMO_MODE === 'true' && !isProduction;
  
  // Allow health checks without authentication
  if (req.path.includes('/health') || req.path.includes('/api/exam-categories')) {
    return next();
  }

  // In production or when Firebase is configured, use Firebase authentication
  if (isProduction || (!isDemoMode && process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) {
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
      
      // Map Firebase user to our user interface
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
        organizationId: decodedToken.organizationId
      };
      
      next();
    } catch (error) {
      console.error('Firebase auth middleware error:', error);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token'
      });
    }
  } else {
    // Demo mode for development
    console.log('🚨 Demo mode active - using mock authentication');
    req.user = {
      uid: 'demo-user-123',
      email: 'demo@bilgibite.com',
      role: 'user',
      organizationId: 'demo-org-123'
    };
    next();
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

export const requireOrganization = (req: Request, res: Response, next: NextFunction) => {
  const organizationId = req.params.orgId || req.user?.organizationId;
  
  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID required'
    });
  }
  
  // In production, verify user has access to this organization
  next();
};