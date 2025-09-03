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

    this.initialize();
  }

  /**
   * Initialize the detector with event listeners and initial processing
   */
  async initialize() {
    this.logger.log("Initializing AutoGreen Product Detector...");

    this.ui.showIndicator("🚀 AutoGreen: Scroll-based detector ready!", "info");

    // Clear previous session data
    this.clearStoredData();

    // Set up event listeners
    this.setupEventListeners();

    // Process initial products after a delay
    setTimeout(() => this.processVisibleProducts(), this.config.INIT_DELAY);

    this.logger.log("AutoGreen Product Detector initialized successfully");
  }

  /**
   * Set up all necessary event listeners
   */
  setupEventListeners() {
    // Scroll event with passive listening for better performance
    window.addEventListener("scroll", () => this.handleScroll(), {
      passive: true,
    });

    // Mutation observer for dynamically loaded content
    const observer = new MutationObserver(() => this.handleDOMChange());

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    this.logger.log("Event listeners set up successfully");
  }

  /**
   * Handle scroll events with debouncing
   */
  handleScroll() {
    this.lastScrollTime = Date.now();

    setTimeout(() => {
      if (Date.now() - this.lastScrollTime >= this.config.SCROLL_DELAY) {
        this.logger.log("Scroll stopped, processing visible products...");
        this.processVisibleProducts();
      }
    }, this.config.SCROLL_DELAY);
  }

  /**
   * Handle DOM changes (for infinite scroll)
   */
  handleDOMChange() {
    this.logger.log("Page content changed");
    setTimeout(() => this.processVisibleProducts(), this.config.MUTATION_DELAY);
  }

  /**
   * Get all products currently visible in the viewport
   */
  getVisibleProducts() {
    const allProducts = document.querySelectorAll(
      this.config.SELECTORS.PRODUCT_CONTAINER
    );
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
      };

      productDataList.push(productData);

      this.logger.log(`Processed: ${product.name.substring(0, 80)}...`);
      if (product.link) {
        this.logger.log(`Product link: ${product.link}`);
      }
    });

    // Store all products at once for better performance
    this.storeProductBatch(productDataList);

    // Update UI
    this.ui.showCounter(this.totalFound);
    this.ui.showIndicator(
      `📦 Processed ${products.length} new products (Total: ${this.totalFound})`,
      "success"
    );
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
   * Process all visible products in batches
   */
  async processVisibleProducts() {
    if (this.isProcessing) {
      this.logger.log("Already processing, skipping...");
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
        for (
          let i = 0;
          i < visibleProducts.length;
          i += this.config.BATCH_SIZE
        ) {
          const batch = visibleProducts.slice(i, i + this.config.BATCH_SIZE);
          this.processBatch(batch);

          // Add delay between batches if there are more to process
          if (i + this.config.BATCH_SIZE < visibleProducts.length) {
            await new Promise((resolve) =>
              setTimeout(resolve, this.config.BATCH_DELAY)
            );
          }
        }
      }
    } catch (error) {
      this.logger.error("Error processing visible products:", error);
      this.ui.showIndicator("Error processing products", "error");
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Clear stored data from previous sessions
   */
  clearStoredData() {
    localStorage.removeItem(this.config.STORAGE_KEY);
    this.logger.log("Cleared previous session data");
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
   * Clean up resources
   */
  cleanup() {
    this.ui.cleanup();
    this.logger.log("AutoGreen detector cleaned up");
  }
}

// Make ProductDetector available globally
if (typeof window !== "undefined") {
  window.AutoGreenProductDetector = AutoGreenProductDetector;
}
