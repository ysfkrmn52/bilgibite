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

// Firebase authentication middleware - production ready
export const authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Allow health checks without authentication
  if (req.path.includes('/health') || req.path.includes('/api/exam-categories')) {
    return next();
  }

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