/**
 * AutoGreen.sg Extension - Main Content Script
 *
 * Entry point for the extension that initializes the product detector
 * and sets up debugging utilities.
 *
 * @author AutoGreen Team
 * @version 1.0.0
 */

/**
 * Initialize the AutoGreen extension when the page is ready
 */
function initializeAutoGreen() {
  // Wait for all dependencies to be loaded
  if (
    !window.AutoGreenConfig ||
    !window.AutoGreenLogger ||
    !window.AutoGreenUtils ||
    !window.AutoGreenUIManager ||
    !window.AutoGreenProductDetector ||
    !window.AutoGreenDeepScanner
  ) {
    console.warn("[AutoGreen] Dependencies not loaded yet, retrying...");
    console.log("[AutoGreen] Available dependencies:", {
      config: !!window.AutoGreenConfig,
      logger: !!window.AutoGreenLogger,
      utils: !!window.AutoGreenUtils,
      uiManager: !!window.AutoGreenUIManager,
      productDetector: !!window.AutoGreenProductDetector,
      deepScanner: !!window.AutoGreenDeepScanner
    });
    setTimeout(initializeAutoGreen, 100);
    return;
  }

  window.AutoGreenLogger.log("Starting AutoGreen Extension...");

  try {
    // Test deep scanner class first
    if (typeof window.AutoGreenDeepScanner === 'function') {
      window.AutoGreenLogger.log("Deep scanner class is available");
    } else {
      window.AutoGreenLogger.error("Deep scanner class is not a function:", typeof window.AutoGreenDeepScanner);
    }

    window.autoGreenDetector = new window.AutoGreenProductDetector();
    window.AutoGreenLogger.log("AutoGreen Extension initialized successfully");
  } catch (error) {
    window.AutoGreenLogger.error("Failed to initialize AutoGreen:", error);
    window.AutoGreenLogger.error("Error details:", error.stack);
  }
}

/**
 * Set up debugging utilities for development
 */
function setupDebugUtilities() {
  if (typeof window !== "undefined") {
    window.AutoGreenDebug = {
      getStats: () => {
        try {
          return window.autoGreenDetector?.getStats();
        } catch (error) {
          console.error("Debug getStats error:", error);
          return { error: error.message };
        }
      },
      getStoredProducts: () => {
        try {
          return window.AutoGreenUtils?.getStoredProducts();
        } catch (error) {
          console.error("Debug getStoredProducts error:", error);
          return { error: error.message };
        }
      },
      clearData: () => {
        try {
          if (window.AutoGreenConfig) {
            const config = window.AutoGreenConfig;
            if (config.STORAGE) {
              Object.values(config.STORAGE).forEach(key => {
                localStorage.removeItem(key);
              });
            } else {
              // Fallback to old storage key
              localStorage.removeItem("autogreen_products");
            }
            window.AutoGreenLogger?.log("Debug: Cleared all stored data");
          }
        } catch (error) {
          console.error("Debug clearData error:", error);
        }
      },
      getConfig: () => window.AutoGreenConfig,
      restart: () => {
        try {
          if (window.autoGreenDetector) {
            window.autoGreenDetector.cleanup();
            window.autoGreenDetector = new window.AutoGreenProductDetector();
          }
        } catch (error) {
          console.error("Debug restart error:", error);
        }
      },
      // Deep scan debug methods
      getDeepScanStats: () => {
        try {
          return window.autoGreenDetector?.getDeepScanStats();
        } catch (error) {
          console.error("Debug getDeepScanStats error:", error);
          return { error: error.message };
        }
      },
      toggleDeepScan: () => {
        try {
          return window.autoGreenDetector?.toggleDeepScan();
        } catch (error) {
          console.error("Debug toggleDeepScan error:", error);
          return Promise.resolve({ error: error.message });
        }
      },
      exportAllData: () => {
        try {
          return window.autoGreenDetector?.exportAllData();
        } catch (error) {
          console.error("Debug exportAllData error:", error);
          return { error: error.message };
        }
      },
      testDeepScan: (url) => {
        try {
          if (window.autoGreenDetector?.deepScanner) {
            return window.autoGreenDetector.deepScanner.queueProductsForDeepScan([
              {
                name: "Test Product",
                link: url || "https://www.lazada.sg/products/test.html",
                id: "test-" + Date.now(),
              },
            ]);
          }
          return { error: "Deep scanner not available" };
        } catch (error) {
          console.error("Debug testDeepScan error:", error);
          return { error: error.message };
        }
      },
      getFailedScans: () => {
        try {
          if (window.autoGreenDetector?.deepScanner) {
            return Array.from(
              window.autoGreenDetector.deepScanner.failedScans.entries()
            );
          }
          return [];
        } catch (error) {
          console.error("Debug getFailedScans error:", error);
          return { error: error.message };
        }
      },
      // New debugging methods
      checkDeepScanner: () => {
        const detector = window.autoGreenDetector;
        return {
          detectorExists: !!detector,
          deepScannerExists: !!detector?.deepScanner,
          deepScannerType: typeof detector?.deepScanner,
          hasGetStats: !!(detector?.deepScanner?.getStats),
          getStatsType: typeof detector?.deepScanner?.getStats,
          deepScannerProperties: detector?.deepScanner ? Object.getOwnPropertyNames(detector.deepScanner) : null
        };
      },
      testDeepScannerMethods: () => {
        const scanner = window.autoGreenDetector?.deepScanner;
        if (!scanner) return { error: "Deep scanner not found" };
        
        const results = {};
        try {
          results.getStats = scanner.getStats();
        } catch (e) {
          results.getStatsError = e.message;
        }
        
        try {
          results.getDeepScanStatus = scanner.getDeepScanStatus();
        } catch (e) {
          results.getDeepScanStatusError = e.message;
        }
        
        return results;
      }
    };

    console.log(
      "[AutoGreen] Debug utilities available via window.AutoGreenDebug"
    );
  }
}

/**
 * Set up message listener for popup communication
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      switch (request.action) {
        case "getBasicStats":
          const basicStats = window.autoGreenDetector?.getStats() || {};
          sendResponse(basicStats);
          break;

        case "getDeepScanStats":
          try {
            const deepStats = window.autoGreenDetector?.getDeepScanStats() || {};
            sendResponse(deepStats);
          } catch (deepError) {
            console.error("[AutoGreen] Deep scan stats error:", deepError);
            sendResponse({ 
              error: "Failed to get deep scan stats", 
              details: deepError.message,
              isEnabled: false,
              queueLength: 0,
              activeScanners: 0,
              scannedCount: 0,
              failedCount: 0,
              maxConcurrent: 1
            });
          }
          break;

        case "getDeepScanStatus":
          window.autoGreenDetector?.getDeepScanStatus().then((enabled) => {
            sendResponse({ enabled });
          }).catch((error) => {
            console.error("[AutoGreen] Deep scan status error:", error);
            sendResponse({ enabled: false, error: error.message });
          });
          return true; // Async response

        case "toggleDeepScan":
          window.autoGreenDetector
            ?.toggleDeepScan()
            .then((enabled) => {
              sendResponse({ success: true, enabled });
            })
            .catch((error) => {
              console.error("[AutoGreen] Toggle deep scan error:", error);
              sendResponse({ success: false, error: error.message });
            });
          return true; // Async response

        case "exportData":
          try {
            const data = window.autoGreenDetector?.exportAllData();
            sendResponse({ data });
          } catch (exportError) {
            console.error("[AutoGreen] Export data error:", exportError);
            sendResponse({ error: "Failed to export data", details: exportError.message });
          }
          break;

        case "clearAllData":
          try {
            window.autoGreenDetector?.clearAllData();
            sendResponse({ success: true });
          } catch (clearError) {
            console.error("[AutoGreen] Clear data error:", clearError);
            sendResponse({ success: false, error: clearError.message });
          }
          break;

        default:
          sendResponse({ error: "Unknown action" });
      }
    } catch (error) {
      console.error("[AutoGreen] Message handler error:", error);
      sendResponse({ error: error.message, stack: error.stack });
    }
  });
}

// Initialize based on document ready state
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeAutoGreen();
    setupDebugUtilities();
    setupMessageListener();
  });
} else {
  initializeAutoGreen();
  setupDebugUtilities();
  setupMessageListener();
}
