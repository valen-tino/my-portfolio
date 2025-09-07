// Simple performance monitoring for cursor inverter
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private isMonitoring = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.monitor();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  private monitor(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    this.frameCount++;

    // Calculate FPS every second
    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;

      // Log performance warnings
      if (this.fps < 30) {
        console.warn(`CursorInverter: Low FPS detected (${this.fps}). Consider using eco mode.`);
      }
    }

    requestAnimationFrame(() => this.monitor());
  }

  getFPS(): number {
    return this.fps;
  }

  // Auto-detect optimal performance mode
  static getOptimalPerformanceMode(): 'high' | 'balanced' | 'eco' {
    const deviceMemory = (navigator as any).deviceMemory || 4; // GB
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const connection = (navigator as any).connection;

    // High-end device detection
    if (deviceMemory >= 8 && hardwareConcurrency >= 8) {
      return 'high';
    }

    // Low-end device detection
    if (deviceMemory <= 2 || hardwareConcurrency <= 2) {
      return 'eco';
    }

    // Check network conditions for mobile
    if (connection && connection.effectiveType === '2g') {
      return 'eco';
    }

    // Default balanced mode
    return 'balanced';
  }

  // Battery-aware performance adjustment
  static async getBatteryAwareMode(): Promise<'high' | 'balanced' | 'eco'> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        
        // Use eco mode if battery is low or device is charging
        if (!battery.charging && battery.level < 0.2) {
          return 'eco';
        }
        
        // Use balanced mode when on battery
        if (!battery.charging) {
          return 'balanced';
        }
      }
    } catch (error) {
      // Fallback if battery API is not available
    }

    return PerformanceMonitor.getOptimalPerformanceMode();
  }
}
