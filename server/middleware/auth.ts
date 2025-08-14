import type { Request, Response, NextFunction } from 'express';

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

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Demo mode authentication - in production, this would verify JWT tokens
  const authHeader = req.headers.authorization;
  
  if (!authHeader && req.path.includes('/api/system/health')) {
    // Allow health checks without authentication
    return next();
  }

  // Mock authentication for development
  req.user = {
    uid: 'demo-user-123',
    email: 'demo@bilgibite.com',
    role: 'teacher',
    organizationId: 'demo-org-123'
  };

  next();
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