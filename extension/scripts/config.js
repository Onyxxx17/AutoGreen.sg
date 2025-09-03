/**
 * AutoGreen.sg Extension - Configuration
 *
 * Centralized configuration for the entire extension
 */

const CONFIG = {
  BATCH_SIZE: 10, // Number of products to process at once
  SCROLL_DELAY: 500, // Milliseconds to wait after scroll stops
  VIEWPORT_BUFFER: 200, // Pixels buffer around viewport for detection
  INDICATOR_DURATION: 3000, // How long indicators stay visible
  BATCH_DELAY: 100, // Delay between processing batches
  INIT_DELAY: 1000, // Initial processing delay
  MUTATION_DELAY: 500, // Delay after DOM changes
  MIN_PRODUCT_NAME_LENGTH: 10, // Minimum characters for valid product name (increased for better filtering)

  SELECTORS: {
    PRODUCT_CONTAINER: ".RfADt",
    PRODUCT_LINK: "a[title]",
    // Additional selectors for better targeting
    PRODUCT_LINK_FALLBACK: ".RfADt a[href]",
    PRODUCT_TITLE_ATTR: "title",
  },

  // URL patterns for validation
  URL_PATTERNS: {
    LAZADA_PRODUCT: /\/products\/.*\.html/,
    LAZADA_PDP: /pdp-i\d+\.html/,
  },

  // Product name validation patterns
  VALIDATION: {
    // Skip these patterns - they're usually not real product names
    SKIP_PATTERNS: [
      /^(view all|see more|load more|show more)$/i,
      /^(home|shop|cart|login|register|search)$/i,
      /^(breadcrumb|navigation|menu)$/i,
      /^\s*$/,
      /^[0-9]+$/,
      /^(loading|error|404)$/i,
      /^(.*\.\.\.)$/, // Skip truncated text ending with ...
    ],
    // Must contain at least one of these to be considered valid
    REQUIRED_PATTERNS: [
      /[a-zA-Z]{3,}/, // At least 3 consecutive letters
    ],
  },

  STORAGE_KEY: "autogreen_products",

  UI: {
    Z_INDEX: 2147483647,
    COLORS: {
      SUCCESS: "#4CAF50",
      INFO: "#2196F3",
      WARNING: "#FF9800",
      ERROR: "#f44336",
      COUNTER_BG: "rgba(0, 0, 0, 0.8)",
    },
  },
};

// Make CONFIG available globally for other scripts
if (typeof window !== "undefined") {
  window.AutoGreenConfig = CONFIG;
}
