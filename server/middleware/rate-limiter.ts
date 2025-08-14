import type { Request, Response, NextFunction } from 'express';

interface RateLimit {
  requests: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimit>();

export const rateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'anonymous';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, limit] of rateLimitStore.entries()) {
      if (limit.resetTime < windowStart) {
        rateLimitStore.delete(key);
      }
    }
    
    const currentLimit = rateLimitStore.get(clientId);
    
    if (!currentLimit) {
      // First request from this client
      rateLimitStore.set(clientId, {
        requests: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (currentLimit.resetTime < now) {
      // Window has expired, reset
      rateLimitStore.set(clientId, {
        requests: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (currentLimit.requests >= maxRequests) {
      // Rate limit exceeded
      return res.status(429).json({
        success: false,
        message: 'Too many requests',
        retryAfter: Math.ceil((currentLimit.resetTime - now) / 1000)
      });
    }
    
    // Increment request count
    currentLimit.requests++;
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - currentLimit.requests).toString(),
      'X-RateLimit-Reset': Math.ceil(currentLimit.resetTime / 1000).toString()
    });
    
    next();
  };
};

// Pre-configured rate limiters for different use cases
export const strictRateLimiter = rateLimiter(15 * 60 * 1000, 10); // 10 requests per 15 minutes
export const moderateRateLimiter = rateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const apiRateLimiter = rateLimiter(60 * 1000, 1000); // 1000 requests per minute

// Default export
export default moderateRateLimiter;