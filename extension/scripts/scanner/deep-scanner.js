/**
 * AutoGreen.sg Extension - Deep Scanner (Refactored)
 *
 * Main deep scanner class that orchestrates all scanning operations
 * Uses modular components for better maintainability
 *
 * @author AutoGreen Team
 * @version 1.0.0
 */

class AutoGreenDeepScanner {
  constructor() {
    // Initialize core scanner
    this.core = new window.AutoGreenDeepScannerCore();

    // Reference dependencies
    this.config = window.AutoGreenConfig;
    this.logger = window.AutoGreenLogger;
    this.utils = window.AutoGreenUtils;

    // Pass storage methods to core with validation
    if (this.core) {
      // Validate that storage methods exist
      if (window.AutoGreenDataStorage) {
        if (
          typeof window.AutoGreenDataStorage.storeDeepScanResults === "function"
        ) {
          this.core.storeDeepScanResults =
            window.AutoGreenDataStorage.storeDeepScanResults;
        } else {
          this.logger?.error(
            "storeDeepScanResults method not found in AutoGreenDataStorage"
          );
          this.core.storeDeepScanResults =
            this._fallbackStoreResults.bind(this);
        }

        if (
          typeof window.AutoGreenDataStorage.storeFailedScanInfo === "function"
        ) {
          this.core.storeFailedScanInfo =
            window.AutoGreenDataStorage.storeFailedScanInfo;
        } else {
          this.logger?.error(
            "storeFailedScanInfo method not found in AutoGreenDataStorage"
          );
          this.core.storeFailedScanInfo = this._fallbackStoreFailure.bind(this);
        }
      } else {
        this.logger?.error(
          "AutoGreenDataStorage not available - using fallback storage methods"
        );
        this.core.storeDeepScanResults = this._fallbackStoreResults.bind(this);
        this.core.storeFailedScanInfo = this._fallbackStoreFailure.bind(this);
      }
    }
  }

  /**
   * Queue products for deep scanning
   */
  async queueProductsForDeepScan(products) {
    if (this.core) {
      return await this.core.queueProductsForDeepScan(products);
    }
  }

  /**
   * Get deep scan statistics
   */
  getStats() {
    if (this.core) {
      return this.core.getStats();
    }
    return {
      isEnabled: false,
      queueLength: 0,
      activeScanners: 0,
      scannedCount: 0,
      failedCount: 0,
      maxConcurrent: 1,
    };
  }

  /**
   * Get deep scan enabled status
   */
  async getDeepScanStatus() {
    if (this.core) {
      return await this.core.getDeepScanStatus();
    }
    return false;
  }

  /**
   * Toggle deep scan on/off
   */
  async toggleDeepScan() {
    if (this.core) {
      return await this.core.toggleDeepScan();
    }
    return false;
  }

  /**
   * Get stored deep scan data
   */
  getStoredDeepScanData() {
    return window.AutoGreenDataStorage.getStoredDeepScanData();
  }

  /**
   * Clear all deep scan data
   */
  clearDeepScanData() {
    return window.AutoGreenDataStorage.clearDeepScanData();
  }

  /**
   * Export deep scan data
   */
  exportDeepScanData() {
    return window.AutoGreenDataStorage.exportDeepScanData();
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    return window.AutoGreenDataStorage.getStorageStats();
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.core) {
      this.core.cleanup();
    }
    this.logger?.log("Deep Scanner cleaned up");
  }

  /**
   * Check storage health and attempt recovery if needed
   */
  async checkStorageHealth() {
    try {
      if (!window.AutoGreenDataStorage) {
        this.logger?.error("AutoGreenDataStorage not available");
        return false;
      }

      // Test basic storage operations
      const testData = { test: true, timestamp: Date.now() };
      const testProduct = {
        name: "Storage Health Test",
        link: "test://storage-health-check",
        id: "test-storage-health",
      };

      // Try to store and retrieve test data
      await window.AutoGreenDataStorage.storeDeepScanResults(
        testProduct,
        testData
      );
      const stored = window.AutoGreenDataStorage.getStoredDeepScanData();

      if (stored && stored[testProduct.link]) {
        this.logger?.debug("Storage health check passed");

        // Clean up test data
        delete stored[testProduct.link];
        const storageKey =
          window.AutoGreenConfig?.STORAGE?.DEEP_SCAN_DATA ||
          "autogreen_deep_scan_data";
        localStorage.setItem(storageKey, JSON.stringify(stored));

        return true;
      } else {
        this.logger?.warn("Storage health check failed - data not retrievable");
        return false;
      }
    } catch (error) {
      this.logger?.error("Storage health check failed:", error);
      return false;
    }
  }

  /**
   * Recover data from fallback storage
   */
  async recoverFromFallbackStorage() {
    try {
      const fallbackResultsKey = "autogreen_fallback_deep_scan_results";
      const fallbackFailuresKey = "autogreen_fallback_failed_scans";

      const fallbackResults = JSON.parse(
        localStorage.getItem(fallbackResultsKey) || "{}"
      );
      const fallbackFailures = JSON.parse(
        localStorage.getItem(fallbackFailuresKey) || "{}"
      );

      let recoveredCount = 0;

      // Recover successful scans
      for (const [url, data] of Object.entries(fallbackResults)) {
        try {
          const product = { name: data.name, link: url };
          await window.AutoGreenDataStorage.storeDeepScanResults(
            product,
            data.deepScan
          );
          recoveredCount++;
        } catch (error) {
          this.logger?.warn(`Failed to recover result for ${url}:`, error);
        }
      }

      // Recover failed scans
      for (const [url, data] of Object.entries(fallbackFailures)) {
        try {
          const product = { name: data.name, link: url };
          const error = new Error(data.deepScan.error);
          await window.AutoGreenDataStorage.storeFailedScanInfo(product, error);
          recoveredCount++;
        } catch (error) {
          this.logger?.warn(
            `Failed to recover failure info for ${url}:`,
            error
          );
        }
      }

      if (recoveredCount > 0) {
        this.logger?.log(
          `Recovered ${recoveredCount} records from fallback storage`
        );

        // Clear fallback storage after successful recovery
        localStorage.removeItem(fallbackResultsKey);
        localStorage.removeItem(fallbackFailuresKey);
      }

      return recoveredCount;
    } catch (error) {
      this.logger?.error("Failed to recover from fallback storage:", error);
      return 0;
    }
  }

  /**
   * Set UI reference
   */
  set ui(uiManager) {
    if (this.core) {
      this.core.ui = uiManager;
    }
  }

  /**
   * Get UI reference
   */
  get ui() {
    return this.core?.ui || null;
  }

  /**
   * Fallback storage method for deep scan results
   */
  async _fallbackStoreResults(product, details) {
    try {
      this.logger?.warn("Using fallback storage for deep scan results");

      // Store in localStorage directly as backup
      const fallbackKey = "autogreen_fallback_deep_scan_results";
      const existing = JSON.parse(localStorage.getItem(fallbackKey) || "{}");

      existing[product.link] = {
        ...product,
        deepScan: details,
        deepScannedAt: new Date().toISOString(),
        storedViaFallback: true,
      };

      localStorage.setItem(fallbackKey, JSON.stringify(existing));
      this.logger?.debug("Deep scan results stored via fallback method");
    } catch (error) {
      this.logger?.error("Fallback storage also failed:", error);
      throw new Error("All storage methods failed");
    }
  }

  /**
   * Fallback storage method for failed scan info
   */
  async _fallbackStoreFailure(product, error) {
    try {
      this.logger?.warn("Using fallback storage for failed scan info");

      // Store in localStorage directly as backup
      const fallbackKey = "autogreen_fallback_failed_scans";
      const existing = JSON.parse(localStorage.getItem(fallbackKey) || "{}");

      existing[product.link] = {
        ...product,
        deepScan: {
          error: error.message,
          failedAt: new Date().toISOString(),
          extractionMethod: "failed",
        },
        deepScannedAt: new Date().toISOString(),
        storedViaFallback: true,
      };

      localStorage.setItem(fallbackKey, JSON.stringify(existing));
      this.logger?.debug("Failed scan info stored via fallback method");
    } catch (fallbackError) {
      this.logger?.error(
        "Fallback failure storage also failed:",
        fallbackError
      );
      // Don't throw here - failure to store failure info shouldn't break the scanner
    }
  }
}

// Make DeepScanner available globally
if (typeof window !== "undefined") {
  window.AutoGreenDeepScanner = AutoGreenDeepScanner;
}
