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
      hash = (hash << 5) - hash + char;
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
        console.error("DOM utilities not available");
        return null;
      }

      // Handle case where productElement is itself a link container
      let actualElement = productElement;
      if (productElement.tagName === "A") {
        // If it's a link, we might need to use it as both container and link
        // But for position calculation, use the link element
        actualElement = productElement;
      }

      const position = domUtils.getElementPosition(actualElement);
      const elementTop = position.top;
      const siteConfig = domUtils.getCurrentSiteConfig(currentUrl);

      if (!siteConfig) {
        if (logger) {
          logger.warn("No site configuration found for current URL");
        }
        return null;
      }

      // Extract product link
      const productLink = this.extractProductLink(productElement, siteConfig);

      // Extract product name
      const productName = this.extractProductName(
        productElement,
        siteConfig,
        productLink
      );

      // Enhanced validation - also check if we have a valid link
      if (!this.isValidProductName(productName) || !productLink) {
        if (logger) {
          logger.debug(
            `Invalid product: name="${productName}", link="${productLink}"`
          );
        }
        return null;
      }

      // Additional validation for Lazada products
      if (
        !this.validateLazadaProduct(productElement, productName, productLink)
      ) {
        if (logger) {
          logger.debug(`Failed Lazada validation: name="${productName}"`);
        }
        return null;
      }

      const productInfo = {
        id: this.generateProductId(elementTop, index, currentUrl),
        name: productName,
        link: productLink,
        position: elementTop,
        element: actualElement,
        extractedAt: new Date().toISOString(),
        sourceUrl: currentUrl,
        siteType: domUtils.getSiteType(currentUrl),
      };

      if (logger) {
        logger.debug("Extracted product info:", productInfo);
      }
      return productInfo;
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error("Error extracting product info:", error);
      }
      return null;
    }
  },

  /**
   * Validate Lazada-specific product requirements
   */
  validateLazadaProduct(productElement, productName, productLink) {
    // Must have a Lazada product link
    if (!productLink || !productLink.includes("lazada.sg")) {
      return false;
    }

    // Must be a product page link
    if (!productLink.includes("/products/") && !productLink.includes("pdp-i")) {
      return false;
    }

    // Should have some price indicator (optional but increases confidence)
    const hasPriceIndicator = productElement.querySelector(
      '.price, [class*="price"], [data-price-type], [style*="color: rgb(254, 73, 96)"], [style*="color: rgb(255, 0, 58)"]'
    );

    // Should have an image (optional but increases confidence)
    const hasImage = productElement.querySelector(
      'img[src*="lazcdn.com"], img[src*="slatic.net"], .ant-image-img, .item-card-img'
    );

    // At least one supporting element should be present for confidence
    return hasPriceIndicator || hasImage;
  },

  /**
   * Extract product link using site-specific selectors with enhanced Lazada support
   */
  extractProductLink(productElement, siteConfig) {
    // Method 1: If the element itself is a link
    if (productElement.tagName === "A" && productElement.href) {
      return productElement.href;
    }

    // Method 2: Try primary selector
    let anchor = productElement.querySelector(siteConfig.PRODUCT_LINK);

    // Method 3: Try fallback selector if available
    if (!anchor && siteConfig.PRODUCT_LINK_FALLBACK) {
      anchor = productElement.querySelector(siteConfig.PRODUCT_LINK_FALLBACK);
    }

    // Method 4: Enhanced Lazada-specific link detection
    if (!anchor) {
      const lazadaSelectors = [
        'a[href*="/products/"]',
        "a[data-item-id]",
        'a[data-tracker*="product"]',
        'a[href*="lazada.sg"]',
        "a.trackedLink",
        "a[data-spm-anchor-id]",
      ];

      for (const selector of lazadaSelectors) {
        anchor = productElement.querySelector(selector);
        if (anchor && anchor.href) break;
      }
    }

    // Method 5: Last resort - any anchor with href
    if (!anchor) {
      anchor =
        productElement.querySelector("a[href]") ||
        productElement.closest("a[href]");
    }

    return anchor?.href || null;
  },

  /**
   * Extract product name using various strategies with enhanced Lazada support
   */
  extractProductName(productElement, siteConfig, productLink) {
    let productName = "";

    // Strategy 1: Title attribute from link (highest priority)
    if (productLink) {
      const linkElement =
        productElement.querySelector("a[title]") ||
        productElement.closest("a[title]");
      if (linkElement?.title) {
        productName = linkElement.title.trim();
        if (this.isValidProductName(productName)) {
          return productName;
        }
      }
    }

    // Strategy 2: Lazada-specific title selectors
    if (!productName && siteConfig.PRODUCT_TITLE_SELECTORS) {
      for (const selector of siteConfig.PRODUCT_TITLE_SELECTORS) {
        try {
          const titleElement = productElement.querySelector(selector);
          if (titleElement) {
            // Handle different title extraction methods
            let extractedTitle = "";

            if (titleElement.hasAttribute("title")) {
              extractedTitle = titleElement.getAttribute("title");
            } else if (titleElement.textContent) {
              extractedTitle = titleElement.textContent.trim();
            }

            if (extractedTitle && this.isValidProductName(extractedTitle)) {
              productName = extractedTitle;
              break;
            }
          }
        } catch (error) {
          // Continue to next selector if current one fails
          continue;
        }
      }
    }

    // Strategy 3: Site-specific title selectors (fallback)
    if (!productName && siteConfig.HOME_PAGE_TITLE) {
      const titleElements = productElement.querySelectorAll(
        siteConfig.HOME_PAGE_TITLE
      );
      for (const titleElement of titleElements) {
        const text = titleElement.textContent.trim();
        if (text && this.isValidProductName(text)) {
          productName = text;
          break;
        }
      }
    }

    // Strategy 4: Enhanced text content extraction for complex layouts
    if (!productName) {
      productName = this.extractProductNameFromComplexLayout(productElement);
    }

    // Strategy 5: Generic fallback - longest meaningful text
    if (!productName) {
      const textElements = productElement.querySelectorAll(
        "a, span, div, p, h1, h2, h3, h4, h5, h6"
      );
      let longestText = "";

      textElements.forEach((element) => {
        const text = element.textContent.trim();
        if (
          text.length > longestText.length &&
          text.length >= 10 &&
          this.looksLikeProductName(text)
        ) {
          longestText = text;
        }
      });

      productName = longestText;
    }

    return productName.trim();
  },
  extractProductNameFromComplexLayout(productElement) {
    // Check for specific Lazada patterns
    const patterns = [
      // RedMart style titles
      "span[title]",

      // Rax text components
      '.rax-text-v2:not([style*="font-size: 12px"]):not([style*="font-size: 16px"])',

      // Item card titles
      ".item-card-title span",

      // Product description spans with line clamps (typically product names)
      'span[style*="-webkit-line-clamp: 2"]',
      'span[numberoflines="2"]',

      // Text elements with specific heights (common for product titles)
      'span[style*="height: 40px"]',
      'div[style*="height: 40px"] span',

      // Look for the largest text element that's not a price
      'span:not([class*="price"]):not([style*="color: rgb(254, 73, 96)"]):not([style*="color: rgb(255, 0, 58)"])',
    ];

    for (const pattern of patterns) {
      try {
        const elements = productElement.querySelectorAll(pattern);
        for (const element of elements) {
          const text =
            element.textContent?.trim() ||
            element.getAttribute("title")?.trim();

          if (
            text &&
            text.length >= 10 &&
            !this.looksLikePrice(text) &&
            !this.looksLikeRating(text) &&
            this.looksLikeProductName(text)
          ) {
            return text;
          }
        }
      } catch (error) {
        continue;
      }
    }

    return "";
  },

  /**
   * Check if text looks like a price
   */
  looksLikePrice(text) {
    return /^\$?\d+\.?\d*$|^\$?\?\.\d+/.test(text.trim());
  },

  /**
   * Check if text looks like a rating
   */
  looksLikeRating(text) {
    return (
      /^\d+\.?\d*\s*\(\d+\.?\d*k?\)$|^\d+\.?\d*$/.test(text.trim()) &&
      text.length < 10
    );
  },

  /**
   * Check if text looks like a product name with enhanced validation
   */
  looksLikeProductName(text) {
    if (!text || text.length < 5) return false;

    // Enhanced skip patterns for better filtering
    const skipPatterns = [
      // Prices
      /^\$?\d+\.?\d*$|^\$?\?\.\d+/,

      // Ratings and reviews
      /^\d+\.?\d*\s*\(\d+\.?\d*k?\)$/,
      /^\d+\.?\d*$/,

      // Common UI elements
      /^(add to cart|buy now|shop now|view all|see more|load more)$/i,
      /^(free shipping|fast delivery|sold)$/i,

      // Very short text
      /^.{1,4}$/,

      // Only numbers or symbols
      /^[\d\s\-\$\.\,\(\)]+$/,

      // Promotional text
      /^(sale|hot|new|trending|\d+% off)$/i,

      // Common Lazada elements
      /^(\d+ sold|\d+k reviews?|lazada|shopee)$/i,
    ];

    // Check against skip patterns
    for (const pattern of skipPatterns) {
      if (pattern.test(text.trim())) {
        return false;
      }
    }

    // Must have some alphabetic characters
    if (!/[a-zA-Z]{3,}/.test(text)) {
      return false;
    }

    // Should look like product description
    const productIndicators = [
      /\b(pack|set|piece|pcs|ml|kg|gram|liter|size|color|model)\b/i,
      /\b(for|with|and|the|of|in)\b/i,
      /[a-zA-Z]{10,}/, // Long words typical of product names
    ];

    let hasIndicator = false;
    for (const pattern of productIndicators) {
      if (pattern.test(text)) {
        hasIndicator = true;
        break;
      }
    }

    return hasIndicator && text.length <= 200; // Reasonable max length
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
      const priceElement = productElement.querySelector(
        siteConfig.PRICE_SELECTOR || '.price, [class*="price"]'
      );
      if (priceElement) {
        metadata.price = priceElement.textContent.trim();
      }

      // Extract rating if available
      const ratingElement = productElement.querySelector(
        siteConfig.RATING_SELECTOR || '[class*="rating"], [class*="star"]'
      );
      if (ratingElement) {
        metadata.rating = ratingElement.textContent.trim();
      }

      // Extract image if available
      const imageElement = productElement.querySelector("img[src]");
      if (imageElement) {
        metadata.image = imageElement.src;
      }

      // Extract brand if available
      const brandElement = productElement.querySelector(
        siteConfig.BRAND_SELECTOR || '[class*="brand"]'
      );
      if (brandElement) {
        metadata.brand = brandElement.textContent.trim();
      }
    } catch (error) {
      if (window.AutoGreenLogger) {
        window.AutoGreenLogger.error(
          "Error extracting product metadata:",
          error
        );
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
      logger.info(
        `Extracted ${products.length} products from ${elements.length} elements`
      );
    }

    return products;
  },
};

// Make Product Extractor available globally
if (typeof window !== "undefined") {
  window.AutoGreenProductExtractor = AutoGreenProductExtractor;
}
