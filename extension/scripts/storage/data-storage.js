/**
 * AutoGreen.sg Extension - Data Storage Manager
 *
 * Handles all data storage operations for deep scan results
 *
 * @author AutoGreen Team
 * @version 1.0.0
 */

class AutoGreenDataStorage {
  static config = window.AutoGreenConfig;
  static logger = window.AutoGreenLogger;

  /**
   * Store deep scan results
   */
  static async storeDeepScanResults(product, details) {
    try {
      // Validate input parameters
      if (!product || !product.link) {
        throw new Error("Invalid product data - missing product or link");
      }

      if (!details) {
        throw new Error(
          "Invalid details data - details cannot be null or undefined"
        );
      }

      // Get existing deep scan data
      const existingData = AutoGreenDataStorage.getStoredDeepScanData();

      // Create enhanced product data with validation
      const enhancedProduct = {
        ...product,
        deepScan: {
          ...details,
          // Ensure critical fields are present
          extractedAt: details.extractedAt || new Date().toISOString(),
          extractionMethod: details.extractionMethod || "unknown",
        },
        deepScannedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      // Add to existing data
      existingData[product.link] = enhancedProduct;

      // Validate storage space before writing
      const dataString = JSON.stringify(existingData);
      if (dataString.length > 4.5 * 1024 * 1024) {
        // 4.5MB threshold
        AutoGreenDataStorage.logger?.warn(
          "Storage size approaching limit, cleaning up old data"
        );
        AutoGreenDataStorage.cleanupOldData(7); // Clean data older than 7 days
      }

      // Store back
      const storageKey =
        AutoGreenDataStorage.config?.STORAGE?.DEEP_SCAN_DATA ||
        "autogreen_deep_scan_data";
      localStorage.setItem(storageKey, dataString);

      AutoGreenDataStorage.logger?.log(
        `Stored deep scan data for: ${product.name.substring(0, 50)}...`
      );
    } catch (error) {
      AutoGreenDataStorage.logger?.error(
        "Failed to store deep scan results:",
        error
      );

      // Re-throw with more context
      throw new Error(`Storage operation failed: ${error.message}`);
    }
  }

  /**
   * Store information about failed scans
   */
  static async storeFailedScanInfo(product, error) {
    try {
      // Validate input parameters
      if (!product || !product.link) {
        throw new Error("Invalid product data - missing product or link");
      }

      if (!error) {
        throw new Error(
          "Invalid error data - error cannot be null or undefined"
        );
      }

      const existingData = AutoGreenDataStorage.getStoredDeepScanData();

      const failedProduct = {
        ...product,
        deepScan: {
          error: error.message || "Unknown error",
          errorType: error.name || "Error",
          failedAt: new Date().toISOString(),
          extractionMethod: "failed",
          errorStack: error.stack ? error.stack.substring(0, 500) : null, // Truncated stack trace
        },
        deepScannedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      existingData[product.link] = failedProduct;

      const storageKey =
        AutoGreenDataStorage.config?.STORAGE?.DEEP_SCAN_DATA ||
        "autogreen_deep_scan_data";
      localStorage.setItem(storageKey, JSON.stringify(existingData));

      AutoGreenDataStorage.logger?.log(
        `Stored failure info for: ${product.name.substring(0, 50)}...`
      );
    } catch (storageError) {
      AutoGreenDataStorage.logger?.error(
        "Failed to store failure info:",
        storageError
      );

      // Re-throw with more context
      throw new Error(
        `Failed scan storage operation failed: ${storageError.message}`
      );
    }
  }

  /**
   * Get stored deep scan data
   */
  static getStoredDeepScanData() {
    try {
      const storageKey =
        AutoGreenDataStorage.config?.STORAGE?.DEEP_SCAN_DATA ||
        "autogreen_deep_scan_data";
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      AutoGreenDataStorage.logger?.error(
        "Failed to get stored deep scan data:",
        error
      );
      return {};
    }
  }

  /**
   * Clear all deep scan data
   */
  static clearDeepScanData() {
    const storageKey =
      AutoGreenDataStorage.config?.STORAGE?.DEEP_SCAN_DATA ||
      "autogreen_deep_scan_data";
    localStorage.removeItem(storageKey);
    AutoGreenDataStorage.logger?.log("Cleared all deep scan data");
  }

  /**
   * Export deep scan data in a structured format
   */
  static exportDeepScanData() {
    try {
      const data = AutoGreenDataStorage.getStoredDeepScanData();
      const exportData = {
        deepScanResults: data,
        exportedAt: new Date().toISOString(),
        totalProducts: Object.keys(data).length,
        successfulScans: Object.values(data).filter(
          (p) => p.deepScan && !p.deepScan.error
        ).length,
        failedScans: Object.values(data).filter(
          (p) => p.deepScan && p.deepScan.error
        ).length,
      };

      return exportData;
    } catch (error) {
      AutoGreenDataStorage.logger?.error(
        "Failed to export deep scan data:",
        error
      );
      return null;
    }
  }

  /**
   * Get storage statistics
   */
  static getStorageStats() {
    try {
      const data = AutoGreenDataStorage.getStoredDeepScanData();
      const products = Object.values(data);

      return {
        totalProducts: products.length,
        successfulScans: products.filter((p) => p.deepScan && !p.deepScan.error)
          .length,
        failedScans: products.filter((p) => p.deepScan && p.deepScan.error)
          .length,
        storageSize: JSON.stringify(data).length,
        lastUpdate:
          products.length > 0
            ? Math.max(
                ...products.map((p) => new Date(p.deepScannedAt).getTime())
              )
            : null,
      };
    } catch (error) {
      AutoGreenDataStorage.logger?.error("Failed to get storage stats:", error);
      return {
        totalProducts: 0,
        successfulScans: 0,
        failedScans: 0,
        storageSize: 0,
        lastUpdate: null,
      };
    }
  }

  /**
   * Cleanup old data (optional maintenance)
   */
  static cleanupOldData(maxAgeInDays = 30) {
    try {
      const data = AutoGreenDataStorage.getStoredDeepScanData();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);

      let cleanedCount = 0;
      Object.keys(data).forEach((url) => {
        const product = data[url];
        const scannedDate = new Date(product.deepScannedAt);

        if (scannedDate < cutoffDate) {
          delete data[url];
          cleanedCount++;
        }
      });

      if (cleanedCount > 0) {
        const storageKey =
          AutoGreenDataStorage.config?.STORAGE?.DEEP_SCAN_DATA ||
          "autogreen_deep_scan_data";
        localStorage.setItem(storageKey, JSON.stringify(data));
        AutoGreenDataStorage.logger?.log(
          `Cleaned up ${cleanedCount} old deep scan records`
        );
      }

      return cleanedCount;
    } catch (error) {
      AutoGreenDataStorage.logger?.error("Failed to cleanup old data:", error);
      return 0;
    }
  }

  /**
   * Check storage health and available space
   */
  static checkStorageHealth() {
    try {
      const storageStats = AutoGreenDataStorage.getStorageStats();
      const isHealthy = {
        hasSpace: storageStats.storageSize < 4 * 1024 * 1024, // Under 4MB
        recentActivity:
          storageStats.lastUpdate &&
          Date.now() - storageStats.lastUpdate < 24 * 60 * 60 * 1000, // Activity in last 24h
        balancedResults:
          storageStats.totalProducts === 0 ||
          storageStats.failedScans / storageStats.totalProducts < 0.8, // Less than 80% failures
      };

      const overallHealth = Object.values(isHealthy).every(Boolean);

      AutoGreenDataStorage.logger?.debug("Storage health check:", {
        ...isHealthy,
        overallHealth,
        stats: storageStats,
      });

      return {
        isHealthy: overallHealth,
        details: isHealthy,
        stats: storageStats,
        recommendations: AutoGreenDataStorage._getHealthRecommendations(
          isHealthy,
          storageStats
        ),
      };
    } catch (error) {
      AutoGreenDataStorage.logger?.error("Storage health check failed:", error);
      return {
        isHealthy: false,
        error: error.message,
        recommendations: [
          "Storage system appears to be corrupted - consider clearing data",
        ],
      };
    }
  }

  /**
   * Get health recommendations based on storage analysis
   */
  static _getHealthRecommendations(healthFlags, stats) {
    const recommendations = [];

    if (!healthFlags.hasSpace) {
      recommendations.push(
        "Storage space is low - consider cleaning up old data"
      );
    }

    if (!healthFlags.recentActivity && stats.totalProducts > 0) {
      recommendations.push("No recent scanning activity detected");
    }

    if (!healthFlags.balancedResults) {
      recommendations.push(
        "High failure rate detected - check scanning configuration"
      );
    }

    if (stats.totalProducts > 1000) {
      recommendations.push(
        "Large number of stored products - consider periodic cleanup"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Storage system is healthy");
    }

    return recommendations;
  }

  /**
   * Perform storage maintenance
   */
  static performMaintenance(options = {}) {
    try {
      const { maxAge = 30, maxProducts = 1000, maxFailureRate = 0.8 } = options;

      let maintenanceActions = [];

      // Clean old data
      const cleanedCount = AutoGreenDataStorage.cleanupOldData(maxAge);
      if (cleanedCount > 0) {
        maintenanceActions.push(`Cleaned ${cleanedCount} old records`);
      }

      // Check if we still have too many products
      const stats = AutoGreenDataStorage.getStorageStats();
      if (stats.totalProducts > maxProducts) {
        // Remove oldest products beyond limit
        const data = AutoGreenDataStorage.getStoredDeepScanData();
        const sortedEntries = Object.entries(data).sort(
          ([, a], [, b]) =>
            new Date(a.deepScannedAt) - new Date(b.deepScannedAt)
        );

        const toRemove = sortedEntries.slice(
          0,
          stats.totalProducts - maxProducts
        );
        toRemove.forEach(([url]) => delete data[url]);

        const storageKey =
          AutoGreenDataStorage.config?.STORAGE?.DEEP_SCAN_DATA ||
          "autogreen_deep_scan_data";
        localStorage.setItem(storageKey, JSON.stringify(data));

        maintenanceActions.push(
          `Removed ${toRemove.length} oldest records to maintain limit`
        );
      }

      AutoGreenDataStorage.logger?.log(
        "Storage maintenance completed:",
        maintenanceActions
      );
      return maintenanceActions;
    } catch (error) {
      AutoGreenDataStorage.logger?.error("Storage maintenance failed:", error);
      return [`Maintenance failed: ${error.message}`];
    }
  }
}

// Make available globally
if (typeof window !== "undefined") {
  window.AutoGreenDataStorage = AutoGreenDataStorage;
}
