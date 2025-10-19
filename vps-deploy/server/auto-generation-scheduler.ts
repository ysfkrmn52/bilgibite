import { EXAM_CATEGORIES } from '../shared/categories';
import type { IStorage } from './storage';
import { db } from './db';
import { schedulerState } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Saatlik otomatik soru üretimi scheduler sistemi
interface SchedulerState {
  enabled: boolean;
  nextRunAt: Date | null;
  lastRunAt: Date | null;
  currentCategory: string | null;
  timers: {
    nextHour?: NodeJS.Timeout;
    hourlyInterval?: NodeJS.Timeout;
  };
  stats: {
    totalRuns: number;
    totalQuestionsGenerated: number;
    lastError?: string;
  };
}

class AutoGenerationScheduler {
  private state: SchedulerState = {
    enabled: false,
    nextRunAt: null,
    lastRunAt: null,
    currentCategory: null,
    timers: {},
    stats: {
      totalRuns: 0,
      totalQuestionsGenerated: 0
    }
  };

  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
    console.log('🤖 AutoGenerationScheduler initialized');
  }

  // Database persistence methods
  private async loadStateFromDB(): Promise<void> {
    try {
      const result = await db.select().from(schedulerState).where(eq(schedulerState.id, 'scheduler-singleton')).limit(1);
      
      if (result.length > 0) {
        const dbState = result[0];
        this.state.enabled = dbState.enabled;
        this.state.nextRunAt = dbState.nextRunAt;
        this.state.lastRunAt = dbState.lastRunAt;
        this.state.currentCategory = dbState.currentCategory;
        this.state.stats.totalRuns = dbState.totalRuns;
        this.state.stats.totalQuestionsGenerated = dbState.totalQuestionsGenerated;
        this.state.stats.lastError = dbState.lastError || undefined;
        
        console.log('✅ Scheduler state loaded from database');
        console.log(`📊 Loaded state: enabled=${this.state.enabled}, totalRuns=${this.state.stats.totalRuns}, nextRun=${this.state.nextRunAt?.toISOString()}`);
      } else {
        // Create initial state record
        await this.saveStateToDB();
        console.log('🔄 Created initial scheduler state in database');
      }
    } catch (error) {
      console.error('❌ Failed to load scheduler state from database:', error);
      // Continue with in-memory state on DB error
    }
  }

  private async saveStateToDB(): Promise<void> {
    try {
      const stateData = {
        enabled: this.state.enabled,
        nextRunAt: this.state.nextRunAt,
        lastRunAt: this.state.lastRunAt,
        currentCategory: this.state.currentCategory,
        totalRuns: this.state.stats.totalRuns,
        totalQuestionsGenerated: this.state.stats.totalQuestionsGenerated,
        lastError: this.state.stats.lastError || null,
        lastErrorAt: this.state.stats.lastError ? new Date() : null,
        updatedAt: new Date()
      };

      await db.insert(schedulerState)
        .values({ id: 'scheduler-singleton', ...stateData })
        .onDuplicateKeyUpdate({
          set: stateData
        });
      
      console.log('💾 Scheduler state saved to database');
    } catch (error) {
      console.error('❌ Failed to save scheduler state to database:', error);
      // Don't throw - continue running even if persistence fails
    }
  }

  // Initialize scheduler with database state recovery
  public async initialize(): Promise<void> {
    await this.loadStateFromDB();
    
    // If scheduler was enabled before restart, restore it
    if (this.state.enabled) {
      console.log('🔄 Recovering scheduler state after restart');
      this.state.enabled = false; // Reset to prevent double start
      this.start();
    }
  }

  // Sistemi başlat
  public async start(): Promise<void> {
    if (this.state.enabled) {
      console.log('⚠️ Scheduler already running');
      return;
    }

    this.state.enabled = true;
    this.clearTimers();
    this.scheduleNextHour();
    
    // Persist state change
    await this.saveStateToDB();
    
    console.log('🚀 Auto-generation scheduler started');
  }

  // Sistemi durdur
  public async stop(): Promise<void> {
    this.state.enabled = false;
    this.clearTimers();
    this.state.nextRunAt = null;
    this.state.currentCategory = null;
    
    // Persist state change
    await this.saveStateToDB();
    
    console.log('⛔ Auto-generation scheduler stopped');
  }

  // Bir sonraki saat başına kadar schedule et
  private scheduleNextHour(): void {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    
    const msUntilNextHour = nextHour.getTime() - now.getTime();
    
    this.state.nextRunAt = nextHour;
    this.state.currentCategory = this.getCurrentCategory();
    
    console.log(`⏰ Next run scheduled at ${nextHour.toLocaleString('tr-TR')} (${Math.floor(msUntilNextHour / 1000 / 60)} dakika sonra)`);
    
    this.state.timers.nextHour = setTimeout(() => {
      this.runGeneration();
      this.startHourlyInterval();
    }, msUntilNextHour);
  }

  // Saatlik interval başlat
  private startHourlyInterval(): void {
    this.state.timers.hourlyInterval = setInterval(() => {
      this.runGeneration();
    }, 60 * 60 * 1000); // Her saat = 3,600,000 ms
  }

  // Soru üretimini çalıştır
  private async runGeneration(): Promise<void> {
    if (!this.state.enabled) return;

    try {
      const category = this.getCurrentCategory();
      this.state.currentCategory = category;
      
      console.log(`🎯 Generating 10 questions for category: ${category}`);
      
      // Şimdilik simüle et - gerçek implementation'da AI ile soru üretilecek
      await this.generateQuestionsForCategory(category, 10);
      
      // İstatistikleri güncelle
      this.state.stats.totalRuns++;
      this.state.stats.totalQuestionsGenerated += 10;
      this.state.lastRunAt = new Date();
      this.state.stats.lastError = undefined; // Clear previous errors on success
      
      // Bir sonraki çalışma zamanını ayarla
      const nextRun = new Date();
      nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0);
      this.state.nextRunAt = nextRun;
      
      // Persist updated stats
      await this.saveStateToDB();
      
      console.log(`✅ Successfully generated 10 questions for ${category}`);
      console.log(`📊 Total runs: ${this.state.stats.totalRuns}, Total questions: ${this.state.stats.totalQuestionsGenerated}`);
      
    } catch (error) {
      this.state.stats.lastError = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error during auto-generation:', error);
      
      // Persist error state
      await this.saveStateToDB();
    }
  }

  // Günün kategorisini belirle (basit rotasyon)
  private getCurrentCategory(): string {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Günün kategorisini rotasyon ile belirle
    const categoryIndex = dayOfYear % EXAM_CATEGORIES.length;
    const category = EXAM_CATEGORIES[categoryIndex];
    
    return category?.name || 'YKS (TYT/AYT)';
  }

  // Kategori için soru üret (placeholder)
  private async generateQuestionsForCategory(category: string, count: number): Promise<void> {
    // TODO: Gerçek AI soru üretimi burada yapılacak
    console.log(`📝 [PLACEHOLDER] Generating ${count} questions for ${category}...`);
    
    // Simüle edilmiş gecikme
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✨ [PLACEHOLDER] Generated ${count} questions for ${category}`);
  }

  // Timer'ları temizle
  private clearTimers(): void {
    if (this.state.timers.nextHour) {
      clearTimeout(this.state.timers.nextHour);
      delete this.state.timers.nextHour;
    }
    
    if (this.state.timers.hourlyInterval) {
      clearInterval(this.state.timers.hourlyInterval);
      delete this.state.timers.hourlyInterval;
    }
  }

  // Durum bilgisi getir
  public getStatus() {
    return {
      enabled: this.state.enabled,
      nextRunAt: this.state.nextRunAt?.toISOString() || null,
      lastRunAt: this.state.lastRunAt?.toISOString() || null,
      currentCategory: this.state.currentCategory,
      stats: this.state.stats,
      minutesUntilNext: this.state.nextRunAt 
        ? Math.floor((this.state.nextRunAt.getTime() - Date.now()) / 1000 / 60)
        : null
    };
  }

  // Process kapanırken cleanup yap
  public async cleanup(): Promise<void> {
    await this.stop();
    console.log('🧹 AutoGenerationScheduler cleanup completed');
  }
}

export default AutoGenerationScheduler;