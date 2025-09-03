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
    !window.AutoGreenProductDetector
  ) {
    console.warn("[AutoGreen] Dependencies not loaded yet, retrying...");
    setTimeout(initializeAutoGreen, 100);
    return;
  }

  window.AutoGreenLogger.log("Starting AutoGreen Extension...");

  try {
    window.autoGreenDetector = new window.AutoGreenProductDetector();
  } catch (error) {
    window.AutoGreenLogger.error("Failed to initialize AutoGreen:", error);
  }
}

/**
 * Set up debugging utilities for development
 */
function setupDebugUtilities() {
  if (typeof window !== "undefined") {
    window.AutoGreenDebug = {
      getStats: () => window.autoGreenDetector?.getStats(),
      getStoredProducts: () => window.AutoGreenUtils?.getStoredProducts(),
      clearData: () => {
        if (window.AutoGreenConfig) {
          localStorage.removeItem(window.AutoGreenConfig.STORAGE_KEY);
          window.AutoGreenLogger.log("Debug: Cleared all stored data");
        }
      },
      getConfig: () => window.AutoGreenConfig,
      restart: () => {
        if (window.autoGreenDetector) {
          window.autoGreenDetector.cleanup();
          window.autoGreenDetector = new window.AutoGreenProductDetector();
        }
      },
    };

    console.log(
      "[AutoGreen] Debug utilities available via window.AutoGreenDebug"
    );
  }
}

// Initialize based on document ready state
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeAutoGreen();
    setupDebugUtilities();
  });
} else {
  initializeAutoGreen();
  setupDebugUtilities();
}
