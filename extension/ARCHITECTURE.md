# 🏗️ AutoGreen Extension Architecture

## Overview

The AutoGreen Product Scanner is built as a modular Chrome extension with clear separation of concerns. This document provides a detailed technical overview of the architecture, data flow, and component interactions.

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│  Background Service Worker (background.js)                 │
│  ├─ Extension lifecycle management                         │
│  ├─ Tab monitoring and badge updates                       │
│  └─ Message routing and analytics                          │
├─────────────────────────────────────────────────────────────┤
│  Popup Interface (popup/)                                  │
│  ├─ User controls and settings                             │
│  ├─ Real-time statistics display                           │
│  └─ Data export functionality                              │
├─────────────────────────────────────────────────────────────┤
│  Content Scripts (scripts/)                                │
│  ├─ Configuration Module (config.js)                       │
│  ├─ Utilities & Logging (utils.js)                         │
│  ├─ UI Management (ui-manager.js)                          │
│  ├─ Product Detection (product-detector.js)                │
│  ├─ Deep Scanning (deep-scanner.js)                        │
│  └─ Content Entry Point (content.js)                       │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. Initialization Flow

```
Page Load → Content Script Injection → Dependency Check →
Site Validation → Component Initialization → Event Listeners Setup
```

### 2. Product Detection Flow

```
User Scroll → Scroll Event → Debounced Processing →
Element Discovery → Product Extraction → Validation →
Batch Processing → Storage → UI Update
```

### 3. Deep Scan Flow

```
Product Queue → URL Validation → Iframe Creation →
Page Loading → Content Extraction → Data Processing →
Storage → Queue Processing → UI Progress Update
```

### 4. User Interaction Flow

```
Popup Open → Settings Load → User Action →
Message to Content Script → Processing → Response → UI Update
```

## 🧩 Component Details

### Configuration Module (`config.js`)

**Purpose**: Centralized configuration management
**Responsibilities**:

- Store all extension settings and constants
- Provide site-specific configurations
- Feature flag management
- Performance parameter tuning

**Key Functions**:

```javascript
AutoGreenConfig.getSelectorForSite(url); // Get site selectors
AutoGreenConfig.isValidEcommerceSite(url); // Site validation
AutoGreenConfig.getDeepScanSelectorsForSite(url); // Deep scan selectors
```

**Configuration Structure**:

```javascript
{
  PERFORMANCE: {/*...*/},    // Performance settings
  UI: {/*...*/},            // UI configurations
  SELECTORS: {/*...*/},     // DOM selectors
  VALIDATION: {/*...*/},    // Product validation rules
  STORAGE: {/*...*/},       // Storage keys
  DEEP_SCAN: {/*...*/},     // Deep scanning settings
  LOGGING: {/*...*/},       // Logging configuration
  FEATURES: {/*...*/}       // Feature flags
}
```

### Utilities Module (`utils.js`)

**Purpose**: Common functionality and enhanced logging
**Responsibilities**:

- Enhanced logging with levels
- DOM manipulation utilities
- Product information extraction
- Storage management
- Performance optimization helpers

**Key Classes/Objects**:

```javascript
Logger: {
  debug(), log(), warn(), error();
}

Utils: {
  getCurrentSiteConfig(), // Site-specific config
    isElementVisible(), // Viewport detection
    extractProductInfo(), // Product data extraction
    getStoredProducts(), // Storage retrieval
    storeProducts(), // Storage persistence
    debounce(),
    throttle(); // Performance helpers
}
```

### UI Manager (`ui-manager.js`)

**Purpose**: User interface components and indicators
**Responsibilities**:

- Visual indicators (success, error, info)
- Progress counters
- Deep scan progress display
- UI element positioning and styling

**Key Methods**:

```javascript
showIndicator(message, type, duration); // Temporary notifications
showCounter(count); // Persistent counter
showDeepScanProgress(queue, active); // Deep scan progress
createIndicatorElement(message, type); // UI element creation
cleanup(); // Resource cleanup
```

### Product Detector (`product-detector.js`)

**Purpose**: Main product detection and processing engine
**Responsibilities**:

- Scroll-based product detection
- Batch processing for performance
- Integration with deep scanner
- Memory and state management

**Architecture**:

```javascript
class AutoGreenProductDetector {
  constructor()              // Initialize components
  initialize()              // Setup and start detection
  setupEventListeners()     // Scroll and DOM mutation observers
  getVisibleProducts()      // Product discovery in viewport
  processBatch()            // Efficient batch processing
  processVisibleProducts()  // Main processing pipeline
  getStats()               // Statistics and metrics
  cleanup()                // Resource cleanup
}
```

**Processing Pipeline**:

1. **Discovery**: Find product elements in viewport
2. **Extraction**: Extract product information
3. **Validation**: Apply quality filters
4. **Batching**: Group for efficient processing
5. **Storage**: Persist to localStorage
6. **Deep Scan**: Queue for detailed analysis
7. **UI Update**: Show progress to user

### Deep Scanner (`deep-scanner.js`)

**Purpose**: Advanced product page analysis
**Responsibilities**:

- Product page content extraction
- Queue management with concurrency control
- Retry logic and error handling
- iframe-based secure extraction

**Architecture**:

```javascript
class AutoGreenDeepScanner {
  constructor()                    // Initialize scanner
  queueProductsForDeepScan()      // Add products to queue
  processQueue()                  // Process with concurrency control
  scanProduct()                   // Individual product scanning
  createHiddenIframe()            // Secure iframe creation
  extractProductDetails()         // Content extraction
  storeDeepScanResults()          // Result persistence
}
```

**Scanning Process**:

1. **URL Validation**: Ensure scannable product page
2. **Queue Management**: Respect concurrency limits
3. **Iframe Creation**: Secure hidden iframe
4. **Page Loading**: Wait for complete load
5. **Content Extraction**: Extract detailed information
6. **Data Processing**: Structure and validate data
7. **Storage**: Persist results
8. **Error Handling**: Retry logic and failure tracking

### Content Entry Point (`content.js`)

**Purpose**: Initialization and coordination
**Responsibilities**:

- Dependency management
- Component initialization
- Message handling between popup and content
- Debug utilities setup

**Message Handling**:

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getBasicStats": // Return detection statistics
    case "getDeepScanStats": // Return deep scan statistics
    case "toggleDeepScan": // Enable/disable deep scanning
    case "exportData": // Export all collected data
    case "clearAllData": // Clear all stored data
  }
});
```

### Background Service Worker (`background.js`)

**Purpose**: Extension lifecycle and background processing
**Responsibilities**:

- Extension installation handling
- Tab monitoring and badge updates
- Message routing
- Analytics collection (optional)

**Event Handling**:

```javascript
chrome.runtime.onInstalled; // Installation/update handling
chrome.tabs.onUpdated; // Tab change monitoring
chrome.runtime.onMessage; // Inter-component messaging
chrome.runtime.onStartup; // Extension startup
chrome.runtime.onSuspend; // Extension suspension
```

### Popup Interface (`popup/`)

**Purpose**: User control interface
**Components**:

- **popup.html**: Interface structure and styling
- **popup.js**: Control logic and state management

**Features**:

- Real-time statistics display
- Deep scan toggle control
- Data export functionality
- Settings management
- Status indicators

## 🔧 Technical Patterns

### 1. Module Pattern

Each component is encapsulated with clear interfaces:

```javascript
// Component definition
class ComponentName {
  constructor() {
    /* initialization */
  }
  // public methods
}

// Global exposure
if (typeof window !== "undefined") {
  window.AutoGreenComponentName = ComponentName;
}
```

### 2. Configuration-Driven Design

All components use centralized configuration:

```javascript
// Access configuration
this.config = window.AutoGreenConfig;
this.logger = window.AutoGreenLogger;
this.utils = window.AutoGreenUtils;
```

### 3. Event-Driven Architecture

Components communicate through events and messages:

```javascript
// DOM events
window.addEventListener("scroll", handler, { passive: true });

// Extension messages
chrome.runtime.onMessage.addListener(handler);
```

### 4. Defensive Programming

All components include comprehensive error handling:

```javascript
try {
  // risky operation
} catch (error) {
  this.logger.error("Operation failed:", error);
  // fallback or recovery
}
```

## 💾 Data Management

### Storage Strategy

- **localStorage**: Primary storage for all data
- **Structured Keys**: Organized storage keys from config
- **Backup System**: Automatic backup before updates
- **Validation**: Data integrity checks on read/write

### Data Structure

```javascript
// Basic product storage
{
  "autogreen_products": [
    {
      "name": "Product Name",
      "link": "https://...",
      "url": "Page URL",
      "position": 1234,
      "timestamp": "ISO date",
      "siteType": "lazada|shopee",
      "extractedAt": "ISO date"
    }
  ]
}

// Deep scan storage
{
  "autogreen_deep_scan_data": {
    "product_url": {
      "name": "Product Name",
      "deepScan": {
        "highlights": ["..."],
        "ingredients": ["..."],
        "specifications": {"key": "value"},
        "extractedAt": "ISO date",
        "extractionMethod": "standard|alternative|failed"
      }
    }
  }
}
```

## 🎯 Performance Optimizations

### 1. Efficient Event Handling

```javascript
// Debounced scroll handling
const debouncedHandler = utils.debounce(handler, delay);
window.addEventListener("scroll", debouncedHandler, { passive: true });

// Throttled mutation observer
const throttledHandler = utils.throttle(handler, limit);
observer.observe(document.body, { childList: true, subtree: true });
```

### 2. Batch Processing

```javascript
// Process products in batches
for (let i = 0; i < products.length; i += BATCH_SIZE) {
  const batch = products.slice(i, i + BATCH_SIZE);
  processBatch(batch);
  await delay(BATCH_DELAY); // Prevent UI blocking
}
```

### 3. Memory Management

```javascript
// Cleanup processed products
processedProducts.clear();

// Remove UI elements
indicators.forEach((indicator) => indicator.remove());

// Clear timeouts and intervals
clearTimeout(timeoutId);
```

### 4. Selective Deep Scanning

```javascript
// Only scan when enabled and validated
if (isDeepScanEnabled && isValidProductUrl(url)) {
  queueForDeepScan(product);
}
```

## 🛡️ Security Considerations

### 1. Content Security Policy

- Uses manifest v3 for enhanced security
- Minimal permissions (activeTab, storage, downloads)
- No remote code execution

### 2. Safe DOM Manipulation

```javascript
// Safe element creation
const element = document.createElement("div");
element.textContent = userContent; // Prevents XSS

// Safe selector usage
const elements = document.querySelectorAll(trustedSelector);
```

### 3. Secure iframe Usage

```javascript
// Sandboxed iframe for content extraction
iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
iframe.style.cssText = "position: absolute; left: -9999px; ...";
```

### 4. Input Validation

```javascript
// Validate all extracted data
if (this.isValidProductName(productName) && this.isValidUrl(productUrl)) {
  // Process product
}
```

## 📊 Monitoring and Debugging

### 1. Comprehensive Logging

```javascript
// Configurable logging levels
Logger.debug("Detailed debugging info");
Logger.log("General information");
Logger.warn("Warning conditions");
Logger.error("Error conditions");
```

### 2. Performance Monitoring

```javascript
// Built-in performance measurement
Utils.measurePerformance("operation_name", () => {
  // measured operation
});
```

### 3. Debug Utilities

```javascript
// Available in browser console
window.AutoGreenDebug = {
  getStats(),
  getStoredProducts(),
  clearData(),
  restart(),
  testDeepScan(url)
};
```

### 4. Error Recovery

```javascript
// Automatic backup and recovery
try {
  storeData(data);
} catch (error) {
  restoreFromBackup();
  Logger.error("Storage failed, restored from backup");
}
```

## 🔄 Extension Lifecycle

### 1. Installation

```
Extension Install → Background Script Start →
Default Settings → Tab Monitoring Setup
```

### 2. Page Load

```
Page Navigation → Content Script Injection →
Dependency Loading → Site Validation → Component Initialization
```

### 3. Active Usage

```
User Interaction → Event Processing →
Data Collection → Storage Update → UI Feedback
```

### 4. Cleanup

```
Page Unload → Component Cleanup →
Resource Release → State Persistence
```

This architecture ensures scalability, maintainability, and performance while providing a robust foundation for the AutoGreen Product Scanner extension.
