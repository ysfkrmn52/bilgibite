import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

export class MigrationService {
  private readonly isProduction: boolean;
  private readonly migrationsDir: string;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.migrationsDir = join(projectRoot, 'migrations');
  }

  /**
   * Logs migration-related messages with timestamp
   */
  private log(message: string, level: 'info' | 'error' | 'warn' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🔄';
    console.log(`${prefix} [${timestamp}] Migration: ${message}`);
  }

  /**
   * Executes a shell command with proper error handling
   */
  private async executeCommand(command: string, description: string, timeoutMs: number = 15000): Promise<string> {
    this.log(`Starting: ${description}`);
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: projectRoot,
        timeout: timeoutMs, // Default 15 seconds, configurable
        env: { ...process.env },
        // Ensure non-interactive mode
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      if (stderr && !stderr.includes('warn') && !stderr.includes('No schema changes detected')) {
        this.log(`Warning during ${description}: ${stderr}`, 'warn');
      }
      
      this.log(`Completed: ${description}`);
      return stdout;
    } catch (error: any) {
      let errorMessage = `Failed during ${description}`;
      
      if (error.code === 'ETIMEOUT') {
        errorMessage += ` (timeout after ${timeoutMs}ms)`;
      } else if (error.signal === 'SIGTERM') {
        errorMessage += ' (process terminated)';
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      this.log(errorMessage, 'error');
      
      // In development, provide more helpful error context
      if (!this.isProduction && error.code === 'ETIMEOUT') {
        this.log(`Command that timed out: ${command}`, 'error');
        this.log('This might be due to interactive prompts or network issues', 'error');
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Validates that DATABASE_URL is available
   */
  private validateEnvironment(): void {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required for migrations');
    }
  }

  /**
   * Checks if migrations directory exists and has files
   */
  private hasPendingMigrations(): boolean {
    if (!existsSync(this.migrationsDir)) {
      this.log('No migrations directory found');
      return false;
    }

    const journalPath = join(this.migrationsDir, 'meta', '_journal.json');
    if (!existsSync(journalPath)) {
      this.log('No migration journal found');
      return false;
    }

    try {
      const journalContent = readFileSync(journalPath, 'utf-8');
      const journal = JSON.parse(journalContent);
      const hasMigrations = journal.entries && journal.entries.length > 0;
      
      this.log(`Found ${journal.entries?.length || 0} migrations in journal`);
      return hasMigrations;
    } catch (error) {
      this.log(`Failed to read migration journal: ${error}`, 'warn');
      return false;
    }
  }

  /**
   * Generates new migration files based on schema changes
   */
  async generateMigrations(): Promise<void> {
    this.validateEnvironment();
    
    await this.executeCommand(
      'npx drizzle-kit generate --yes',
      'generating migration files from schema changes'
    );
  }

  /**
   * Runs pending migrations against the database
   */
  async runMigrations(): Promise<void> {
    this.validateEnvironment();

    if (!this.hasPendingMigrations()) {
      this.log('No pending migrations to run');
      return;
    }

    await this.executeCommand(
      'npx drizzle-kit migrate',
      'running pending migrations'
    );
  }

  /**
   * Pushes schema changes directly to the database (dev only)
   */
  async pushSchema(): Promise<void> {
    if (this.isProduction) {
      throw new Error('Schema push is not allowed in production. Use migrations instead.');
    }

    this.validateEnvironment();
    
    await this.executeCommand(
      'npx drizzle-kit push',
      'pushing schema changes to database (development only)'
    );
  }

  /**
   * Gets the current migration status
   */
  async getMigrationStatus(): Promise<{
    hasPendingMigrations: boolean;
    migrationCount: number;
    environment: string;
  }> {
    const hasPending = this.hasPendingMigrations();
    let migrationCount = 0;

    if (existsSync(join(this.migrationsDir, 'meta', '_journal.json'))) {
      try {
        const journalContent = readFileSync(join(this.migrationsDir, 'meta', '_journal.json'), 'utf-8');
        const journal = JSON.parse(journalContent);
        migrationCount = journal.entries?.length || 0;
      } catch (error) {
        this.log(`Failed to read migration count: ${error}`, 'warn');
      }
    }

    return {
      hasPendingMigrations: hasPending,
      migrationCount,
      environment: this.isProduction ? 'production' : 'development'
    };
  }

  /**
   * Performs automatic migration based on environment
   * - Development: Use drizzle-kit push for simplicity (non-interactive)
   * - Production: Only run existing migrations (safer approach)
   */
  async autoMigrate(): Promise<void> {
    this.log(`Starting automatic migration in ${this.isProduction ? 'production' : 'development'} mode`);

    try {
      if (this.isProduction) {
        // In production, only run existing migrations
        // Never generate new ones automatically
        this.log('Production mode: Running existing migrations only');
        await this.runMigrations();
      } else {
        // In development, use drizzle-kit push for simplicity
        // This directly syncs the schema without generating migration files
        this.log('Development mode: Using drizzle-kit push for schema synchronization');
        
        try {
          await this.pushSchema();
          this.log('Schema pushed successfully to development database');
        } catch (error: any) {
          this.log(`Schema push failed: ${error.message}`, 'warn');
          this.log('Falling back to migration-based approach', 'warn');
          
          // Fallback: try the traditional generate + migrate approach
          try {
            await this.generateMigrations();
            await this.runMigrations();
          } catch (migrationError: any) {
            this.log(`Migration fallback also failed: ${migrationError.message}`, 'warn');
          }
        }
      }

      const status = await this.getMigrationStatus();
      this.log(`Migration complete. Total migrations: ${status.migrationCount}`);
      
    } catch (error: any) {
      this.log(`Auto-migration failed: ${error.message}`, 'error');
      
      if (this.isProduction) {
        // In production, migration failures should halt the startup
        throw new Error(`Critical migration failure in production: ${error.message}`);
      } else {
        // In development, log the error but don't crash the server
        this.log('Development migration failed, server will continue startup', 'warn');
      }
    }
  }

  /**
   * Emergency rollback functionality (use with caution)
   */
  async emergencyReset(): Promise<void> {
    if (this.isProduction) {
      throw new Error('Emergency reset is not allowed in production');
    }

    this.log('⚠️  EMERGENCY RESET: Dropping all tables and recreating schema', 'warn');
    
    await this.executeCommand(
      'npx drizzle-kit drop',
      'dropping all database tables'
    );

    await this.generateMigrations();
    await this.runMigrations();

    this.log('Emergency reset completed', 'warn');
  }
}

// Export singleton instance
export const migrationService = new MigrationService();

// Export helper functions for direct use
export const autoMigrate = () => migrationService.autoMigrate();
export const generateMigrations = () => migrationService.generateMigrations();
export const runMigrations = () => migrationService.runMigrations();
export const getMigrationStatus = () => migrationService.getMigrationStatus();