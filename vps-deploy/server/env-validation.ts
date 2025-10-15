/**
 * Environment Variable Validation System
 * Implements fail-fast principle to catch missing configuration at startup
 * instead of runtime failures in production.
 */

interface EnvironmentConfig {
  required: string[];
  optional: string[];
  productionRequired: string[];
  sensitive: string[];
  frontendRequired: string[];
  paymentOptional: string[];
  analyticsOptional: string[];
}

const ENV_CONFIG: EnvironmentConfig = {
  // Always required environment variables
  required: [
    'DATABASE_URL',
    'ANTHROPIC_API_KEY',
    'FIREBASE_SERVICE_ACCOUNT_KEY',
    'VITE_FIREBASE_PROJECT_ID',
  ],
  
  // Additional variables required only in production
  productionRequired: [
    'NODE_ENV',
  ],

  // Frontend Firebase variables (required for client-side Firebase)
  frontendRequired: [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_APP_ID',
  ],
  
  // Optional payment service variables
  paymentOptional: [
    'IYZICO_API_KEY',
    'IYZICO_SECRET_KEY', 
    'VITE_STRIPE_PUBLIC_KEY',
    'OPENAI_API_KEY', // Alternative AI service
  ],

  // Optional analytics and monitoring variables
  analyticsOptional: [
    'VITE_GA_MEASUREMENT_ID',
    'VITE_CLARITY_ID',
    'VITE_YANDEX_METRIKA_ID', 
    'VITE_FACEBOOK_PIXEL_ID',
    'VITE_SENTRY_DSN',
    'VITE_LOGROCK_APP_ID',
    'VITE_VAPID_PUBLIC_KEY',
  ],
  
  // Optional infrastructure and configuration variables
  optional: [
    'PORT', // defaults to 5000
    'CLIENT_URL', // Used in email service (defaults to FRONTEND_URL or localhost)
    'FRONTEND_URL', // Frontend URL for CORS and email links (auto-detected)
    'NEON_WS_PROXY', // for Neon WebSocket proxy
    'REPL_SLUG', // for Replit domain support
    'REPL_OWNER', // for Replit domain support  
    'ALLOWED_ORIGINS', // for CORS configuration
    'AWS_S3_BUCKET', // for file storage
    'SLACK_WEBHOOK_URL', // for notifications
    'NOTIFICATION_EMAIL', // for admin notifications
    'VITE_API_BASE_URL', // for API base URL override
    'VITE_CDN_URL', // for CDN configuration
    'VITE_ENABLE_AI_FEATURES', // feature flags
    'VITE_ENABLE_OFFLINE_MODE',
    'VITE_ENABLE_PUSH_NOTIFICATIONS',
    'VITE_APP_ENV',
    'VITE_APP_VERSION',
    'VITE_TURKISH_BANK_INTEGRATION',
    'VITE_STUDENT_VERIFICATION_API',
    'VITE_ENABLE_DEMO_MODE',
  ],
  
  // Sensitive variables that should be masked in logs (deprecated - now using pattern-based)
  sensitive: [
    'DATABASE_URL',
    'ANTHROPIC_API_KEY', 
    'FIREBASE_SERVICE_ACCOUNT_KEY',
    'IYZICO_SECRET_KEY',
    'OPENAI_API_KEY',
  ]
};

/**
 * Pattern for automatically detecting sensitive environment variables
 */
const SENSITIVE_PATTERN = /(KEY|SECRET|TOKEN|PASSWORD|PRIVATE|API|CREDENTIAL)/i;

/**
 * Masks sensitive environment variable values for safe logging
 * Uses both explicit list and pattern-based detection for security
 */
function maskSensitiveValue(key: string, value: string): string {
  // Check both explicit sensitive list AND pattern-based detection
  const isExplicitlySensitive = ENV_CONFIG.sensitive.includes(key);
  const isPatternSensitive = SENSITIVE_PATTERN.test(key);
  
  if (!isExplicitlySensitive && !isPatternSensitive) {
    return value;
  }
  
  // Show first 4 and last 4 characters for readability
  if (value.length <= 8) {
    return '*'.repeat(value.length);
  }
  
  return `${value.slice(0, 4)}${'*'.repeat(value.length - 8)}${value.slice(-4)}`;
}

/**
 * Determines if a variable is sensitive for masking
 */
function isSensitiveVariable(key: string): boolean {
  return ENV_CONFIG.sensitive.includes(key) || SENSITIVE_PATTERN.test(key);
}

/**
 * Validates all environment variables and fails fast if any required ones are missing
 */
export function validateEnvironmentVariables(): void {
  console.log('🔍 Validating environment variables...');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const missing: string[] = [];
  const available: Array<{key: string, value: string, masked: boolean}> = [];
  
  // Check required variables
  const requiredVars = [
    ...ENV_CONFIG.required,
    ...(isProduction ? ENV_CONFIG.productionRequired : []),
    ...ENV_CONFIG.frontendRequired // Always check frontend Firebase vars
  ];
  
  requiredVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      missing.push(envVar);
    } else {
      available.push({
        key: envVar,
        value: maskSensitiveValue(envVar, value),
        masked: isSensitiveVariable(envVar)
      });
    }
  });
  
  // Check and log available optional variables (all categories)
  const allOptionalVars = [
    ...ENV_CONFIG.optional,
    ...ENV_CONFIG.paymentOptional,
    ...ENV_CONFIG.analyticsOptional
  ];
  
  allOptionalVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value && value.trim() !== '') {
      available.push({
        key: envVar,
        value: maskSensitiveValue(envVar, value),
        masked: isSensitiveVariable(envVar)
      });
    }
  });
  
  // Log available environment variables
  if (available.length > 0) {
    console.log('✅ Available environment variables:');
    available.forEach(({key, value, masked}) => {
      const indicator = masked ? ' (masked)' : '';
      console.log(`   ${key}=${value}${indicator}`);
    });
  }
  
  // Fail fast if any required variables are missing
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(envVar => {
      console.error(`   - ${envVar}`);
    });
    
    console.error('\n💡 Environment Setup Guide:');
    console.error('   1. DATABASE_URL: Provision database in Replit or set connection string');
    console.error('   2. ANTHROPIC_API_KEY: Get API key from https://console.anthropic.com/');
    console.error('   3. FIREBASE_SERVICE_ACCOUNT_KEY: JSON string of Firebase service account');
    console.error('   4. VITE_FIREBASE_PROJECT_ID: Firebase project ID');
    console.error('   5. VITE_FIREBASE_API_KEY: Firebase web API key');
    console.error('   6. VITE_FIREBASE_APP_ID: Firebase app ID');
    
    if (isProduction) {
      console.error('   7. CLIENT_URL: Frontend URL for email links');
      console.error('   8. FRONTEND_URL: Frontend URL for CORS configuration');
      console.error('   9. NODE_ENV: Set to "production" for production builds');
    }
    
    console.error('\n📋 Optional Setup (for full functionality):');
    console.error('   • Payment: IYZICO_API_KEY, IYZICO_SECRET_KEY, VITE_STRIPE_PUBLIC_KEY');
    console.error('   • Analytics: VITE_GA_MEASUREMENT_ID, VITE_CLARITY_ID');
    console.error('   • Infrastructure: ALLOWED_ORIGINS, AWS_S3_BUCKET');
    
    console.error('\n🚫 Server startup aborted due to missing environment variables.');
    console.error('   Configure the missing variables and restart the application.');
    
    process.exit(1);
  }
  
  // Validation for specific variable formats
  validateSpecificFormats();
  
  console.log(`✅ Environment validation passed (${available.length} variables configured)`);
  console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
}

/**
 * Validates specific environment variable formats
 */
function validateSpecificFormats(): void {
  // Validate Firebase Service Account Key format
  const firebaseKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (firebaseKey) {
    try {
      const parsed = JSON.parse(firebaseKey);
      if (!parsed.project_id || !parsed.private_key || !parsed.client_email) {
        throw new Error('Invalid Firebase service account format');
      }
    } catch (error) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON or missing required fields');
      console.error('   Required fields: project_id, private_key, client_email');
      process.exit(1);
    }
  }
  
  // Validate DATABASE_URL format - MySQL support
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const validProtocols = ['mysql://', 'postgres://', 'postgresql://'];
    const hasValidProtocol = validProtocols.some(protocol => databaseUrl.startsWith(protocol));
    if (!hasValidProtocol) {
      console.warn('⚠️  DATABASE_URL should start with mysql://, postgres://, or postgresql://');
    }
  }
  
  // Validate PORT if provided
  const port = process.env.PORT;
  if (port && (isNaN(Number(port)) || Number(port) <= 0 || Number(port) > 65535)) {
    console.error('❌ PORT must be a valid port number between 1 and 65535');
    process.exit(1);
  }

  // Validate URL formats (CLIENT_URL, FRONTEND_URL, etc.)
  const urlVariables = ['CLIENT_URL', 'FRONTEND_URL', 'VITE_API_BASE_URL', 'VITE_CDN_URL'];
  urlVariables.forEach(varName => {
    const url = process.env[varName];
    if (url) {
      try {
        new URL(url);
      } catch (error) {
        console.error(`❌ ${varName} is not a valid URL: ${url}`);
        console.error('   URL must include protocol (http:// or https://)');
        process.exit(1);
      }
    }
  });

  // Validate CSV format (ALLOWED_ORIGINS)
  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  if (allowedOrigins) {
    const origins = allowedOrigins.split(',').map(origin => origin.trim());
    const invalidOrigins = origins.filter(origin => {
      if (origin === '*') return false; // Allow wildcard
      try {
        new URL(origin);
        return false;
      } catch {
        return true;
      }
    });
    
    if (invalidOrigins.length > 0) {
      console.error('❌ ALLOWED_ORIGINS contains invalid URLs:');
      invalidOrigins.forEach(origin => console.error(`   - ${origin}`));
      console.error('   Format: "https://domain1.com,https://domain2.com" or "*"');
      process.exit(1);
    }
  }

  // Validate email format (NOTIFICATION_EMAIL)
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  if (notificationEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notificationEmail)) {
      console.error(`❌ NOTIFICATION_EMAIL is not a valid email address: ${notificationEmail}`);
      process.exit(1);
    }
  }
}

/**
 * Logs environment summary for debugging
 */
export function logEnvironmentSummary(): void {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const port = process.env.PORT || '5000';
  
  console.log('\n📊 Environment Summary:');
  console.log(`   Node Environment: ${nodeEnv}`);
  console.log(`   Server Port: ${port}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   AI Service (Anthropic): ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   AI Service (OpenAI): ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Firebase Backend: ${process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Firebase Frontend: ${process.env.VITE_FIREBASE_API_KEY && process.env.VITE_FIREBASE_APP_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Payment (İyzico): ${process.env.IYZICO_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Payment (Stripe): ${process.env.VITE_STRIPE_PUBLIC_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Analytics: ${process.env.VITE_GA_MEASUREMENT_ID ? '✅ Configured' : '❌ Not configured'}`);
}