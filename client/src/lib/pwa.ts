// PWA Utilities and Service Worker Management
export interface PWAPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export class PWAManager {
  private deferredPrompt: PWAPromptEvent | null = null;
  private isInstalled = false;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined') return;

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as PWAPromptEvent;
      this.showInstallPrompt();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallPrompt();
      this.trackEvent('pwa_installed');
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone) {
      this.isInstalled = true;
    }

    // Register service worker
    await this.registerServiceWorker();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered successfully');

        // Check for updates
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdatePrompt();
              }
            });
          }
        });

        // Enable background sync if supported
        if (this.swRegistration.sync) {
          await this.setupBackgroundSync();
        }

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private showInstallPrompt() {
    const promptElement = document.getElementById('pwa-install-prompt');
    if (promptElement) {
      promptElement.style.display = 'block';
    }
  }

  private hideInstallPrompt() {
    const promptElement = document.getElementById('pwa-install-prompt');
    if (promptElement) {
      promptElement.style.display = 'none';
    }
  }

  async promptInstall() {
    if (!this.deferredPrompt) return false;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    this.trackEvent('pwa_install_prompt', { outcome });
    
    if (outcome === 'accepted') {
      this.deferredPrompt = null;
      return true;
    }
    
    return false;
  }

  private showUpdatePrompt() {
    const updateElement = document.getElementById('pwa-update-prompt');
    if (updateElement) {
      updateElement.style.display = 'block';
    }
  }

  async updateApp() {
    if (!this.swRegistration?.waiting) return;

    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }

  // Push notification management
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.trackEvent('notification_permission', { permission });
    return permission;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.swRegistration) return null;

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        )
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Background sync setup
  private async setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await this.swRegistration?.sync.register('background-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // Analytics tracking
  private trackEvent(event: string, data?: Record<string, any>) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        event_category: 'PWA',
        ...data
      });
    }
  }

  // Cache management
  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  async getCacheSize(): Promise<number> {
    if (!('navigator' in window) || !('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }

    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }

  getInstallStatus() {
    return this.isInstalled;
  }

  getConnectionStatus() {
    return navigator.onLine;
  }
}

export const pwaManager = new PWAManager();