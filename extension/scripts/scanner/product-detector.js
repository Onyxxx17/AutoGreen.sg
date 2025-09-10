/**
 * AutoGreen.sg Extension - Product Detector
 *
 * Main class responsible for detecting and processing products
 * as the user scrolls through Lazada pages
 */

class AutoGreenProductDetector {
  constructor() {
    this.processedProducts = new Set();
    this.isProcessing = false;
    this.totalFound = 0;
    this.lastScrollTime = 0;

    this.config = window.AutoGreenConfig;
    this.logger = window.AutoGreenLogger;
    this.utils = window.AutoGreenUtils;
    this.ui = new window.AutoGreenUIManager();

    // Initialize deep scanner with error handling
    try {
      this.deepScanner = new window.AutoGreenDeepScanner();
      // Set UI reference after deep scanner is created
      if (this.deepScanner) {
        this.deepScanner.ui = this.ui;
        this.logger.log('Deep scanner initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize deep scanner:', error);
      this.deepScanner = null;
    }

    this.initialize();
  }

  /**
   * Store a batch of products efficiently
   */
  storeProductBatch(newProducts) {
    const existingProducts = this.utils.getStoredProducts();
    const updatedProducts = [...existingProducts, ...newProducts];
    this.utils.storeProducts(updatedProducts);
  }

  /**
   * Initialize the detector with event listeners and initial processing
   */
  async initialize() {
    this.logger.log('Initializing AutoGreen Product Detector...');

    // Check if we're on a supported site
    if (!this.utils.isSupportedSite()) {
      this.logger.warn('Current site is not supported');
      this.ui.showIndicator('❌ AutoGreen: Unsupported site', 'warning');
      return;
    }

    this.ui.showIndicator('🚀 AutoGreen: Scroll-based detector ready!', 'info');

    // Clear previous session data
    this.clearStoredData();

    // Set up event listeners
    this.setupEventListeners();

    // Process initial products after a delay
    setTimeout(() => this.processVisibleProducts(), this.config.PERFORMANCE.INIT_DELAY);

    this.logger.log('AutoGreen Product Detector initialized successfully');
  }

  /**
   * Set up all necessary event listeners
   */
  setupEventListeners() {
    // Get scroll delay from config
    const scrollDelay = this.config.PERFORMANCE.SCROLL_DELAY;
    
    // Scroll event with passive listening for better performance
    const debouncedScrollHandler = this.utils.debounce(
      () => this.handleScrollStop(), 
      scrollDelay
    );
    
    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

    // Mutation observer for dynamically loaded content
    const observer = new MutationObserver(
      this.utils.throttle(() => this.handleDOMChange(), this.config.PERFORMANCE.MUTATION_DELAY)
    );

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    this.logger.log('Event listeners set up successfully');
  }

  /**
   * Handle when scrolling stops
   */
  handleScrollStop() {
    // Check if extension is disabled
    if (window.autoGreenDisabled) {
      return;
    }
    this.logger.debug('Scroll stopped, processing visible products...');
    this.processVisibleProducts();
  }

  /**
   * Handle DOM changes (for infinite scroll)
   */
  handleDOMChange() {
    // Check if extension is disabled
    if (window.autoGreenDisabled) {
      return;
    }
    this.logger.debug('Page content changed');
    setTimeout(() => this.processVisibleProducts(), this.config.PERFORMANCE.MUTATION_DELAY);
  }

  /**
   * Get all products currently visible in the viewport
   */
  getVisibleProducts() {
    const siteConfig = this.utils.getCurrentSiteConfig();
    if (!siteConfig) {
      this.logger.warn('No site configuration available for current page');
      return [];
    }

    const allProducts = document.querySelectorAll(siteConfig.PRODUCT_CONTAINER);
    const visibleProducts = [];

    allProducts.forEach((product, index) => {
      if (this.utils.isElementVisible(product)) {
        const productInfo = this.utils.extractProductInfo(product, index);

        if (productInfo && !this.processedProducts.has(productInfo.id)) {
          visibleProducts.push(productInfo);
        }
      }
    });

    return visibleProducts;
  }

  /**
   * Process a batch of products
   */
  processBatch(products) {
    if (products.length === 0) return;

    this.logger.log(`Processing batch of ${products.length} products`);

    const productDataList = [];

    products.forEach((product) => {
      this.processedProducts.add(product.id);
      this.totalFound++;

      const productData = {
        name: product.name,
        link: product.link,
        url: window.location.href,
        position: product.position,
        timestamp: new Date().toISOString(),
        siteType: product.siteType,
        extractedAt: product.extractedAt,
      };

      productDataList.push(productData);

      this.logger.debug(`Processed: ${product.name.substring(0, 80)}...`);
      if (product.link) {
        this.logger.debug(`Product link: ${product.link}`);
      }
    });

    // Store all products at once for better performance
    this.storeProductBatch(productDataList);

    // Queue products for deep scanning if enabled
    if (this.deepScanner) {
      this.deepScanner.queueProductsForDeepScan(products);
    }

    // Update UI counter only
    this.ui.showCounter(this.totalFound);
    // Removed product count indicator message
  }

  /**
   * Process all visible products in batches
   */
  async processVisibleProducts() {
    // Check if extension is disabled
    if (window.autoGreenDisabled) {
      return;
    }
    
    if (this.isProcessing) {
      this.logger.debug('Already processing, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      const visibleProducts = this.getVisibleProducts();

      if (visibleProducts.length > 0) {
        this.logger.log(
          `Found ${visibleProducts.length} new products to process`
        );

        // Process in batches to avoid blocking the UI
        const batchSize = this.config.PERFORMANCE.BATCH_SIZE;
        for (let i = 0; i < visibleProducts.length; i += batchSize) {
          const batch = visibleProducts.slice(i, i + batchSize);
          this.processBatch(batch);

          // Add delay between batches if there are more to process
          if (i + batchSize < visibleProducts.length) {
            await new Promise((resolve) =>
              setTimeout(resolve, this.config.PERFORMANCE.BATCH_DELAY)
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing visible products:', error);
      this.ui.showIndicator('Error processing products', 'error');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Clear stored data from previous sessions
   */
  clearStoredData() {
    const storageKey = this.config.STORAGE.PRODUCTS;
    localStorage.removeItem(storageKey);
    this.logger.log('Cleared previous session data');
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      totalProcessed: this.totalFound,
      currentlyProcessing: this.isProcessing,
      processedIds: this.processedProducts.size,
    };
  }

  /**
   * Get deep scan statistics
   */
  getDeepScanStats() {
    if (!this.deepScanner) {
      this.logger.warn('Deep scanner not initialized');
      return {
        isEnabled: false,
        queueLength: 0,
        activeScanners: 0,
        scannedCount: 0,
        failedCount: 0,
        maxConcurrent: 1,
      };
    }
    
    try {
      return this.deepScanner.getStats();
    } catch (error) {
      this.logger.error('Error getting deep scan stats:', error);
      return {
        isEnabled: false,
        queueLength: 0,
        activeScanners: 0,
        scannedCount: 0,
        failedCount: 0,
        maxConcurrent: 1,
        error: error.message,
      };
    }
  }

  /**
   * Toggle deep scan on/off
   */
  async toggleDeepScan() {
    if (!this.deepScanner) {
      this.logger.error('Deep scanner not initialized, cannot toggle');
      return false;
    }
    
    try {
      return await this.deepScanner.toggleDeepScan();
    } catch (error) {
      this.logger.error('Error toggling deep scan:', error);
      return false;
    }
  }

  /**
   * Get deep scan status
   */
  async getDeepScanStatus() {
    if (!this.deepScanner) {
      this.logger.warn('Deep scanner not initialized');
      return false;
    }
    
    try {
      return await this.deepScanner.getDeepScanStatus();
    } catch (error) {
      this.logger.error('Error getting deep scan status:', error);
      return false;
    }
  }

  /**
   * Export all data (basic + deep scan)
   */
  exportAllData() {
    const basicProducts = this.utils.getStoredProducts();
    const deepScanData = this.deepScanner
      ? this.deepScanner.getStoredDeepScanData()
      : {};

    return {
      basicProducts,
      deepScanData,
      exportedAt: new Date().toISOString(),
      stats: this.getStats(),
      deepScanStats: this.getDeepScanStats(),
    };
  }

  /**
   * Clear all data including deep scan
   */
  clearAllData() {
    // Clear basic data
    this.clearStoredData();

    // Clear deep scan data
    if (this.deepScanner) {
      this.deepScanner.clearDeepScanData();
    }

    // Reset counters
    this.processedProducts.clear();
    this.totalFound = 0;

    // Update UI
    this.ui.showCounter(0);
    this.ui.showIndicator("🗑️ All data cleared", "info");
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.ui.cleanup();

    // Clean up deep scanner
    if (this.deepScanner) {
      this.deepScanner.cleanup();
    }

    this.logger.log("AutoGreen detector cleaned up");
  }
}

// Make ProductDetector available globally
if (typeof window !== "undefined") {
  window.AutoGreenProductDetector = AutoGreenProductDetector;
}
