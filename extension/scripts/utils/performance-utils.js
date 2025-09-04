/**
 * AutoGreen.sg Extension - Performance Utilities Module
 * 
 * Performance optimization and monitoring utilities
 * 
 * @author AutoGreen Team
 * @version 1.0.0
 */

const AutoGreenPerformanceUtils = {
  /**
   * Debounce function for performance optimization
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  /**
   * Throttle function for performance optimization
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Performance monitoring helper
   */
  measurePerformance(name, func) {
    if (!window.AutoGreenConfig?.FEATURES.PERFORMANCE_MONITORING) {
      return func();
    }

    const start = performance.now();
    const result = func();
    const end = performance.now();
    
    if (window.AutoGreenLogger) {
      window.AutoGreenLogger.perf(name, end - start);
    }
    return result;
  },

  /**
   * Async performance monitoring helper
   */
  async measurePerformanceAsync(name, asyncFunc) {
    if (!window.AutoGreenConfig?.FEATURES.PERFORMANCE_MONITORING) {
      return await asyncFunc();
    }

    const start = performance.now();
    const result = await asyncFunc();
    const end = performance.now();
    
    if (window.AutoGreenLogger) {
      window.AutoGreenLogger.perf(name, end - start);
    }
    return result;
  },

  /**
   * Create a performance profiler
   */
  createProfiler(name) {
    const start = performance.now();
    let lastCheckpoint = start;
    const checkpoints = [];

    return {
      checkpoint(label) {
        const now = performance.now();
        const sinceLast = now - lastCheckpoint;
        const sinceStart = now - start;
        
        checkpoints.push({
          label,
          sinceLast,
          sinceStart,
          timestamp: now
        });
        
        lastCheckpoint = now;
        
        if (window.AutoGreenLogger) {
          window.AutoGreenLogger.debug(`${name} - ${label}: ${sinceLast.toFixed(2)}ms (total: ${sinceStart.toFixed(2)}ms)`);
        }
      },

      finish() {
        const end = performance.now();
        const total = end - start;
        
        if (window.AutoGreenLogger) {
          window.AutoGreenLogger.perf(`${name} - Total`, total);
          if (checkpoints.length > 0) {
            window.AutoGreenLogger.table(checkpoints);
          }
        }
        
        return {
          total,
          checkpoints
        };
      }
    };
  },

  /**
   * Memory usage monitoring
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        formattedUsed: this.formatBytes(performance.memory.usedJSHeapSize),
        formattedTotal: this.formatBytes(performance.memory.totalJSHeapSize),
        formattedLimit: this.formatBytes(performance.memory.jsHeapSizeLimit),
      };
    }
    return null;
  },

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Request idle callback with fallback
   */
  requestIdleCallback(callback, options = {}) {
    if (window.requestIdleCallback) {
      return window.requestIdleCallback(callback, options);
    } else {
      // Fallback for browsers without requestIdleCallback
      return setTimeout(() => {
        const start = performance.now();
        callback({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (performance.now() - start));
          }
        });
      }, 1);
    }
  },

  /**
   * Cancel idle callback with fallback
   */
  cancelIdleCallback(id) {
    if (window.cancelIdleCallback) {
      window.cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  },

  /**
   * Batch process array items with idle time management
   */
  async processBatchWithIdle(items, processor, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Wait for idle time before processing batch
      await new Promise(resolve => {
        this.requestIdleCallback(() => {
          batch.forEach(item => {
            try {
              const result = processor(item);
              results.push(result);
            } catch (error) {
              if (window.AutoGreenLogger) {
                window.AutoGreenLogger.error('Error processing batch item:', error);
              }
            }
          });
          resolve();
        });
      });
    }
    
    return results;
  },

  /**
   * Create a rate limiter
   */
  createRateLimiter(maxCalls, windowMs) {
    const calls = [];
    
    return function(...args) {
      const now = Date.now();
      
      // Remove old calls outside the window
      while (calls.length > 0 && calls[0] <= now - windowMs) {
        calls.shift();
      }
      
      // Check if we can make another call
      if (calls.length < maxCalls) {
        calls.push(now);
        return true;
      }
      
      return false;
    };
  },
};

// Make Performance utilities available globally
if (typeof window !== 'undefined') {
  window.AutoGreenPerformanceUtils = AutoGreenPerformanceUtils;
}
