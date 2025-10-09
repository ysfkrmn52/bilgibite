// Vercel Serverless Function Entry Point
import express, { type Request, type Response } from 'express';
import { registerRoutes } from '../server/routes.js';
import { validateEnvironmentVariables, logEnvironmentSummary } from '../server/env-validation.js';

// Validate environment
validateEnvironmentVariables();
logEnvironmentSummary();

// Create Express app
const app = express();

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Increase payload size limits
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Initialize routes (this is async but Vercel will handle it)
let routesInitialized = false;
const initPromise = registerRoutes(app).then(() => {
  routesInitialized = true;
  console.log('✅ Routes initialized for Vercel serverless');
}).catch(err => {
  console.error('❌ Route initialization failed:', err);
  throw err;
});

// Vercel serverless handler
export default async function handler(req: Request, res: Response) {
  // Wait for routes to initialize on first request
  if (!routesInitialized) {
    await initPromise;
  }
  
  // Handle the request with Express
  return app(req, res);
}
