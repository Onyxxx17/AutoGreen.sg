/**
 * AutoGreen.sg Extension - Configuration
 *
 * Centralized configuration for the entire extension
 *
 * @author AutoGreen Team
 * @version 1.0.0
 */

const AutoGreenConfig = {
  // ================================================
  // 📋 EXTENSION METADATA
  // ================================================
  VERSION: "1.0.0",
  NAME: "AutoGreen Product Scanner",

  // ================================================
  // ⚡ PERFORMANCE SETTINGS
  // ================================================
  PERFORMANCE: {
    BATCH_SIZE: 10, // Number of products to process at once
    SCROLL_DELAY: 500, // Milliseconds to wait after scroll stops
    VIEWPORT_BUFFER: 200, // Pixels buffer around viewport for detection
    BATCH_DELAY: 100, // Delay between processing batches
    INIT_DELAY: 1000, // Initial processing delay
    MUTATION_DELAY: 500, // Delay after DOM changes
    MIN_PRODUCT_NAME_LENGTH: 10, // Minimum characters for valid product name
  },

  // ================================================
  // 🎨 UI SETTINGS & STYLING
  // ================================================
  UI: {
    INDICATOR_DURATION: 3000, // How long indicators stay visible
    Z_INDEX: 2147483647, // Ensure UI elements are on top
    COLORS: {
      SUCCESS: "#4CAF50",
      INFO: "#2196F3",
      WARNING: "#FF9800",
      ERROR: "#f44336",
      COUNTER_BG: "rgba(0, 0, 0, 0.8)",
      DEEP_SCAN: "#6f42c1",
    },
  },

  // DOM selectors for different e-commerce sites
  SELECTORS: {
    // Lazada selectors - Updated to support multiple product card formats
    LAZADA: {
      // Comprehensive container selectors for all Lazada product formats
      PRODUCT_CONTAINER: [
        // Standard Lazada product cards
        ".RfADt",
        ".card-jfy-item-desc",
        ".title",

        // Item cards (classic format)
        ".item-card-box",

        // RedMart products
        ".rm-product-tile-pc-container",

        // Product grid items and campaign items
        'a[data-tracker*="product"]',
        'a[class*="product"]',
        'a[href*="/products/"]',

        // Flexible container patterns
        '[class*="item-card"]',
        '[class*="product-item"]',
        '[class*="product-card"]',

        // Link containers with product info
        "a[data-item-id]",
        'a[data-spm-anchor-id][href*="products"]',

        // Generic product containers
        ".lzd-item",
        '[data-qa-locator*="product"]',
      ].join(", "),

      // Product link selectors (prioritized order)
      PRODUCT_LINK: 'a[title], a[href*="/products/"], a[data-item-id]',
      PRODUCT_LINK_FALLBACK:
        "a[href], .RfADt a[href], .card-jfy-item-desc a[href]",
      PRODUCT_TITLE_ATTR: "title",

      // Title extraction selectors
      HOME_PAGE_TITLE: [
        ".card-jfy-title",
        ".item-card-title span",
        ".rax-text-v2",
        '[class*="title"]',
        '[class*="name"]',
      ].join(", "),

      HOME_PAGE_CONTAINER:
        ".card-jfy-item-desc, .item-card-box, .rm-product-tile-pc-container",

      // Additional selectors for different product formats
      PRODUCT_TITLE_SELECTORS: [
        // Standard title attribute
        "a[title]",

        // Item card titles
        ".item-card-title span",

        // Product name spans
        "span[numberoflines]",
        ".rax-text-v2",

        // RedMart product titles
        "span[title]",

        // Generic text containers that look like titles
        '[class*="title"]',
        '[class*="name"]',
        '[class*="product-item-bottom-title"]',
      ],

      // Price selectors for validation
      PRICE_SELECTORS: [
        ".price",
        ".item-card-price",
        '[data-price-type="product-price"]',
        ".lzd-price",
        '[class*="price"]',
      ],

      // Image selectors for validation
      IMAGE_SELECTORS: [
        ".item-card-img",
        ".ant-image-img",
        'img[src*="lazcdn.com"]',
        'img[src*="slatic.net"]',
      ],
    },

    // Shopee selectors (to be expanded)
    SHOPEE: {
      PRODUCT_CONTAINER: ".shopee-search-item-result__item",
      PRODUCT_LINK: "a",
      PRODUCT_TITLE: ".shopee-search-item-result__item-name",
    },

    // FoodPanda selectors
    FOODPANDA: {
      // Cart and checkout page selectors
      CART_CONTAINER: "[data-testid='cart-page'], .cart-container",
      CHECKOUT_CONTAINER: "[data-testid='checkout-page'], .checkout-container",
      
      // Cutlery toggle selectors
      CUTLERY_TOGGLE: {
        CONTAINER: ".cutlery-toggle-wrapper",
        CHECKBOX: "#cutlery-switch, [data-testid='cart-cutlery-component']",
        LABEL: ".cutlery-text",
        SWITCH_CONTAINER: ".bds-c-switch",
      },

      // Other eco-friendly options
      ECO_OPTIONS: {
        // Add more eco-friendly toggles as needed
        PLASTIC_BAG: "[data-testid='plastic-bag-toggle']",
        PAPER_BAG: "[data-testid='paper-bag-toggle']",
      },

      // General food delivery selectors
      RESTAURANT_ITEMS: ".dish-card, .menu-item",
      CART_ITEMS: ".cart-item, [data-testid='cart-item']",
    },

    // Common selectors (fallback)
    COMMON: {
      PRODUCT_CONTAINER: ".RfADt, .card-jfy-item-desc",
      PRODUCT_LINK: "a[title]",
      PRODUCT_LINK_FALLBACK: ".RfADt a[href], .card-jfy-item-desc a[href]",
      PRODUCT_TITLE_ATTR: "title",
    },
  },

  // URL validation patterns
  URL_PATTERNS: {
    LAZADA: {
      DOMAIN: /lazada\.sg|lazada\.com\.sg/,
      PRODUCT_PAGE: /\/.*\.html/,
    },
    SHOPEE: {
      DOMAIN: /shopee\.sg/,
      PRODUCT_PAGE: /\/.*-i\./,
    },
    FOODPANDA: {
      DOMAIN: /foodpanda\.sg|foodpanda\.com\.sg/,
      CART_PAGE: /\/checkout|\/cart/,
      RESTAURANT_PAGE: /\/restaurant\//,
    },
  },

  // Product validation rules
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

  // Storage keys
  STORAGE: {
    PRODUCTS: "autogreen_products",
    DEEP_SCAN_ENABLED: "autogreen_deep_scan_enabled",
    DEEP_SCAN_DATA: "autogreen_deep_scan_data",
    ECO_PRODUCTS: "autogreen_eco_products",
    ECO_STATS: "autogreen_eco_stats",
    SETTINGS: "autogreen_settings",
  },

  // Deep scanning configuration
  DEEP_SCAN: {
    ENABLED_BY_DEFAULT: false,
    MAX_CONCURRENT_SCANS: 1, // Conservative to avoid overwhelming sites
    DELAY_BETWEEN_REQUESTS: 5000, // 5 seconds between requests
    TIMEOUT: 30000, // 30 seconds timeout per page
    MAX_RETRIES: 1, // Maximum retry attempts per product
    IFRAME_LOAD_WAIT: 5000, // Wait time for dynamic content

    // Selectors for extracting detailed product information
    SELECTORS: {
      // Lazada product detail page selectors
      LAZADA: {
        PRODUCT_DETAIL_CONTAINER: "#module_product_detail",
        HIGHLIGHTS: ".html-content.detail-content p",
        INGREDIENTS: ".html-content.detail-content p",
        SPEC_ITEMS: ".pdp-mod-spec-item",
        SPEC_NAME: ".pdp-mod-spec-item-name",
        SPEC_VALUE: ".pdp-mod-spec-item-text",
        PRICE: ".pdp-price",
        RATING: ".score-average",
      },

      // Shopee product detail page selectors
      SHOPEE: {
        PRODUCT_DETAIL_CONTAINER: ".product-detail",
        HIGHLIGHTS: ".product-description p",
        SPECIFICATIONS: ".product-detail__specification",
        PRICE: ".product-price",
        RATING: ".product-rating",
      },
    },
  },

  // Logging configuration
  LOGGING: {
    ENABLED: true,
    LEVEL: "info", // 'debug', 'info', 'warn', 'error'
    PREFIX: "[AutoGreen]",
  },

  // Feature flags
  FEATURES: {
    ANALYTICS: false,
    ADVANCED_SELECTORS: true,
    AUTO_EXPORT: false,
    PERFORMANCE_MONITORING: true,
  },
};

// Utility functions for config
AutoGreenConfig.getSelectorForSite = function (url) {
  if (url.includes("lazada")) {
    return this.SELECTORS.LAZADA;
  } else if (url.includes("shopee")) {
    return this.SELECTORS.SHOPEE;
  } else if (url.includes("foodpanda")) {
    return this.SELECTORS.FOODPANDA;
  }
  return this.SELECTORS.COMMON;
};

AutoGreenConfig.isValidEcommerceSite = function (url) {
  return (
    this.URL_PATTERNS.LAZADA.DOMAIN.test(url) ||
    this.URL_PATTERNS.SHOPEE.DOMAIN.test(url) ||
    this.URL_PATTERNS.FOODPANDA.DOMAIN.test(url)
  );
};

AutoGreenConfig.getDeepScanSelectorsForSite = function (url) {
  if (url.includes("lazada")) {
    return this.DEEP_SCAN.SELECTORS.LAZADA;
  } else if (url.includes("shopee")) {
    return this.DEEP_SCAN.SELECTORS.SHOPEE;
  }
  return this.DEEP_SCAN.SELECTORS.LAZADA; // Default fallback
};

// Make CONFIG available globally for other scripts
if (typeof window !== "undefined") {
  window.AutoGreenConfig = AutoGreenConfig;
}

// For backward compatibility
if (typeof window !== "undefined") {
  window.CONFIG = AutoGreenConfig;
}
