/**
 * AutoGreen.sg Extension - DOM Utilities Module
 * 
 * DOM manipulation and visibility utilities
 * 
 * @author AutoGreen Team
 * @version 1.0.0
 */

const AutoGreenDOMUtils = {
  /**
   * Get the current site configuration based on URL
   */
  getCurrentSiteConfig(url = window.location.href) {
    if (!window.AutoGreenConfig) return null;
    return window.AutoGreenConfig.getSelectorForSite(url);
  },

  /**
   * Check if current site is a supported e-commerce site
   */
  isSupportedSite(url = window.location.href) {
    if (!window.AutoGreenConfig) return false;
    return window.AutoGreenConfig.isValidEcommerceSite(url);
  },

  /**
   * Check if an element is visible in or near the viewport
   */
  isElementVisible(element, buffer = null) {
    if (!element) return false;
    
    // Get buffer from config if not provided
    if (buffer === null && window.AutoGreenConfig) {
      buffer = window.AutoGreenConfig.PERFORMANCE.VIEWPORT_BUFFER;
    }
    buffer = buffer || 200;

    try {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset;
      const viewportHeight = window.innerHeight;

      const elementTop = rect.top + scrollTop;
      const elementBottom = elementTop + rect.height;

      return (
        elementBottom > scrollTop - buffer &&
        elementTop < scrollTop + viewportHeight + buffer
      );
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Error checking element visibility:', error);
      }
      return false;
    }
  },

  /**
   * Check if an element is currently in the viewport
   */
  isInViewport(element) {
    if (!element) return false;
    
    try {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Error checking viewport visibility:', error);
      }
      return false;
    }
  },

  /**
   * Wait for an element to appear in DOM
   */
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  },

  /**
   * Get element coordinates relative to document
   */
  getElementPosition(element) {
    if (!element) return { top: 0, left: 0 };
    
    try {
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset,
        bottom: rect.bottom + window.pageYOffset,
        right: rect.right + window.pageXOffset,
        width: rect.width,
        height: rect.height
      };
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Error getting element position:', error);
      }
      return { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 };
    }
  },

  /**
   * Scroll element into view smoothly
   */
  scrollToElement(element, behavior = 'smooth', block = 'center') {
    if (!element) return;
    
    try {
      element.scrollIntoView({
        behavior: behavior,
        block: block,
        inline: 'nearest'
      });
    } catch (error) {
      // Fallback for older browsers
      element.scrollIntoView();
    }
  },

  /**
   * Find closest parent element matching selector
   */
  findClosestParent(element, selector) {
    if (!element) return null;
    
    try {
      return element.closest(selector);
    } catch (error) {
      // Fallback for older browsers
      let parent = element.parentElement;
      while (parent) {
        if (parent.matches && parent.matches(selector)) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    }
  },

  /**
   * Get all child elements matching selector
   */
  findChildren(element, selector) {
    if (!element) return [];
    
    try {
      return Array.from(element.querySelectorAll(selector));
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Error finding children:', error);
      }
      return [];
    }
  },

  /**
   * Create element with attributes and content
   */
  createElement(tag, attributes = {}, content = '') {
    try {
      const element = document.createElement(tag);
      
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value);
        } else {
          element.setAttribute(key, value);
        }
      });
      
      if (content) {
        if (typeof content === 'string') {
          element.textContent = content;
        } else {
          element.appendChild(content);
        }
      }
      
      return element;
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Error creating element:', error);
      }
      return null;
    }
  },

  /**
   * Remove element safely
   */
  removeElement(element) {
    if (!element) return;
    
    try {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Error removing element:', error);
      }
    }
  },

  /**
   * Get site type from URL
   */
  getSiteType(url = window.location.href) {
    if (url.includes('lazada')) return 'lazada';
    if (url.includes('shopee')) return 'shopee';
    return 'unknown';
  },
};

// Make DOM utilities available globally
if (typeof window !== 'undefined') {
  window.AutoGreenDOMUtils = AutoGreenDOMUtils;
}
