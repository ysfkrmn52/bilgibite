import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import AutoGenerationScheduler from "./auto-generation-scheduler";
import { validateEnvironmentVariables, logEnvironmentSummary } from "./env-validation";
import { autoMigrate } from "./migrations";

const app = express();

// Trust proxy for rate limiting in cloud environments
app.set('trust proxy', 1);

// Increase payload size limits to 100MB - MUST be before any route registration
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.raw({ limit: '100mb' }));
app.use(express.text({ limit: '100mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Global scheduler instance - will be initialized after storage is ready
let globalScheduler: AutoGenerationScheduler | null = null;

// Process cleanup handlers
const cleanup = async () => {
  console.log('🧹 Server cleanup started...');
  
  // Access the scheduler from global namespace (set in routes.ts)
  const scheduler = (global as any).autoGenerationScheduler;
  if (scheduler && typeof scheduler === 'object' && 'cleanup' in scheduler) {
    try {
      await scheduler.cleanup();
      console.log('🤖 Scheduler cleanup completed');
    } catch (error) {
      console.error('❌ Scheduler cleanup error:', error);
    }
  }
  
  console.log('✅ Server cleanup completed');
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  cleanup();
});

(async () => {
  // Validate environment variables before any initialization
  // Implements fail-fast principle to catch configuration issues at startup
  validateEnvironmentVariables();
  logEnvironmentSummary();

  // Run database migrations automatically before starting the server
  // This ensures the database schema is up-to-date on startup
  try {
    log('🔄 Starting database migration check...');
    await autoMigrate();
    log('✅ Database migrations completed successfully');
  } catch (error: any) {
    log(`❌ Migration failed: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      // In production, migration failures should stop the server
      console.error('💥 Critical migration failure in production. Server startup aborted.');
      process.exit(1);
    } else {
      // In development, log warning but continue
      log('⚠️  Development mode: Server will continue despite migration failure');
    }
  }

  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // API-first guard: Catch unmatched /api/* requests before serveStatic's catch-all
    // This prevents the static catch-all from serving index.html for API routes
    app.use("/api", (req, res) => {
      res.status(404).json({ error: "API endpoint not found" });
    });
    serveStatic(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Server error:', err);
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // Only start the server if not running in serverless environment (Vercel)
  if (!process.env.VERCEL) {
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  }
})();

// Export the Express app for Vercel serverless deployment
export { app };
