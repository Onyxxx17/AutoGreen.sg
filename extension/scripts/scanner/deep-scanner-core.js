/**
 * AutoGreen.sg Extension - Deep Scanner Core
 *
 * Core deep scanning functionality with queue management
 *
 * @author AutoGreen Team
 * @version 1.0.0
 */

class AutoGreenDeepScannerCore {
  constructor() {
    this.scanQueue = [];
    this.activeScanners = 0;
    this.isDeepScanEnabled = false;
    this.scannedProducts = new Map();
    this.failedScans = new Map();

    // Check if dependencies are available
    if (!window.AutoGreenConfig) {
      console.error("[AutoGreen DeepScanner] Config not available");
      return;
    }
    if (!window.AutoGreenLogger) {
      console.error("[AutoGreen DeepScanner] Logger not available");
      return;
    }
    if (!window.AutoGreenUtils) {
      console.error("[AutoGreen DeepScanner] Utils not available");
      return;
    }

    this.config = window.AutoGreenConfig;
    this.logger = window.AutoGreenLogger;
    this.utils = window.AutoGreenUtils;
    this.ui = null;

    this.initialize();
  }

  /**
   * Initialize the deep scanner
   */
  async initialize() {
    if (!this.config || !this.logger) {
      console.error(
        "[AutoGreen DeepScanner] Cannot initialize without config and logger"
      );
      return;
    }

    this.logger.log("Initializing Deep Scanner Core...");

    // Initialize UI manager instance
    if (window.AutoGreenUIManager) {
      this.ui = new window.AutoGreenUIManager();
    } else {
      this.logger.warn("UI Manager not available");
    }

    // Check if deep scan is enabled
    this.isDeepScanEnabled = await this.getDeepScanStatus();

    if (this.isDeepScanEnabled) {
      this.logger.log("Deep scan is enabled");
    } else {
      this.logger.log("Deep scan is disabled");
    }
  }

  /**
   * Get deep scan enabled status from storage
   */
  async getDeepScanStatus() {
    try {
      if (!this.config || !this.config.STORAGE) {
        this.logger?.warn("Config not available for deep scan status check");
        return false;
      }

      const key = this.config.STORAGE.DEEP_SCAN_ENABLED;
      const result = localStorage.getItem(key);
      return result === "true";
    } catch (error) {
      this.logger?.error("Failed to get deep scan status:", error);
      return this.config?.DEEP_SCAN?.ENABLED_BY_DEFAULT || false;
    }
  }

  /**
   * Set deep scan enabled status
   */
  async setDeepScanStatus(enabled) {
    try {
      if (!this.config || !this.config.STORAGE) {
        this.logger?.error("Config not available for deep scan status setting");
        return;
      }

      const key = this.config.STORAGE.DEEP_SCAN_ENABLED;
      localStorage.setItem(key, enabled.toString());
      this.isDeepScanEnabled = enabled;
      this.logger?.log(`Deep scan ${enabled ? "enabled" : "disabled"}`);

      if (this.ui && this.ui.showIndicator) {
        this.ui.showIndicator(
          `🔍 Deep Scan ${enabled ? "Enabled" : "Disabled"}`,
          enabled ? "success" : "info"
        );
      }
    } catch (error) {
      this.logger?.error("Failed to set deep scan status:", error);
    }
  }

  /**
   * Add products to deep scan queue
   */
  async queueProductsForDeepScan(products) {
    if (!this.isDeepScanEnabled || !products || products.length === 0) {
      return;
    }

    this.logger.log(`Queueing ${products.length} products for deep scan`);

    for (const product of products) {
      if (product.link && !this.scannedProducts.has(product.link)) {
        // Check if this product has failed too many times
        const failCount = this.failedScans.get(product.link) || 0;
        if (failCount >= this.config.DEEP_SCAN.MAX_RETRIES) {
          this.logger.log(
            `Skipping ${product.name} - too many failed attempts`
          );
          continue;
        }

        // Validate URL before queueing
        if (this.isValidProductUrl(product.link)) {
          this.scanQueue.push({
            ...product,
            queuedAt: Date.now(),
            retryCount: failCount,
          });
        } else {
          this.logger.log(`Skipping invalid URL: ${product.link}`);
        }
      }
    }

    // Start processing queue if not already running
    this.processQueue();
  }

  /**
   * Validate if URL is suitable for deep scanning
   */
  isValidProductUrl(url) {
    try {
      const urlObj = new URL(url);

      // Check if it's a Lazada/Shopee product page
      const isLazada = urlObj.hostname.includes("lazada");
      const isShopee = urlObj.hostname.includes("shopee");

      if (!isLazada && !isShopee) {
        return false;
      }

      // For Lazada, ensure it's a product detail page
      if (isLazada) {
        const hasProductPath =
          urlObj.pathname.includes(".html") &&
          (urlObj.pathname.includes("/products/") ||
            urlObj.pathname.includes("-i") ||
            urlObj.search.includes("product"));

        // Also check for the specific pattern in your URL
        const hasValidPattern = /pdp-i\d+-s\d+\.html/.test(urlObj.pathname);

        const isValid = hasProductPath || hasValidPattern;

        if (!isValid) {
          this.logger.log(`URL validation failed for: ${url}`);
          this.logger.log(`Path: ${urlObj.pathname}, Search: ${urlObj.search}`);
        }

        return isValid;
      }

      return true;
    } catch (error) {
      this.logger.error("Invalid URL:", url, error);
      return false;
    }
  }

  /**
   * Process the scan queue with concurrency control
   */
  async processQueue() {
    while (
      this.scanQueue.length > 0 &&
      this.activeScanners < this.config.DEEP_SCAN.MAX_CONCURRENT_SCANS
    ) {
      const product = this.scanQueue.shift();
      this.scanProduct(product);
    }
  }

  /**
   * Scan individual product page
   */
  async scanProduct(product) {
    this.activeScanners++;

    try {
      this.logger.log(
        `Deep scanning: ${product.name.substring(0, 50)}... (Attempt ${
          (product.retryCount || 0) + 1
        })`
      );

      if (this.ui && this.ui.showIndicator) {
        this.ui.showIndicator(
          `🔍 Deep scanning: ${product.name.substring(0, 30)}...`,
          "info",
          3000
        );
      }

      let productDetails;

      try {
        // Try iframe method first (use external extractor)
        if (window.AutoGreenIframeExtractor) {
          const iframe =
            await window.AutoGreenIframeExtractor.createHiddenIframe(
              product.link
            );

          // Debug iframe content for troubleshooting
          window.AutoGreenIframeExtractor.debugIframeContent(iframe);

          productDetails =
            await window.AutoGreenContentExtractor.extractProductDetails(
              iframe
            );
          window.AutoGreenIframeExtractor.removeIframe(iframe);
        } else {
          throw new Error("Iframe extractor not available");
        }
      } catch (iframeError) {
        this.logger.warn(`Iframe method failed: ${iframeError.message}`);

        // More detailed error logging
        if (iframeError.message.includes("timeout")) {
          this.logger.warn(
            `Page loading timeout for: ${product.link} - Site may be slow or using anti-bot measures`
          );
        } else if (iframeError.message.includes("network")) {
          this.logger.warn(
            `Network error for: ${product.link} - Connection issues or site blocking`
          );
        }

        // Fallback to fetch method for difficult pages
        this.logger.log("Trying fetch method as fallback...");
        productDetails = await this.extractProductDetailsViaFetch(product.link);
      }

      // Store the deep scan results with proper error handling
      try {
        await this.storeDeepScanResults(product, productDetails);
        this.logger.debug(
          `Successfully stored deep scan results for: ${product.name.substring(
            0,
            30
          )}...`
        );
      } catch (storageError) {
        this.logger.error(
          `Failed to store deep scan results for ${product.name}:`,
          storageError
        );

        // Still mark as successful scan even if storage fails
        this.logger.warn(
          "Deep scan completed but results could not be stored - continuing with next product"
        );

        if (this.ui && this.ui.showIndicator) {
          this.ui.showIndicator(
            `⚠️ Scan completed but storage failed`,
            "warning",
            3000
          );
        }
      }

      // Remove from failed scans if it was there
      this.failedScans.delete(product.link);

      this.logger.log(
        `Deep scan completed for: ${product.name.substring(0, 50)}...`
      );

      if (this.ui && this.ui.showIndicator) {
        this.ui.showIndicator(
          `✅ Deep scan completed: ${product.name.substring(0, 30)}...`,
          "success",
          2000
        );
      }
    } catch (error) {
      this.logger.error(`Deep scan failed for ${product.name}:`, error);

      // Track failed attempts
      const currentFailCount = this.failedScans.get(product.link) || 0;
      this.failedScans.set(product.link, currentFailCount + 1);

      // Show appropriate error message
      const isTimeout = error.message.includes("Timeout");
      const isBlocked =
        error.message.includes("blocked") || error.message.includes("denied");
      const isCORS =
        error.message.includes("CORS") || error.message.includes("security");

      let errorMessage = `❌ Deep scan failed`;
      if (isTimeout) {
        errorMessage = `⏱️ Deep scan timeout - Page too slow`;
      } else if (isBlocked || isCORS) {
        errorMessage = `🚫 Deep scan blocked - Security restriction`;
      }

      if (this.ui && this.ui.showIndicator) {
        this.ui.showIndicator(errorMessage, "error", 4000);
      }

      // Store basic failure info with error handling
      try {
        await this.storeFailedScanInfo(product, error);
        this.logger.debug(
          `Stored failure info for: ${product.name.substring(0, 30)}...`
        );
      } catch (storageError) {
        this.logger.error(
          `Failed to store failure info for ${product.name}:`,
          storageError
        );
        this.logger.warn(
          "Scan failure could not be recorded - continuing with error tracking in memory only"
        );
      }
    } finally {
      this.activeScanners--;

      // Add delay before next scan
      setTimeout(() => {
        this.processQueue();
      }, this.config.DEEP_SCAN.DELAY_BETWEEN_REQUESTS);
    }
  }

  /**
   * Fallback method using fetch API (limited but sometimes works)
   */
  async extractProductDetailsViaFetch(url) {
    try {
      this.logger.log("Attempting fetch-based extraction...");

      // This will likely fail due to CORS, but worth trying
      const response = await fetch(url, {
        method: "GET",
        mode: "no-cors", // This limits what we can read but might work
      });

      if (!response.ok) {
        throw new Error("Fetch failed");
      }

      // With no-cors mode, we can't read the response content
      // So this is mainly to check if the URL is accessible
      throw new Error("Fetch method cannot read response due to CORS");
    } catch (error) {
      this.logger.log("Fetch method also failed, storing minimal data");

      // Return minimal data structure
      return {
        highlights: [],
        ingredients: [],
        specifications: {},
        extractedAt: new Date().toISOString(),
        extractionMethod: "fetch_failed",
        error: "Could not extract details due to browser security restrictions",
      };
    }
  }

  /**
   * Get scanning statistics
   */
  getStats() {
    const maxConcurrent = this.config?.DEEP_SCAN?.MAX_CONCURRENT_SCANS || 1;

    return {
      isEnabled: this.isDeepScanEnabled,
      queueLength: this.scanQueue.length,
      activeScanners: this.activeScanners,
      scannedCount: this.scannedProducts.size,
      failedCount: this.failedScans.size,
      maxConcurrent: maxConcurrent,
    };
  }

  /**
   * Toggle deep scan on/off
   */
  async toggleDeepScan() {
    await this.setDeepScanStatus(!this.isDeepScanEnabled);
    return this.isDeepScanEnabled;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.scanQueue = [];
    this.scannedProducts.clear();
    this.failedScans.clear();
    this.logger.log("Deep Scanner Core cleaned up");
  }
}

// Make available globally
if (typeof window !== "undefined") {
  window.AutoGreenDeepScannerCore = AutoGreenDeepScannerCore;
}
