import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

// Neon WebSocket SSL konfigürasyonu
neonConfig.webSocketConstructor = ws;
neonConfig.wsProxy = process.env.NEON_WS_PROXY; // Proxy desteği
neonConfig.useSecureWebSocket = true; // Güvenli WebSocket

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// TEMP DEBUG: Log masked database URL to verify connection
const dbUrl = process.env.DATABASE_URL;
const urlParts = new URL(dbUrl);
console.log(`🔍 CONNECTING TO: ${urlParts.hostname}${urlParts.pathname}`);

// Neon SSL bağlantısı için connection string'e sslmode ekle
const sslEnabledUrl = dbUrl.includes('?') 
  ? `${dbUrl}&sslmode=require` 
  : `${dbUrl}?sslmode=require`;

// Güvenli Neon SSL konfigürasyonu - sadece sslmode=require yeterli
export const pool = new Pool({ 
  connectionString: sslEnabledUrl
});
export const db = drizzle({ client: pool, schema });