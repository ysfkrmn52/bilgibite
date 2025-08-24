// Production Error Monitoring and Logging Service
import { Request, Response, NextFunction } from 'express';

interface ErrorMetadata {
  userId?: string;
  endpoint?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: Date;
  requestBody?: any;
  requestParams?: any;
  stack?: string;
}

interface ErrorLog {
  id: string;
  message: string;
  level: 'error' | 'warning' | 'info';
  metadata: ErrorMetadata;
  count: number;
  lastOccurred: Date;
  resolved: boolean;
}

class ErrorMonitoringService {
  private errors: Map<string, ErrorLog> = new Map();
  private maxErrors = 1000; // Keep last 1000 unique errors

  // Generate error ID based on message and stack trace
  private generateErrorId(error: Error, req?: Request): string {
    const endpoint = req?.path || 'unknown';
    const message = error.message || 'unknown-error';
    const stack = (error.stack?.split('\n')[1]) || '';
    
    // Create hash from message + endpoint + first stack line
    return Buffer.from(`${message}-${endpoint}-${stack}`, 'utf8').toString('base64').substring(0, 16);
  }

  // Log error with metadata
  logError(error: Error, req?: Request, additionalMetadata?: any): void {
    const errorId = this.generateErrorId(error, req);
    const now = new Date();

    const metadata: ErrorMetadata = {
      userId: (req as any)?.user?.uid,
      endpoint: req?.path,
      userAgent: req?.get('User-Agent'),
      ip: req?.ip,
      timestamp: now,
      requestBody: req?.body,
      requestParams: req?.params,
      stack: error.stack,
      ...additionalMetadata
    };

    const existingError = this.errors.get(errorId);

    if (existingError) {
      // Update existing error
      existingError.count++;
      existingError.lastOccurred = now;
      existingError.metadata = { ...existingError.metadata, ...metadata };
    } else {
      // Create new error log
      const errorLog: ErrorLog = {
        id: errorId,
        message: error.message,
        level: this.determineErrorLevel(error),
        metadata,
        count: 1,
        lastOccurred: now,
        resolved: false
      };

      this.errors.set(errorId, errorLog);

      // Clean up old errors if we exceed max
      if (this.errors.size > this.maxErrors) {
        const oldestKey = this.errors.keys().next().value;
        if (oldestKey) {
          this.errors.delete(oldestKey);
        }
      }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR-${errorId}]`, error.message);
      console.error('Metadata:', JSON.stringify(metadata, null, 2));
    }

    // In production, this would send to external monitoring service
    this.sendToExternalService(errorId, error, metadata);
  }

  // Determine error severity level
  private determineErrorLevel(error: Error): 'error' | 'warning' | 'info' {
    if (error.name === 'ValidationError') return 'warning';
    if (error.name === 'NotFoundError') return 'info';
    if (error.message.includes('timeout')) return 'warning';
    if (error.message.includes('payment')) return 'error';
    if (error.message.includes('database')) return 'error';
    if (error.message.includes('auth')) return 'error';
    
    return 'error';
  }

  // Send error to external monitoring service (Sentry, DataDog, etc.)
  private sendToExternalService(errorId: string, error: Error, metadata: ErrorMetadata): void {
    // In production, integrate with services like:
    // - Sentry: Sentry.captureException(error, { contexts: { metadata } });
    // - DataDog: DD.logger.error(error.message, metadata);
    // - Custom webhook: POST to monitoring endpoint
    
    // For now, we'll just log structured JSON for analysis
    const structuredLog = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      errorId,
      message: error.message,
      stack: error.stack,
      metadata,
      environment: process.env.NODE_ENV
    };

    console.log(JSON.stringify(structuredLog));
  }

  // Get error statistics
  getErrorStats() {
    const errors = Array.from(this.errors.values());
    const totalErrors = errors.reduce((sum, err) => sum + err.count, 0);
    const uniqueErrors = errors.length;
    const recentErrors = errors.filter(err => 
      Date.now() - err.lastOccurred.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    const unresolvedErrors = errors.filter(err => !err.resolved);

    const errorsByLevel = {
      error: errors.filter(e => e.level === 'error').length,
      warning: errors.filter(e => e.level === 'warning').length,
      info: errors.filter(e => e.level === 'info').length
    };

    const topErrors = errors
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(err => ({
        id: err.id,
        message: err.message,
        count: err.count,
        lastOccurred: err.lastOccurred,
        level: err.level
      }));

    return {
      totalErrors,
      uniqueErrors,
      recentErrors: recentErrors.length,
      unresolvedErrors: unresolvedErrors.length,
      errorsByLevel,
      topErrors
    };
  }

  // Get detailed error list
  getErrors(limit = 50, level?: 'error' | 'warning' | 'info', resolved?: boolean) {
    let errors = Array.from(this.errors.values());

    if (level) {
      errors = errors.filter(err => err.level === level);
    }

    if (resolved !== undefined) {
      errors = errors.filter(err => err.resolved === resolved);
    }

    return errors
      .sort((a, b) => b.lastOccurred.getTime() - a.lastOccurred.getTime())
      .slice(0, limit);
  }

  // Mark error as resolved
  resolveError(errorId: string): boolean {
    const error = this.errors.get(errorId);
    if (error) {
      error.resolved = true;
      return true;
    }
    return false;
  }

  // Clear resolved errors
  clearResolvedErrors(): number {
    const initialSize = this.errors.size;
    const keysToDelete: string[] = [];
    
    this.errors.forEach((error, key) => {
      if (error.resolved) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.errors.delete(key));
    return initialSize - this.errors.size;
  }
}

// Export singleton instance
export const errorMonitoring = new ErrorMonitoringService();

// Express middleware for automatic error capturing
export const errorCaptureMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalEnd = res.end;
  const originalSend = res.send;

  // Capture response errors
  res.end = function(chunk?: any, encoding?: BufferEncoding) {
    if (res.statusCode >= 400) {
      const error = new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
      errorMonitoring.logError(error, req, { responseStatus: res.statusCode });
    }
    return originalEnd.call(this, chunk, encoding);
  };

  res.send = function(body?: any) {
    if (res.statusCode >= 400 && body) {
      const error = new Error(`HTTP ${res.statusCode}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
      errorMonitoring.logError(error, req, { 
        responseStatus: res.statusCode,
        responseBody: body 
      });
    }
    return originalSend.call(this, body);
  };

  next();
};

// Express error handler middleware
export const errorHandlerMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  errorMonitoring.logError(error, req);
  
  // Don't send error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    message: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  });
};

// Health check for error monitoring
export const getErrorMonitoringHealth = () => {
  const stats = errorMonitoring.getErrorStats();
  const isHealthy = stats.recentErrors < 100 && stats.unresolvedErrors < 50;
  
  return {
    status: isHealthy ? 'healthy' : 'degraded',
    stats,
    timestamp: new Date().toISOString()
  };
};