/**
 * AutoGreen.sg Extension - Utility Functions
 *
 * Common utility functions used across the extension
 */

/**
 * Logger utility for consistent logging with AutoGreen prefix
 */
const Logger = {
  log: (message, ...args) => console.log(`[AutoGreen] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[AutoGreen] ${message}`, ...args),
  error: (message, ...args) => console.error(`[AutoGreen] ${message}`, ...args),
};

/**
 * Utility functions for DOM and data manipulation
 */
const Utils = {
  /**
   * Check if an element is visible in or near the viewport
   */
  isElementVisible(element, buffer = window.AutoGreenConfig.VIEWPORT_BUFFER) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset;
    const viewportHeight = window.innerHeight;

    const elementTop = rect.top + scrollTop;
    const elementBottom = elementTop + rect.height;

    return (
      elementBottom > scrollTop - buffer &&
      elementTop < scrollTop + viewportHeight + buffer
    );
  },

  /**
   * Generate unique ID for a product based on position and index
   */
  generateProductId(elementTop, index) {
    return `product-${elementTop}-${index}`;
  },

  /**
   * Extract product information from a product element
   */
  extractProductInfo(productElement, index) {
    const rect = productElement.getBoundingClientRect();
    const elementTop = rect.top + window.pageYOffset;
    const anchor = productElement.querySelector(
      window.AutoGreenConfig.SELECTORS.PRODUCT_LINK
    );

    let productName = "";
    if (anchor?.title) {
      productName = anchor.title.trim();
    } else {
      productName = productElement.textContent.trim();
    }

    if (
      !productName ||
      productName.length <= window.AutoGreenConfig.MIN_PRODUCT_NAME_LENGTH
    ) {
      return null;
    }

    return {
      id: this.generateProductId(elementTop, index),
      name: productName,
      link: anchor?.href || null,
      position: elementTop,
      element: productElement,
    };
  },

  /**
   * Safely parse JSON from localStorage
   */
  getStoredProducts() {
    try {
      return JSON.parse(
        localStorage.getItem(window.AutoGreenConfig.STORAGE_KEY) || "[]"
      );
    } catch (error) {
      Logger.error("Failed to parse stored products:", error);
      return [];
    }
  },

  /**
   * Safely store products in localStorage
   */
  storeProducts(products) {
    try {
      localStorage.setItem(
        window.AutoGreenConfig.STORAGE_KEY,
        JSON.stringify(products)
      );
      return true;
    } catch (error) {
      Logger.error("Failed to store products:", error);
      return false;
    }
  },
};

// Make utilities available globally
if (typeof window !== "undefined") {
  window.AutoGreenLogger = Logger;
  window.AutoGreenUtils = Utils;
}
