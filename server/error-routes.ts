// Error reporting and monitoring endpoints
import type { Express, Request, Response } from "express";

export function registerErrorRoutes(app: Express): void {
  
  // Client-side error reporting endpoint
  app.post('/api/errors', async (req: Request, res: Response) => {
    try {
      const errorReport = req.body;
      
      // Log the error
      console.error('Client Error Report:', {
        message: errorReport.message,
        stack: errorReport.stack,
        url: errorReport.url,
        userAgent: errorReport.userAgent,
        timestamp: errorReport.timestamp,
        userId: errorReport.userId,
        severity: errorReport.severity,
        context: errorReport.context
      });

      // In production, send to error monitoring service (Sentry, etc.)
      // await sendToErrorMonitoringService(errorReport);

      res.json({ success: true, message: 'Error report received' });
    } catch (error) {
      console.error('Error processing error report:', error);
      res.status(500).json({ success: false, error: 'Failed to process error report' });
    }
  });

  // Application health check endpoint
  app.get('/health', async (req: Request, res: Response) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: 'healthy', // Add actual database health check
          redis: 'healthy',    // Add actual Redis health check if used
          external_apis: 'healthy' // Add external service checks
        }
      };

      res.json(healthStatus);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  // Performance metrics endpoint
  app.get('/api/metrics', async (req: Request, res: Response) => {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        // Add more custom metrics as needed
        activeConnections: 0, // Track active connections if needed
        requestCount: 0,      // Track total requests if needed
        averageResponseTime: 0 // Track average response time if needed
      };

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get metrics' });
    }
  });
}