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

// TEMP DEBUG: Log masked database URL to verify connection
const dbUrl = process.env.DATABASE_URL;
const urlParts = new URL(dbUrl);
console.log(`🔍 CONNECTING TO: ${urlParts.hostname}${urlParts.pathname}`);

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });