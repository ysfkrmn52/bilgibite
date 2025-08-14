import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

export const securityMiddleware = [
  // Basic security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
        mediaSrc: ["'self'", "https:"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
  
  // Input sanitization
  (req: Request, res: Response, next: NextFunction) => {
    // Basic input sanitization
    if (req.body) {
      sanitizeObject(req.body);
    }
    if (req.query) {
      sanitizeObject(req.query);
    }
    if (req.params) {
      sanitizeObject(req.params);
    }
    next();
  },
  
  // Enterprise security features
  (req: Request, res: Response, next: NextFunction) => {
    // Add security event logging
    if (req.path.includes('/api/enterprise/') || req.path.includes('/api/admin/')) {
      console.log(`[SECURITY] Enterprise API access: ${req.method} ${req.path} by ${req.user?.uid || 'anonymous'}`);
    }
    
    // Add audit trail for sensitive operations
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.path.includes('/api/')) {
      // Log audit event (would integrate with audit logging service)
      console.log(`[AUDIT] ${req.method} ${req.path} by ${req.user?.uid || 'anonymous'}`);
    }
    
    next();
  }
];

function sanitizeObject(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return;
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Basic XSS prevention
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
}