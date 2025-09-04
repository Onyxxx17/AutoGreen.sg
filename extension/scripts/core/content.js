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
    // Check what type of site this is
    const currentUrl = window.location.href;
    const isFoodPanda = window.AutoGreenConfig.URL_PATTERNS.FOODPANDA.DOMAIN.test(currentUrl);
    
    if (isFoodPanda) {
      window.AutoGreenLogger.log("FoodPanda site detected, initializing eco-friendly features...");
      initializeFoodPandaFeatures();
    } else {
      window.AutoGreenLogger.log("E-commerce site detected, initializing product detection...");
      
      // Test deep scanner class first
      if (typeof window.AutoGreenDeepScanner === 'function') {
        window.AutoGreenLogger.log("Deep scanner class is available");
      } else {
        window.AutoGreenLogger.error("Deep scanner class is not a function:", typeof window.AutoGreenDeepScanner);
      }

      window.autoGreenDetector = new window.AutoGreenProductDetector();
    }
    
    window.AutoGreenLogger.log("AutoGreen Extension initialized successfully");
  } catch (error) {
    window.AutoGreenLogger.error("Failed to initialize AutoGreen:", error);
    window.AutoGreenLogger.error("Error details:", error.stack);
  }
}

/**
 * Initialize FoodPanda-specific features
 */
function initializeFoodPandaFeatures() {
  if (!window.AutoGreenFoodPandaExtractor) {
    window.AutoGreenLogger.error("FoodPanda extractor not available");
    return;
  }

  window.AutoGreenLogger.log("Initializing FoodPanda eco-friendly features...");

  // Check for eco-friendly options on any FoodPanda page (not just cart)
  window.AutoGreenLogger.log("Checking for eco-friendly options on any FoodPanda page...");
  
  // Wait a bit for the page to fully load
  setTimeout(() => {
    checkAndDisplayEcoStatus();
    setupFoodPandaMonitoring();
  }, 2000);

  // Also monitor for any page changes that might load cutlery options
  monitorForPageChanges();
}

/**
 * Check and display eco-friendly status
 */
function checkAndDisplayEcoStatus() {
  try {
    const ecoStatus = window.AutoGreenFoodPandaExtractor.getEcoFriendlyStatus();
    window.AutoGreenLogger.log("Eco-friendly status:", ecoStatus);

    if (ecoStatus.cutlery && ecoStatus.cutlery.found) {
      // Show status in UI
      if (window.AutoGreenUIManager) {
        const ui = new window.AutoGreenUIManager();
        ui.showIndicator(ecoStatus.cutlery.message, 
                        ecoStatus.cutlery.ecoFriendly ? 'success' : 'warning', 
                        4000);
      }
    }

    // Store the status for popup access
    window.autoGreenFoodPandaStatus = ecoStatus;
    
  } catch (error) {
    window.AutoGreenLogger.error("Error checking eco status:", error);
  }
}

/**
 * Set up monitoring for FoodPanda toggle changes
 */
function setupFoodPandaMonitoring() {
  try {
    // Monitor cutlery toggle changes
    const cleanup = window.AutoGreenFoodPandaExtractor.monitorCutleryToggle((status) => {
      window.AutoGreenLogger.log("Cutlery toggle changed:", status);
      
      // Update stored status
      if (window.autoGreenFoodPandaStatus) {
        window.autoGreenFoodPandaStatus.cutlery = status;
      }

      // Show feedback
      if (window.AutoGreenUIManager) {
        const ui = new window.AutoGreenUIManager();
        ui.showIndicator(status.message, 
                        status.ecoFriendly ? 'success' : 'info', 
                        3000);
      }
    });

    // Store cleanup function
    window.autoGreenFoodPandaCleanup = cleanup;
    
  } catch (error) {
    window.AutoGreenLogger.error("Error setting up FoodPanda monitoring:", error);
  }
}

/**
 * Monitor for page changes that might load cutlery options
 */
function monitorForPageChanges() {
  // Use MutationObserver to watch for DOM changes and URL changes (SPA navigation)
  let lastUrl = window.location.href;
  
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      window.AutoGreenLogger.log("Page changed, checking for eco-friendly options...");
      
      // Wait for new content to load
      setTimeout(() => {
        checkAndDisplayEcoStatus();
        setupFoodPandaMonitoring();
      }, 2000);
    }
    
    // Also check for new cutlery toggle elements that might have been added
    if (!window.autoGreenFoodPandaCleanup) {
      // Only set up monitoring if not already monitoring
      const cutleryToggle = document.querySelector('#cutlery-switch, [data-testid="cart-cutlery-component"]');
      if (cutleryToggle) {
        window.AutoGreenLogger.log("Cutlery toggle detected in DOM changes, setting up monitoring...");
        setupFoodPandaMonitoring();
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also listen for popstate events (browser back/forward)
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      window.AutoGreenLogger.log("Navigation detected, checking for eco-friendly options...");
      checkAndDisplayEcoStatus();
      setupFoodPandaMonitoring();
    }, 1000);
  });
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
      },

      // FoodPanda debug methods
      getFoodPandaStatus: () => {
        try {
          if (window.AutoGreenFoodPandaExtractor) {
            return window.AutoGreenFoodPandaExtractor.getEcoFriendlyStatus();
          }
          return { error: "FoodPanda extractor not available" };
        } catch (error) {
          console.error("Debug getFoodPandaStatus error:", error);
          return { error: error.message };
        }
      },
      
      checkCutleryToggle: () => {
        try {
          if (window.AutoGreenFoodPandaExtractor) {
            return window.AutoGreenFoodPandaExtractor.checkCutleryStatus();
          }
          return { error: "FoodPanda extractor not available" };
        } catch (error) {
          console.error("Debug checkCutleryToggle error:", error);
          return { error: error.message };
        }
      },

      isFoodPandaSite: () => {
        try {
          if (window.AutoGreenFoodPandaExtractor) {
            return {
              isFoodPanda: window.AutoGreenFoodPandaExtractor.isFoodPandaPage(),
              isCartPage: window.AutoGreenFoodPandaExtractor.isCartOrCheckoutPage(),
              currentUrl: window.location.href
            };
          }
          return { error: "FoodPanda extractor not available" };
        } catch (error) {
          console.error("Debug isFoodPandaSite error:", error);
          return { error: error.message };
        }
      },

      testFoodPandaMonitoring: () => {
        try {
          if (window.AutoGreenFoodPandaExtractor) {
            const cleanup = window.AutoGreenFoodPandaExtractor.monitorCutleryToggle((status) => {
              console.log("Test monitoring - cutlery changed:", status);
            });
            
            // Clean up after 10 seconds
            setTimeout(() => {
              if (cleanup) cleanup();
              console.log("Test monitoring stopped");
            }, 10000);
            
            return { success: true, message: "Monitoring started for 10 seconds" };
          }
          return { error: "FoodPanda extractor not available" };
        } catch (error) {
          console.error("Debug testFoodPandaMonitoring error:", error);
          return { error: error.message };
        }
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

        case "getFoodPandaStatus":
          try {
            if (window.AutoGreenFoodPandaExtractor) {
              const status = window.AutoGreenFoodPandaExtractor.getEcoFriendlyStatus();
              sendResponse({ status, success: true });
            } else {
              sendResponse({ success: false, error: "FoodPanda extractor not available" });
            }
          } catch (foodPandaError) {
            console.error("[AutoGreen] FoodPanda status error:", foodPandaError);
            sendResponse({ success: false, error: foodPandaError.message });
          }
          break;

        case "checkCutleryToggle":
          try {
            if (window.AutoGreenFoodPandaExtractor) {
              const cutleryStatus = window.AutoGreenFoodPandaExtractor.checkCutleryStatus();
              sendResponse({ cutleryStatus, success: true });
            } else {
              sendResponse({ success: false, error: "FoodPanda extractor not available" });
            }
          } catch (cutleryError) {
            console.error("[AutoGreen] Cutlery toggle error:", cutleryError);
            sendResponse({ success: false, error: cutleryError.message });
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
