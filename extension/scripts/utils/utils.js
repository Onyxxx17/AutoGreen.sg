/**
 * AutoGreen.sg Extension - Utility Functions (Refactored)
 * 
 * Main utilities module that combines all utility modules
 * 
 * @author AutoGreen Team
 * @version 1.0.0
 */

/**
 * Main utility object that combines all utility modules
 */
const AutoGreenUtils = {
  // Logger utilities
  get logger() {
    return window.AutoGreenLogger;
  },

  // DOM utilities
  get dom() {
    return window.AutoGreenDOMUtils;
  },

  // Product extraction utilities
  get extractor() {
    return window.AutoGreenProductExtractor;
  },

  // Storage utilities
  get storage() {
    return window.AutoGreenStorageUtils;
  },

  // Performance utilities
  get performance() {
    return window.AutoGreenPerformanceUtils;
  },

  // Backwards compatibility methods
  getCurrentSiteConfig(url) {
    return this.dom?.getCurrentSiteConfig(url);
  },

  isSupportedSite(url) {
    return this.dom?.isSupportedSite(url);
  },

  isElementVisible(element, buffer) {
    return this.dom?.isElementVisible(element, buffer);
  },

  generateProductId(elementTop, index, url) {
    return this.extractor?.generateProductId(elementTop, index, url);
  },

  extractProductInfo(productElement, index) {
    return this.extractor?.extractProductInfo(productElement, index);
  },

  isValidProductName(productName) {
    return this.extractor?.isValidProductName(productName);
  },

  getSiteType(url) {
    return this.dom?.getSiteType(url);
  },

  getStoredProducts() {
    return this.storage?.getStoredProducts();
  },

  storeProducts(products) {
    return this.storage?.storeProducts(products);
  },

  clearAllStoredData() {
    return this.storage?.clearAllStoredData();
  },

  debounce(func, wait, immediate) {
    return this.performance?.debounce(func, wait, immediate);
  },

  throttle(func, limit) {
    return this.performance?.throttle(func, limit);
  },

  measurePerformance(name, func) {
    return this.performance?.measurePerformance(name, func);
  },

  // Utility method to check if all dependencies are loaded
  checkDependencies() {
    const dependencies = [
      'AutoGreenLogger',
      'AutoGreenDOMUtils', 
      'AutoGreenProductExtractor',
      'AutoGreenStorageUtils',
      'AutoGreenPerformanceUtils'
    ];

    const missing = dependencies.filter(dep => !window[dep]);
    
    if (missing.length > 0) {
      console.error('[AutoGreen Utils] Missing dependencies:', missing);
      return false;
    }

    return true;
  },

  // Initialize utilities
  initialize() {
    if (!this.checkDependencies()) {
      console.error('[AutoGreen Utils] Cannot initialize - missing dependencies');
      return false;
    }

    if (this.logger) {
      this.logger.log('AutoGreen utilities initialized successfully');
    }

    return true;
  }
};

// Legacy Logger for backwards compatibility
const Logger = {
  debug: function(message, ...args) {
    window.AutoGreenLogger?.debug(message, ...args);
  },
  log: function(message, ...args) {
    window.AutoGreenLogger?.log(message, ...args);
  },
  warn: function(message, ...args) {
    window.AutoGreenLogger?.warn(message, ...args);
  },
  error: function(message, ...args) {
    window.AutoGreenLogger?.error(message, ...args);
  },
};

// Legacy Utils for backwards compatibility
const Utils = AutoGreenUtils;

// Make utilities available globally
if (typeof window !== 'undefined') {
  window.AutoGreenUtils = AutoGreenUtils;
  
  // Backwards compatibility
  window.AutoGreenLogger = window.AutoGreenLogger || Logger;
  window.Utils = Utils;
}
