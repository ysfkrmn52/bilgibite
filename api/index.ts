// Vercel Serverless Function Entry Point
import '../server/index.js';

export default function handler(req: any, res: any) {
  // Vercel will automatically handle this
  return res.status(200).json({ message: 'API is running' });
}
