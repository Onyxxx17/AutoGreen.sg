/**
 * AutoGreen.sg Extension - Product Extractor Module
 * 
 * Product information extraction utilities
 * 
 * @author AutoGreen Team
 * @version 1.0.0
 */

const AutoGreenProductExtractor = {
  /**
   * Generate unique ID for a product based on position and index
   */
  generateProductId(elementTop, index, url = window.location.href) {
    // Include URL hash to make IDs unique across different pages
    const urlHash = this.hashCode(url);
    return `product-${urlHash}-${Math.round(elementTop)}-${index}`;
  },

  /**
   * Simple hash function for generating consistent hashes
   */
  hashCode(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  },

  /**
   * Enhanced product information extraction with site-specific logic
   */
  extractProductInfo(productElement, index) {
    if (!productElement) return null;

    try {
      const currentUrl = window.location.href;
      const domUtils = window.AutoGreenDOMUtils;
      const logger = window.AutoGreenLogger;
      
      if (!domUtils) {
        console.error('DOM utilities not available');
        return null;
      }

      const position = domUtils.getElementPosition(productElement);
      const elementTop = position.top;
      const siteConfig = domUtils.getCurrentSiteConfig(currentUrl);

      if (!siteConfig) {
        if (logger) {
          logger.warn('No site configuration found for current URL');
        }
        return null;
      }

      // Extract product link
      const productLink = this.extractProductLink(productElement, siteConfig);
      
      // Extract product name
      const productName = this.extractProductName(productElement, siteConfig, productLink);

      // Validate product name
      if (!this.isValidProductName(productName)) {
        if (logger) {
          logger.debug(`Invalid product name: "${productName}"`);
        }
        return null;
      }

      const productInfo = {
        id: this.generateProductId(elementTop, index, currentUrl),
        name: productName,
        link: productLink,
        position: elementTop,
        element: productElement,
        extractedAt: new Date().toISOString(),
        sourceUrl: currentUrl,
        siteType: domUtils.getSiteType(currentUrl),
      };

      if (logger) {
        logger.debug('Extracted product info:', productInfo);
      }
      return productInfo;

    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Error extracting product info:', error);
      }
      return null;
    }
  },

  /**
   * Extract product link using site-specific selectors
   */
  extractProductLink(productElement, siteConfig) {
    // Try primary selector
    let anchor = productElement.querySelector(siteConfig.PRODUCT_LINK);

    // Try fallback selector if available
    if (!anchor && siteConfig.PRODUCT_LINK_FALLBACK) {
      anchor = productElement.querySelector(siteConfig.PRODUCT_LINK_FALLBACK);
    }

    // Last resort - any anchor
    if (!anchor) {
      anchor = productElement.querySelector('a[href]') || 
               productElement.closest('a[href]');
    }

    return anchor?.href || null;
  },

  /**
   * Extract product name using various strategies
   */
  extractProductName(productElement, siteConfig, productLink) {
    let productName = '';

    // Strategy 1: Title attribute from link
    if (productLink) {
      const linkElement = productElement.querySelector('a[title]');
      if (linkElement?.title) {
        productName = linkElement.title.trim();
      }
    }

    // Strategy 2: Site-specific selectors
    if (!productName && siteConfig.HOME_PAGE_TITLE) {
      const titleElement = productElement.querySelector(siteConfig.HOME_PAGE_TITLE);
      if (titleElement) {
        productName = titleElement.textContent.trim();
      }
    }

    // Strategy 3: Generic text content extraction
    if (!productName) {
      // Look for the longest meaningful text content
      const textElements = productElement.querySelectorAll('a, span, div, p');
      let longestText = '';
      
      textElements.forEach(element => {
        const text = element.textContent.trim();
        if (text.length > longestText.length && this.looksLikeProductName(text)) {
          longestText = text;
        }
      });
      
      productName = longestText;
    }

    // Strategy 4: Fallback to element text content
    if (!productName) {
      productName = productElement.textContent.trim();
    }

    return productName;
  },

  /**
   * Check if text looks like a product name
   */
  looksLikeProductName(text) {
    if (!text || text.length < 5) return false;
    
    // Should contain letters
    if (!/[a-zA-Z]/.test(text)) return false;
    
    // Should not be just numbers
    if (/^[\d\s\-.,]+$/.test(text)) return false;
    
    // Should not be common UI text
    const commonUIText = [
      'add to cart', 'buy now', 'view details', 'more info', 'see more',
      'quick view', 'add to wishlist', 'compare', 'share', 'sold',
      'rating', 'reviews', 'price', 'discount', 'offer', 'sale'
    ];
    const lowerText = text.toLowerCase();
    
    return !commonUIText.some(ui => lowerText.includes(ui));
  },

  /**
   * Validate product name against configured rules
   */
  isValidProductName(productName) {
    if (!productName || !window.AutoGreenConfig) return false;

    const config = window.AutoGreenConfig;
    const minLength = config.PERFORMANCE.MIN_PRODUCT_NAME_LENGTH;

    // Check minimum length
    if (productName.length < minLength) return false;

    // Check against skip patterns
    const skipPatterns = config.VALIDATION.SKIP_PATTERNS;
    for (const pattern of skipPatterns) {
      if (pattern.test(productName)) {
        return false;
      }
    }

    // Check required patterns
    const requiredPatterns = config.VALIDATION.REQUIRED_PATTERNS;
    for (const pattern of requiredPatterns) {
      if (pattern.test(productName)) {
        return true; // At least one required pattern matches
      }
    }

    return false;
  },

  /**
   * Extract additional product metadata if available
   */
  extractProductMetadata(productElement, siteConfig) {
    const metadata = {};

    try {
      // Extract price if available
      const priceElement = productElement.querySelector(siteConfig.PRICE_SELECTOR || '.price, [class*="price"]');
      if (priceElement) {
        metadata.price = priceElement.textContent.trim();
      }

      // Extract rating if available
      const ratingElement = productElement.querySelector(siteConfig.RATING_SELECTOR || '[class*="rating"], [class*="star"]');
      if (ratingElement) {
        metadata.rating = ratingElement.textContent.trim();
      }

      // Extract image if available
      const imageElement = productElement.querySelector('img[src]');
      if (imageElement) {
        metadata.image = imageElement.src;
      }

      // Extract brand if available
      const brandElement = productElement.querySelector(siteConfig.BRAND_SELECTOR || '[class*="brand"]');
      if (brandElement) {
        metadata.brand = brandElement.textContent.trim();
      }

    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error('Error extracting product metadata:', error);
      }
    }

    return metadata;
  },

  /**
   * Batch extract products from multiple elements
   */
  extractProductsFromElements(elements) {
    if (!Array.isArray(elements)) return [];

    const products = [];
    const logger = window.AutoGreenLogger;

    elements.forEach((element, index) => {
      try {
        const productInfo = this.extractProductInfo(element, index);
        if (productInfo) {
          products.push(productInfo);
        }
      } catch (error) {
        if (logger) {
          logger.error(`Error extracting product ${index}:`, error);
        }
      }
    });

    if (logger) {
      logger.info(`Extracted ${products.length} products from ${elements.length} elements`);
    }

    return products;
  },
};

// Make Product Extractor available globally
if (typeof window !== 'undefined') {
  window.AutoGreenProductExtractor = AutoGreenProductExtractor;
}
