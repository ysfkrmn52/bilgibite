// Vercel Serverless Function Entry Point
// This file imports the Express app and exports it as a Vercel serverless function
import { app } from '../server/index.js';

// Export the Express app as the default Vercel handler
export default app;
