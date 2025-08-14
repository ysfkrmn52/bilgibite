// Authentication middleware for protected routes
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        email_verified?: boolean;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Authorization header with Bearer token is required' 
      });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'Token verification failed' 
    });
  }
};

// Middleware to check if user owns the resource
export const authorizeUser = (req: Request, res: Response, next: NextFunction) => {
  const requestedUserId = req.params.userId;
  const authenticatedUserId = req.user?.uid;

  if (!authenticatedUserId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'You can only access your own data' 
    });
  }

  next();
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user has admin role (implement based on your admin system)
  // For now, we'll check a custom claim
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // This would need to be implemented with custom claims in Firebase
  // admin.auth().getUser(req.user.uid).then(userRecord => {
  //   if (userRecord.customClaims?.admin === true) {
  //     next();
  //   } else {
  //     res.status(403).json({ error: 'Admin access required' });
  //   }
  // });

  // For now, allow access - implement proper admin check
  next();
};

// Rate limiting middleware
import rateLimit from 'express-rate-limit';

export const createRateLimit = (windowMs: number, max: number) => rateLimit({
  windowMs,
  max,
  message: {
    error: 'Too many requests',
    message: `Too many requests from this IP, please try again after ${windowMs / 1000} seconds.`
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific rate limits
export const authRateLimit = createRateLimit(15 * 60 * 1000, 10); // 10 requests per 15 minutes
export const apiRateLimit = createRateLimit(60 * 1000, 500); // 500 requests per minute (development)
export const aiRateLimit = createRateLimit(60 * 1000, 50); // 50 AI requests per minute