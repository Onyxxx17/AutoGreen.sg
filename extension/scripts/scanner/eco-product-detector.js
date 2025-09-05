/**
 * AutoGreen.sg Extension - Eco-Friendly Product Detector
 *
 * Detects eco-friendly products based on keywords and adds visual indicators
 *
 * @author AutoGreen Team
 * @version 1.0.0
 */

class AutoGreenEcoProductDetector {
  constructor() {
    this.config = window.AutoGreenConfig;
    this.logger = window.AutoGreenLogger;
    this.utils = window.AutoGreenUtils;
    this.processedProducts = new Set();
    
    // Define eco-friendly keywords
    this.ecoKeywords = {
      // Primary eco-friendly terms
      primary: [
        'eco-friendly', 'eco friendly', 'eco', 'green', 'sustainable', 
        'biodegradable', 'compostable', 'recyclable', 'recycled',
        'organic', 'natural', 'bamboo', 'hemp', 'solar',
        'renewable', 'zero waste', 'carbon neutral', 'eco-conscious'
      ],
      
      // Secondary environmental terms
      secondary: [
        'environmentally friendly', 'earth friendly', 'planet friendly',
        'reusable', 'non-toxic', 'chemical-free', 'plastic-free',
        'vegan', 'cruelty-free', 'fair trade', 'ethically sourced',
        'locally sourced', 'energy efficient', 'low carbon',
        'upcycled', 'refillable', 'minimal packaging'
      ],
      
      // Material-based eco terms
      materials: [
        'cork', 'jute', 'linen', 'cotton organic', 'wood',
        'glass', 'stainless steel', 'silicone', 'ceramic',
        'bio-based', 'plant-based', 'wheat straw', 'coconut',
        'recycled plastic', 'rPET', 'FSC certified'
      ]
    };
    
    this.initialize();
  }

  /**
   * Initialize the eco-friendly detector
   */
  initialize() {
    this.logger.log('Initializing Eco-Friendly Product Detector...');
    
    // Add CSS styles for eco indicators
    this.addEcoStyles();
    
    // Start monitoring for products
    this.startMonitoring();
    
    this.logger.log('Eco-Friendly Product Detector initialized successfully');
  }

  /**
   * Add CSS styles for eco-friendly indicators
   */
  addEcoStyles() {
    const styles = `
      .autogreen-eco-indicator {
        position: absolute !important;
        top: 8px !important;
        right: 8px !important;
        background: linear-gradient(135deg, #4CAF50, #45A049) !important;
        color: white !important;
        padding: 4px 8px !important;
        border-radius: 12px !important;
        font-size: 11px !important;
        font-weight: bold !important;
        z-index: 10 !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
        font-family: Arial, sans-serif !important;
        text-shadow: 0 1px 1px rgba(0,0,0,0.3) !important;
        animation: autogreen-pulse 2s infinite !important;
      }

      .autogreen-eco-border {
        border: 3px solid #4CAF50 !important;
        border-radius: 8px !important;
        box-shadow: 0 0 10px rgba(76, 175, 80, 0.3) !important;
        position: relative !important;
      }

      .autogreen-eco-glow {
        box-shadow: 0 0 15px rgba(76, 175, 80, 0.5) !important;
      }

      @keyframes autogreen-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      .autogreen-eco-tooltip {
        position: absolute !important;
        background: rgba(0, 0, 0, 0.9) !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 6px !important;
        font-size: 12px !important;
        z-index: 1000 !important;
        opacity: 0 !important;
        transition: opacity 0.3s !important;
        pointer-events: none !important;
        white-space: nowrap !important;
        font-family: Arial, sans-serif !important;
      }

      .autogreen-eco-indicator:hover + .autogreen-eco-tooltip,
      .autogreen-eco-border:hover .autogreen-eco-tooltip {
        opacity: 1 !important;
      }
    `;

    // Remove existing styles if any
    const existingStyles = document.getElementById('autogreen-eco-styles');
    if (existingStyles) {
      existingStyles.remove();
    }

    // Add new styles
    const styleSheet = document.createElement('style');
    styleSheet.id = 'autogreen-eco-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  /**
   * Start monitoring for products to check for eco-friendliness
   */
  startMonitoring() {
    // Initial scan
    setTimeout(() => this.scanForEcoProducts(), 1000);

    // Set up observers for dynamic content
    this.setupObservers();

    // Periodic scan for newly loaded products
    this.periodicScanInterval = setInterval(() => this.scanForEcoProducts(), 3000);

    // Listen for navigation changes
    this.setupNavigationListener();
  }

  /**
   * Setup navigation listener to reset on page changes
   */
  setupNavigationListener() {
    let lastUrl = window.location.href;
    
    // Use MutationObserver to detect URL changes (for SPA navigation)
    const urlObserver = new MutationObserver(() => {
      if (lastUrl !== window.location.href) {
        lastUrl = window.location.href;
        this.logger.log('Page navigation detected, resetting eco detector');
        this.reset();
        setTimeout(() => this.scanForEcoProducts(), 2000);
      }
    });

    urlObserver.observe(document, { subtree: true, childList: true });

    // Also listen for traditional navigation events
    window.addEventListener('popstate', () => {
      this.reset();
      setTimeout(() => this.scanForEcoProducts(), 1000);
    });
  }

  /**
   * Set up observers for dynamically loaded content
   */
  setupObservers() {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node contains product elements
              const hasProducts = this.hasProductElements(node);
              if (hasProducts) {
                shouldScan = true;
              }
            }
          });
        }
      });

      if (shouldScan) {
        setTimeout(() => this.scanForEcoProducts(), 500);
      }
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Check if an element contains product elements
   */
  hasProductElements(element) {
    const selectors = this.config.getSelectorForSite(window.location.href);
    return element.querySelector && element.querySelector(selectors.PRODUCT_CONTAINER);
  }

  /**
   * Scan for eco-friendly products on the current page
   */
  scanForEcoProducts() {
    try {
      const currentUrl = window.location.href;
      
      // Only scan on supported e-commerce sites
      if (!this.isSupportedEcommerceSite(currentUrl)) {
        this.logger.debug('Current site not supported for eco-product detection');
        return;
      }

      // Try to use validated products from main detector first
      let validatedProducts = this.getValidatedProductsFromMainDetector();
      
      if (validatedProducts.length === 0) {
        // Fallback to our own validation
        validatedProducts = this.getValidatedProductsDirectly();
      }

      this.logger.debug(`Found ${validatedProducts.length} validated products to check for eco-friendliness`);

      let ecoProductsFound = 0;

      validatedProducts.forEach((productInfo, index) => {
        const element = productInfo.element;
        const productId = this.generateProductId(element, index);
        
        // Skip if already processed
        if (this.processedProducts.has(productId)) {
          return;
        }

        const isEcoFriendly = this.checkIfEcoFriendly(element);
        
        if (isEcoFriendly.isEco) {
          this.addEcoIndicator(element, isEcoFriendly);
          ecoProductsFound++;
          this.logger.debug(`Eco-friendly product found: ${isEcoFriendly.matchedKeywords.join(', ')}`);
        }

        this.processedProducts.add(productId);
      });

      if (ecoProductsFound > 0) {
        this.logger.log(`Found ${ecoProductsFound} eco-friendly products out of ${validatedProducts.length} total products`);
        // Show eco-friendly counter and store statistics for popup access
        this.showEcoCounter(ecoProductsFound);
        this.storeEcoStats(ecoProductsFound, validatedProducts.length);
      }

    } catch (error) {
      this.logger.error('Error scanning for eco-friendly products:', error);
    }
  }

  /**
   * Get validated products from the main detector
   */
  getValidatedProductsFromMainDetector() {
    const products = [];
    
    try {
      if (window.autoGreenDetector && typeof window.autoGreenDetector.getVisibleProducts === 'function') {
        return window.autoGreenDetector.getVisibleProducts();
      }
      
      // Fallback: try to get from stored products
      if (this.utils && typeof this.utils.getStoredProducts === 'function') {
        const storedProducts = this.utils.getStoredProducts();
        return storedProducts.map(product => ({
          ...product,
          element: document.querySelector(`[data-product-id="${product.id}"]`) || 
                   this.findElementByProductInfo(product)
        })).filter(product => product.element);
      }
      
    } catch (error) {
      this.logger.error('Error getting products from main detector:', error);
    }
    
    return products;
  }

  /**
   * Get validated products directly using our own validation
   */
  getValidatedProductsDirectly() {
    const products = [];
    
    try {
      const selectors = this.config.getSelectorForSite(window.location.href);
      if (!selectors) return products;

      const productElements = document.querySelectorAll(selectors.PRODUCT_CONTAINER);
      
      productElements.forEach((element, index) => {
        if (this.isValidProductElement(element)) {
          products.push({
            element: element,
            id: this.generateProductId(element, index)
          });
        }
      });
      
    } catch (error) {
      this.logger.error('Error getting products directly:', error);
    }
    
    return products;
  }

  /**
   * Find element by product info (fallback method)
   */
  findElementByProductInfo(productInfo) {
    try {
      // Try to find by position
      if (productInfo.position) {
        const elements = document.querySelectorAll('*');
        for (let element of elements) {
          const rect = element.getBoundingClientRect();
          if (Math.abs(rect.top - productInfo.position) < 10) {
            return element;
          }
        }
      }
      
      // Try to find by link
      if (productInfo.link) {
        return document.querySelector(`a[href="${productInfo.link}"]`);
      }
      
    } catch (error) {
      this.logger.error('Error finding element by product info:', error);
    }
    
    return null;
  }

  /**
   * Check if current site is supported for eco-product detection
   */
  isSupportedEcommerceSite(url) {
    const supportedPatterns = [
      /lazada\.(sg|com\.sg)/i,
      /shopee\.sg/i,
      /foodpanda\.(sg|com\.sg)/i
    ];

    return supportedPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Generate unique ID for a product element
   */
  generateProductId(element, index) {
    const rect = element.getBoundingClientRect();
    return `eco-product-${Math.round(rect.top)}-${Math.round(rect.left)}-${index}`;
  }

  /**
   * Validate that an element is actually a product container
   */
  isValidProductElement(element) {
    try {
      // Use the same validation as the main product detector
      if (window.AutoGreenProductExtractor) {
        const productInfo = window.AutoGreenProductExtractor.extractProductInfo(element, 0);
        return productInfo !== null;
      }

      // Fallback validation if main extractor not available
      const hasProductLink = element.querySelector('a[href*="/products/"], a[href*="pdp-"], a[title], a[href*="item."]');
      const hasProductPrice = element.querySelector('.price, [class*="price"], [data-price], .lzd-price, [data-price-type]');
      const hasProductImage = element.querySelector('img[src], .item-card-img, .ant-image-img, [class*="image"]');
      const hasProductTitle = element.querySelector('[title], [class*="title"], [class*="name"], span');

      // Must have at least a link and either price or image or meaningful title
      if (!hasProductLink) {
        return false;
      }

      // Additional validation: element should have some minimum content
      const textContent = element.textContent?.trim() || '';
      if (textContent.length < 10) {
        return false;
      }

      // Should have at least one other product indicator
      const hasProductIndicators = hasProductPrice || hasProductImage || hasProductTitle;
      
      // Check if it's not a navigation or header element
      const isNavigationElement = element.closest('nav, header, footer, .navigation, .breadcrumb, .menu');
      if (isNavigationElement) {
        return false;
      }

      // Check if it's not a sidebar or filter element
      const isSidebarElement = element.closest('.sidebar, .filter, .sort, .pagination, [class*="filter"], [class*="sort"]');
      if (isSidebarElement) {
        return false;
      }

      // Check element size - too small elements are likely not product cards
      const rect = element.getBoundingClientRect();
      if (rect.width < 100 || rect.height < 80) {
        return false;
      }

      return hasProductIndicators;

    } catch (error) {
      this.logger.error('Error validating product element:', error);
      return false;
    }
  }

  /**
   * Check if a product is eco-friendly based on its content
   */
  checkIfEcoFriendly(element) {
    const result = {
      isEco: false,
      matchedKeywords: [],
      confidence: 0
    };

    try {
      // Extract all text content from the product element
      const textContent = this.extractProductText(element);
      
      if (!textContent) {
        return result;
      }

      const lowerText = textContent.toLowerCase();
      
      // Check for eco-friendly keywords
      const allKeywords = [
        ...this.ecoKeywords.primary,
        ...this.ecoKeywords.secondary,
        ...this.ecoKeywords.materials
      ];

      let score = 0;
      const matched = [];

      allKeywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          matched.push(keyword);
          
          // Different weights for different keyword types
          if (this.ecoKeywords.primary.includes(keyword)) {
            score += 3;
          } else if (this.ecoKeywords.secondary.includes(keyword)) {
            score += 2;
          } else {
            score += 1;
          }
        }
      });

      result.matchedKeywords = matched;
      result.confidence = Math.min(score / 3, 1); // Normalize to 0-1
      result.isEco = score >= 1; // At least one keyword match

      return result;

    } catch (error) {
      this.logger.error('Error checking eco-friendliness:', error);
      return result;
    }
  }

  /**
   * Extract all relevant text from a product element
   */
  extractProductText(element) {
    let text = '';

    try {
      // Priority 1: Get title from title attributes (most reliable)
      const titleSources = [
        element.getAttribute('title'),
        element.querySelector('a[title]')?.getAttribute('title'),
        element.querySelector('[title]')?.getAttribute('title')
      ];

      titleSources.forEach(source => {
        if (source && typeof source === 'string' && source.length > 5) {
          text += ' ' + source;
        }
      });

      // Priority 2: Get text from specific product title elements
      const productTitleSelectors = [
        '.product-title',
        '.item-title',
        '.product-name', 
        '.item-name',
        '[class*="title"]:not(.page-title):not(.site-title)',
        '[class*="name"]:not(.user-name):not(.site-name)'
      ];

      productTitleSelectors.forEach(selector => {
        const titleEl = element.querySelector(selector);
        if (titleEl && titleEl.textContent && titleEl.textContent.length > 5) {
          text += ' ' + titleEl.textContent;
        }
      });

      // Priority 3: Get description text (but avoid UI elements)
      const descriptionSelectors = [
        '.product-description',
        '.item-description', 
        '.product-details',
        '[class*="desc"]:not(.sort-desc):not(.filter-desc)',
        'p:not(.price):not(.shipping):not(.delivery)'
      ];

      descriptionSelectors.forEach(selector => {
        const elements = element.querySelectorAll(selector);
        elements.forEach(el => {
          // Avoid extracting from elements that look like UI controls
          if (el.textContent && 
              el.textContent.length > 10 && 
              !el.closest('.price, .rating, .button, .btn, .control, .nav')) {
            text += ' ' + el.textContent;
          }
        });
      });

      // Priority 4: Fallback to main element text but filtered
      if (text.trim().length < 20) {
        const elementText = element.textContent;
        if (elementText && elementText.length > 10) {
          // Filter out common UI text patterns
          const filteredText = elementText
            .replace(/(\$|\€|\£|\¥)[0-9.,]+/g, '') // Remove prices
            .replace(/\b(Sort|Filter|View|Add|Cart|Buy|Rating|Reviews?|Stars?)\b/gi, '') // Remove UI terms
            .replace(/\b[0-9]+\s*(reviews?|stars?|rating)\b/gi, '') // Remove rating text
            .trim();
          
          if (filteredText.length > 20) {
            text += ' ' + filteredText;
          }
        }
      }

      return text.trim();

    } catch (error) {
      this.logger.error('Error extracting product text:', error);
      return '';
    }
  }

  /**
   * Add eco-friendly indicator to a product element
   */
  addEcoIndicator(element, ecoInfo) {
    try {
      // Find the outermost product container to ensure consistent border placement
      const productContainer = this.findProductContainer(element);
      
      // Check if element already has eco indicators
      if (productContainer.querySelector('.autogreen-eco-indicator') || productContainer.classList.contains('autogreen-eco-border')) {
        return;
      }

      // Check if element is visible and has reasonable size
      const rect = productContainer.getBoundingClientRect();
      if (rect.width < 100 || rect.height < 80 || rect.width > window.innerWidth || rect.height > window.innerHeight) {
        return;
      }

      // Check if element is actually visible on screen
      const style = window.getComputedStyle(productContainer);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return;
      }

      // Add eco-friendly border to the main container
      productContainer.classList.add('autogreen-eco-border');
      
      // Add glow effect for high confidence products
      if (ecoInfo.confidence > 0.7) {
        productContainer.classList.add('autogreen-eco-glow');
      }

      // Create eco indicator badge
      const indicator = document.createElement('div');
      indicator.className = 'autogreen-eco-indicator';
      indicator.innerHTML = '🌱 ECO';
      
      // Create tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'autogreen-eco-tooltip';
      tooltip.textContent = `Eco-friendly: ${ecoInfo.matchedKeywords.slice(0, 3).join(', ')}`;
      
      // Position the indicator and tooltip on the main container
      productContainer.style.position = 'relative';
      productContainer.appendChild(indicator);
      productContainer.appendChild(tooltip);

      // Add click handler for more info
      indicator.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showEcoDetails(ecoInfo);
      });

    } catch (error) {
      this.logger.error('Error adding eco indicator:', error);
    }
  }

  /**
   * Find the product container element
   */
  findProductContainer(element) {
    // Just return the original element without trying to find a better container
    return element;
  }

  /**
   * Show detailed eco-friendly information
   */
  showEcoDetails(ecoInfo) {
    const message = `🌱 Eco-Friendly Product Found!\n\nMatched keywords: ${ecoInfo.matchedKeywords.join(', ')}\nConfidence: ${Math.round(ecoInfo.confidence * 100)}%`;
    
    // Use the existing UI manager if available
    if (window.AutoGreenUIManager) {
      const ui = new window.AutoGreenUIManager();
      ui.showIndicator(message, 'success', 5000);
    } else {
      this.logger.log(message);
    }
  }

  /**
   * Show eco-friendly counter
   */
  showEcoCounter(count) {
    try {
      if (window.AutoGreenUIManager) {
        const ui = new window.AutoGreenUIManager();
        ui.showEcoCounter(count);
      } else {
        this.logger.error('UI Manager not available for eco counter');
      }
    } catch (error) {
      this.logger.error('Error showing eco counter:', error);
    }
  }

  /**
   * Store eco-friendly statistics for popup access
   */
  storeEcoStats(ecoCount, totalCount) {
    try {
      const currentTime = Date.now();
      const sessionId = this.getOrCreateSessionId();
      
      const ecoStats = {
        sessionId: sessionId,
        timestamp: currentTime,
        ecoProductsFound: ecoCount,
        totalProducts: totalCount,
        percentage: Math.round((ecoCount / totalCount) * 100),
        url: window.location.href,
        siteName: this.getSiteName()
      };

      // Store current session stats
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({
          [this.config.STORAGE.ECO_STATS]: ecoStats
        });
      }

      // Update cumulative eco products count
      this.updateCumulativeEcoCount(ecoCount);

    } catch (error) {
      this.logger.error('Error storing eco stats:', error);
    }
  }

  /**
   * Update cumulative eco products count for the user
   */
  updateCumulativeEcoCount(newEcoCount) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get([this.config.STORAGE.ECO_PRODUCTS], (result) => {
          const existingData = result[this.config.STORAGE.ECO_PRODUCTS] || {
            totalEcoProducts: 0,
            sessionsCount: 0,
            lastUpdated: 0
          };

          // Only update if this is a new session or significant time has passed
          const timeDiff = Date.now() - existingData.lastUpdated;
          const shouldUpdate = timeDiff > 300000; // 5 minutes

          if (shouldUpdate && newEcoCount > 0) {
            existingData.totalEcoProducts += newEcoCount;
            existingData.sessionsCount += 1;
            existingData.lastUpdated = Date.now();

            chrome.storage.local.set({
              [this.config.STORAGE.ECO_PRODUCTS]: existingData
            });

            this.logger.log(`Updated cumulative eco products: ${existingData.totalEcoProducts}`);
          }
        });
      }
    } catch (error) {
      this.logger.error('Error updating cumulative eco count:', error);
    }
  }

  /**
   * Get or create a session ID for tracking
   */
  getOrCreateSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  /**
   * Get site name for statistics
   */
  getSiteName() {
    const url = window.location.href;
    if (url.includes('lazada')) return 'Lazada';
    if (url.includes('shopee')) return 'Shopee';
    if (url.includes('foodpanda')) return 'FoodPanda';
    return 'Unknown';
  }

  /**
   * Reset processed products (useful for page navigation)
   */
  reset() {
    this.processedProducts.clear();
    
    // Clear existing indicators
    const existingIndicators = document.querySelectorAll('.autogreen-eco-indicator, .autogreen-eco-tooltip');
    existingIndicators.forEach(indicator => indicator.remove());
    
    // Remove eco styling from products
    const ecoProducts = document.querySelectorAll('.autogreen-eco-border, .autogreen-eco-glow');
    ecoProducts.forEach(product => {
      product.classList.remove('autogreen-eco-border', 'autogreen-eco-glow');
    });
    
    // Remove stats counter
    const statsCounter = document.getElementById('autogreen-eco-stats');
    if (statsCounter) {
      statsCounter.remove();
    }
    
    // Remove eco counter
    const ecoCounter = document.getElementById('autogreen-eco-counter');
    if (ecoCounter) {
      ecoCounter.remove();
    }
    
    this.logger.log('Eco-friendly detector reset');
  }

  /**
   * Cleanup method for destroying the detector
   */
  destroy() {
    if (this.periodicScanInterval) {
      clearInterval(this.periodicScanInterval);
    }
    
    this.reset();
    
    // Remove styles
    const styleSheet = document.getElementById('autogreen-eco-styles');
    if (styleSheet) {
      styleSheet.remove();
    }
    
    this.logger.log('Eco-friendly detector destroyed');
  }
}

// Make the class available globally
if (typeof window !== 'undefined') {
  window.AutoGreenEcoProductDetector = AutoGreenEcoProductDetector;
}
