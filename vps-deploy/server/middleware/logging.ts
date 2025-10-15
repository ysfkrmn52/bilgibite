import type { Request, Response, NextFunction } from 'express';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')?.substring(0, 100) || '',
      timestamp: new Date().toISOString()
    };
    
    // Log to console (in production, this would go to a logging service)
    console.log(`Request: ${JSON.stringify(logData)}`);
    
    // Call original json method
    return originalJson.call(this, body);
  };
  
  next();
};