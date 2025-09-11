import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// DEBUG: Temporarily log masked DATABASE_URL to verify which endpoint we're connecting to
const dbUrl = process.env.DATABASE_URL;
const urlParts = new URL(dbUrl);
console.log(`🔍 DEBUG: Connecting to database host: ${urlParts.hostname}, database: ${urlParts.pathname}`);

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });