/**
 * AutoGreen.sg Extension - Storage Utilities Module
 * 
 * Storage operations and data management utilities
 * 
 * @author AutoGreen Team
 * @version 1.0.0
 */

const AutoGreenStorageUtils = {
  /**
   * Enhanced storage functions with error handling and validation
   */
  getStoredProducts() {
    try {
      const storageKey = window.AutoGreenConfig?.STORAGE.PRODUCTS || 'autogreen_products';
      const data = localStorage.getItem(storageKey);
      const products = data ? JSON.parse(data) : [];
      
      // Validate stored data structure
      if (!Array.isArray(products)) {
        if (window.AutoGreenLogger) {
          window.AutoGreenLogger.warn('Stored products data is not an array, resetting');
        }
        return [];
      }
      
      return products;
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Failed to parse stored products:', error);
      }
      return [];
    }
  },

  /**
   * Store products with validation and backup
   */
  storeProducts(products) {
    try {
      if (!Array.isArray(products)) {
        if (window.AutoGreenLogger) {
          window.AutoGreenLogger.error('Products must be an array');
        }
        return false;
      }

      const storageKey = window.AutoGreenConfig?.STORAGE.PRODUCTS || 'autogreen_products';
      
      // Create backup of existing data
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        localStorage.setItem(`${storageKey}_backup`, existing);
      }

      // Store new data
      localStorage.setItem(storageKey, JSON.stringify(products));
      
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.debug(`Stored ${products.length} products`);
      }
      return true;
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Failed to store products:', error);
      }
      
      // Try to restore from backup
      try {
        const storageKey = window.AutoGreenConfig?.STORAGE.PRODUCTS || 'autogreen_products';
        const backup = localStorage.getItem(`${storageKey}_backup`);
        if (backup) {
          localStorage.setItem(storageKey, backup);
          if (window.AutoGreenLogger) {
            window.AutoGreenLogger.warn('Restored products from backup');
          }
        }
      } catch (restoreError) {
        if (window.AutoGreenLogger) {
          window.AutoGreenLogger.error('Failed to restore from backup:', restoreError);
        }
      }
      
      return false;
    }
  },

  /**
   * Get stored configuration settings
   */
  getStoredSettings() {
    try {
      const storageKey = window.AutoGreenConfig?.STORAGE.SETTINGS || 'autogreen_settings';
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Failed to parse stored settings:', error);
      }
      return {};
    }
  },

  /**
   * Store configuration settings
   */
  storeSettings(settings) {
    try {
      if (typeof settings !== 'object' || settings === null) {
        if (window.AutoGreenLogger) {
          window.AutoGreenLogger.error('Settings must be an object');
        }
        return false;
      }

      const storageKey = window.AutoGreenConfig?.STORAGE.SETTINGS || 'autogreen_settings';
      localStorage.setItem(storageKey, JSON.stringify(settings));
      
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.debug('Stored settings successfully');
      }
      return true;
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Failed to store settings:', error);
      }
      return false;
    }
  },

  /**
   * Get storage usage statistics
   */
  getStorageStats() {
    try {
      let totalSize = 0;
      let itemCount = 0;
      const itemSizes = {};

      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key);
          const size = value ? value.length : 0;
          
          totalSize += size;
          itemCount++;
          itemSizes[key] = size;
        }
      }

      const maxStorage = 1024 * 1024 * 5; // 5MB approximate limit
      const usagePercentage = (totalSize / maxStorage) * 100;

      return {
        totalSize,
        itemCount,
        itemSizes,
        usagePercentage: Math.round(usagePercentage * 100) / 100,
        formattedSize: this.formatBytes(totalSize),
      };
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Failed to get storage stats:', error);
      }
      return null;
    }
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
   * Clear specific stored data
   */
  clearStoredData(keys) {
    try {
      if (typeof keys === 'string') {
        keys = [keys];
      }

      if (!Array.isArray(keys)) {
        if (window.AutoGreenLogger) {
          window.AutoGreenLogger.error('Keys must be a string or array of strings');
        }
        return false;
      }

      keys.forEach(key => {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_backup`);
      });

      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.log(`Cleared data for keys: ${keys.join(', ')}`);
      }
      return true;
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Failed to clear stored data:', error);
      }
      return false;
    }
  },

  /**
   * Clear all AutoGreen stored data with confirmation
   */
  clearAllStoredData() {
    try {
      const config = window.AutoGreenConfig;
      if (config && config.STORAGE) {
        Object.values(config.STORAGE).forEach(key => {
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_backup`);
        });
      }
      
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.log('Cleared all stored data');
      }
      return true;
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Failed to clear stored data:', error);
      }
      return false;
    }
  },

  /**
   * Export data to downloadable file
   */
  exportData(dataKey, filename = 'autogreen_export.json') {
    try {
      const data = localStorage.getItem(dataKey);
      if (!data) {
        if (window.AutoGreenLogger) {
          window.AutoGreenLogger.warn(`No data found for key: ${dataKey}`);
        }
        return false;
      }

      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.log(`Exported data to ${filename}`);
      }
      return true;
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Failed to export data:', error);
      }
      return false;
    }
  },

  /**
   * Import data from JSON file
   */
  importData(dataKey, jsonData) {
    try {
      // Validate JSON
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Create backup of existing data
      const existing = localStorage.getItem(dataKey);
      if (existing) {
        localStorage.setItem(`${dataKey}_backup`, existing);
      }

      // Store imported data
      localStorage.setItem(dataKey, JSON.stringify(parsed));
      
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.log(`Imported data for key: ${dataKey}`);
      }
      return true;
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Failed to import data:', error);
      }
      return false;
    }
  },
};

// Make Storage utilities available globally
if (typeof window !== 'undefined') {
  window.AutoGreenStorageUtils = AutoGreenStorageUtils;
}
