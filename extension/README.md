# 🛍️ AutoGreen Product Scanner Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Onyxxx17/AutoGreen.sg)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-orange.svg)](https://developer.chrome.com/docs/extensions/)

An intelligent Chrome extension that automatically detects and analyzes products on Lazada and Shopee websites in Singapore. Features advanced deep scanning capabilities with robust error handling, modular architecture, and comprehensive data extraction including ingredients, specifications, and highlights.

## 🌟 Features

### Core Functionality

- **📦 Smart Product Detection**: Advanced scroll-based detection with viewport optimization
- **🔍 Deep Scanning**: Comprehensive analysis of individual product pages with iframe-based extraction
- **💾 Robust Data Storage**: Multi-layered storage system with automatic backup and recovery
- **🎯 Intelligent Filtering**: Advanced validation with site-specific rules
- **⚡ Performance Optimized**: Modular architecture with efficient batch processing
- **🛡️ Error Recovery**: Comprehensive error handling with fallback mechanisms

### Supported Platforms

- **Lazada Singapore** (`lazada.sg`, `lazada.com.sg`)
- **Shopee Singapore** (`shopee.sg`)

### Advanced Features

- **📊 Real-time Monitoring**: Live statistics and health monitoring
- **🔄 Background Processing**: Non-blocking operations with queue management
- **🧹 Automatic Maintenance**: Self-cleaning storage with data lifecycle management
- **🎨 Enhanced UI**: Responsive indicators with contextual feedback
- **📈 Performance Tracking**: Built-in metrics and debugging tools

## 🚀 Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Onyxxx17/AutoGreen.sg.git
cd AutoGreen.sg/extension

# Load in Chrome for development
# Navigate to chrome://extensions/ and load unpacked
```

## 📖 Usage

### Basic Usage

1. **Navigate** to any Lazada or Shopee product listing page
2. **Scroll** through the products - automatic detection begins
3. **Monitor Progress** via the floating UI indicators
4. **View Statistics** by clicking the extension icon
5. **Export Data** using the "Export Data" button in the popup

### Deep Scanning

1. **Enable Deep Scan** using the toggle in the extension popup
2. Products are automatically queued for detailed analysis
3. **Monitor Progress** through real-time statistics and indicators
4. **Check Results** in exported data under `deepScanData`
5. **Review Health** via storage health monitoring

### Data Management

- **Auto-backup**: Automatic fallback storage during failures
- **Data Recovery**: Restore data from backup systems
- **Health Monitoring**: Storage space and performance tracking
- **Maintenance**: Automatic cleanup of old data

## 🏗️ Architecture

### Modular File Structure

```
extension/
├── 📄 manifest.json           # Extension configuration & permissions
├── 🔧 background.js           # Service worker & lifecycle management
├── 📋 ARCHITECTURE.md         # Detailed architecture documentation
├── 🔒 SECURITY.md            # Security guidelines & best practices
├── 📖 README.md              # This file
├── 🖼️ images/                # Extension icons & assets
├── 🎨 popup/
│   ├── popup.html            # Extension popup interface
│   └── popup.js              # Popup controller & statistics
└── 📦 scripts/               # Modular JavaScript architecture
    ├── 🏛️ core/              # Core functionality
    │   ├── config.js         # Centralized configuration
    │   └── content.js        # Main entry point & coordination
    ├── 🔧 utils/             # Utility modules
    │   ├── logger.js         # Enhanced logging system
    │   ├── dom-utils.js      # DOM manipulation utilities
    │   ├── performance-utils.js # Performance optimization
    │   └── utils.js          # Unified utility interface
    ├── 🎯 scanner/           # Scanning modules
    │   ├── product-detector.js # Main product detection engine
    │   ├── deep-scanner.js   # Deep scanning orchestrator
    │   └── deep-scanner-core.js # Core scanning functionality
    ├── 📤 extractors/        # Content extraction modules
    │   ├── product-extractor.js # Product info extraction
    │   ├── content-extractor.js # Content parsing logic
    │   └── iframe-extractor.js # Iframe management & extraction
    ├── 💾 storage/           # Data storage modules
    │   ├── data-storage.js   # Deep scan data management
    │   └── storage-utils.js  # General storage utilities
    ├── 🎨 ui/                # User interface modules
    │   └── ui-manager.js     # UI components & indicators
    └── 📚 lib/               # Third-party libraries
        └── react.production.main.js # React library
```

### Component Architecture

#### 🏛️ Core Components

**`core/config.js`** - Centralized Configuration

- Performance tuning parameters
- Site-specific selectors and rules
- Feature flags and validation patterns
- Storage keys and timeout settings

**`core/content.js`** - Main Entry Point

- Extension initialization and coordination
- Message handling between components
- Debug utilities and error boundary
- Component lifecycle management

#### 🔧 Utility Modules

**`utils/logger.js`** - Enhanced Logging System

- Configurable log levels with timestamps
- Performance metric tracking
- Grouped and table formatted logging
- Debug and error categorization

**`utils/dom-utils.js`** - DOM Manipulation

- Element visibility and positioning
- Site detection and configuration
- Viewport calculations and scrolling
- Safe DOM manipulation utilities

**`utils/performance-utils.js`** - Performance Optimization

- Debounce and throttle functions
- Performance profiling tools
- Memory usage monitoring
- Idle callback management

**`utils/utils.js`** - Unified Interface

- Backwards compatibility layer
- Centralized utility access
- Dependency validation
- Modular component integration

#### 🎯 Scanner Modules

**`scanner/product-detector.js`** - Main Detection Engine

- Scroll-based product detection
- Batch processing and queue management
- Memory-efficient product tracking
- Deep scanner integration

**`scanner/deep-scanner.js`** - Scanning Orchestrator

- Queue management and coordination
- Error handling and fallback systems
- Storage method validation
- Health monitoring and recovery

**`scanner/deep-scanner-core.js`** - Core Scanning Logic

- Individual product page analysis
- Iframe-based content extraction
- Retry logic and timeout handling
- Performance optimization

#### 📤 Extractor Modules

**`extractors/product-extractor.js`** - Product Information

- Site-specific product data extraction
- Validation and quality filtering
- Metadata collection
- Batch processing capabilities

**`extractors/content-extractor.js`** - Content Parsing

- HTML content analysis and parsing
- Ingredient and specification extraction
- Structured data extraction
- Content validation and cleanup

**`extractors/iframe-extractor.js`** - Iframe Management

- Secure iframe creation and management
- Advanced page readiness detection
- Multi-strategy content loading
- Debug and troubleshooting tools

#### 💾 Storage Modules

**`storage/data-storage.js`** - Deep Scan Data Management

- Deep scan result storage and retrieval
- Failure tracking and analysis
- Data validation and integrity checks
- Storage health monitoring and maintenance

**`storage/storage-utils.js`** - General Storage Operations

- Product data storage and management
- Settings and configuration storage
- Storage statistics and analytics
- Data export and import utilities

#### 🎨 UI Modules

**`ui/ui-manager.js`** - User Interface Components

- Real-time progress indicators
- Status messages and notifications
- Responsive UI positioning
- Theme and styling management

## 🔧 Configuration

### Performance Settings

```javascript
PERFORMANCE: {
  BATCH_SIZE: 10,                    // Products per batch
  SCROLL_DELAY: 500,                 // Scroll detection delay (ms)
  VIEWPORT_BUFFER: 200,              // Detection buffer (px)
  BATCH_DELAY: 100,                  // Delay between batches (ms)
  MIN_PRODUCT_NAME_LENGTH: 5,        // Minimum valid product name length
}
```

### Deep Scan Configuration

```javascript
DEEP_SCAN: {
  MAX_CONCURRENT_SCANS: 1,           // Simultaneous scans
  DELAY_BETWEEN_REQUESTS: 5000,      // Request delay (ms)
  TIMEOUT: 12000,                    // Page load timeout (ms)
  IFRAME_LOAD_WAIT: 2000,           // Wait for dynamic content (ms)
  MAX_RETRIES: 1,                    // Retry attempts
  ENABLED_BY_DEFAULT: false,         // Default deep scan state
}
```

### Storage Management

```javascript
STORAGE: {
  PRODUCTS: 'autogreen_products',
  DEEP_SCAN_DATA: 'autogreen_deep_scan_data',
  DEEP_SCAN_ENABLED: 'autogreen_deep_scan_enabled',
  SETTINGS: 'autogreen_settings'
}
```

## 🛠️ Development

### Prerequisites

- Chrome Browser (version 88+ recommended)
- Modern JavaScript (ES6+) knowledge
- Understanding of Chrome Extension Manifest V3

### Development Setup

```bash
# 1. Clone and setup
git clone https://github.com/Onyxxx17/AutoGreen.sg.git
cd AutoGreen.sg/extension

# 2. Load as unpacked extension in Chrome
# Navigate to chrome://extensions/
# Enable Developer mode
# Click "Load unpacked" and select the extension folder

# 3. Development workflow
# Make changes to source files
# Reload extension in chrome://extensions/
# Test on target websites
```

### Debugging Tools

#### Console Commands

```javascript
// Available in browser console on target sites

// Core debugging
AutoGreenDebug.getStats(); // Current statistics
AutoGreenDebug.getStoredProducts(); // View stored products
AutoGreenDebug.clearData(); // Clear all data
AutoGreenDebug.restart(); // Restart detector

// Deep scan debugging
AutoGreenDebug.testDeepScan(url); // Test deep scan on URL
AutoGreenDebug.getDeepScanData(); // View deep scan results
AutoGreenDebug.checkStorageHealth(); // Storage health check

// Performance monitoring
AutoGreenDebug.getMemoryUsage(); // Memory statistics
AutoGreenDebug.getPerformanceMetrics(); // Performance data
```

#### Logging Levels

```javascript
// Set in config.js
LOGGING: {
  ENABLED: true,
  LEVEL: 'debug',  // 'debug', 'info', 'warn', 'error'
  PREFIX: '[AutoGreen]'
}
```

### Component Development

#### Adding New Modules

1. Create module in appropriate folder (`utils/`, `extractors/`, etc.)
2. Follow established patterns and naming conventions
3. Add to `manifest.json` content scripts in dependency order
4. Update main `utils.js` for component integration
5. Add error handling and logging

#### Modifying Selectors

```javascript
// In config.js - update site-specific selectors
SITES: {
  LAZADA: {
    SELECTORS: {
      PRODUCT_CONTAINER: '[data-qa-locator="general-products"]',
      PRODUCT_LINK: 'a[href*="/products/"]',
      HOME_PAGE_TITLE: '.c16H9d a[title]'
    }
  }
}
```

## 📊 Data Structure

### Enhanced Product Data

```javascript
{
  "id": "product-hash-position-index",
  "name": "Product Name",
  "link": "https://product-url",
  "position": 1234,
  "element": "[DOM Element Reference]",
  "extractedAt": "2024-01-01T00:00:00.000Z",
  "sourceUrl": "https://listing-page-url",
  "siteType": "lazada"
}
```

### Deep Scan Results

```javascript
{
  "deepScan": {
    "highlights": ["Feature 1", "Feature 2"],
    "ingredients": ["Ingredient A", "Ingredient B"],
    "specifications": {
      "Brand": "Brand Name",
      "Weight": "500g",
      "Dimensions": "10x5x2 cm"
    },
    "extractedAt": "2024-01-01T00:00:00.000Z",
    "extractionMethod": "iframe|fetch|fallback",
    "error": null  // Present only for failed scans
  },
  "deepScannedAt": "2024-01-01T00:00:00.000Z",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### Storage Health Data

```javascript
{
  "isHealthy": true,
  "details": {
    "hasSpace": true,
    "recentActivity": true,
    "balancedResults": true
  },
  "stats": {
    "totalProducts": 150,
    "successfulScans": 140,
    "failedScans": 10,
    "storageSize": 245760,
    "lastUpdate": 1735689600000
  },
  "recommendations": ["Storage system is healthy"]
}
```

## 🔒 Privacy & Security

### Data Handling Principles

- **🏠 Local-Only Storage**: All data remains in browser's local storage
- **🚫 No External Transmission**: Zero external servers or analytics
- **👤 User Control**: Complete control over data lifecycle
- **🔒 Secure Extraction**: Sandboxed iframe-based content access
- **🧹 Automatic Cleanup**: Built-in data expiration and maintenance

### Security Features

- **Sandboxed Iframes**: Secure content extraction with limited permissions
- **Input Validation**: Comprehensive validation of all stored data
- **Error Boundaries**: Isolated error handling prevents data corruption
- **Rate Limiting**: Respectful request patterns to prevent blocking
- **CORS Handling**: Proper handling of cross-origin restrictions

### Permissions Explained

```json
{
  "activeTab": "Access current tab for product detection",
  "storage": "Local storage for extension data and settings",
  "downloads": "Enable data export functionality"
}
```

## ⚡ Performance

### Optimization Features

- **🎯 Smart Detection**: Viewport-based detection reduces processing
- **📦 Batch Processing**: Efficient handling of multiple products
- **🧠 Memory Management**: Automatic cleanup prevents memory leaks
- **⏱️ Debounced Events**: Prevents excessive scroll event processing
- **📊 Performance Monitoring**: Built-in metrics and profiling
- **🔄 Idle Processing**: Uses browser idle time for background tasks

### Resource Usage

- **CPU Impact**: <5% average CPU usage during active scanning
- **Memory Footprint**: ~10-50MB depending on data volume
- **Network Respectful**: 1 request per 5 seconds for deep scanning
- **Storage Efficient**: Automatic cleanup maintains <5MB storage

### Performance Metrics

```javascript
// Available through AutoGreenDebug
{
  "scanningSpeed": "12 products/second",
  "deepScanSuccess": "92%",
  "averageResponseTime": "2.3 seconds",
  "memoryUsage": "23.4 MB",
  "errorRate": "0.8%"
}
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### ❌ Extension Not Working

- **Check Website**: Ensure you're on Lazada or Shopee Singapore
- **Reload Extension**: Disable and re-enable in chrome://extensions/
- **Clear Storage**: Use "Clear All Data" in popup
- **Check Console**: Look for errors in browser developer console
- **Update Chrome**: Ensure Chrome is version 88+

#### 🔍 No Products Detected

- **Scroll Required**: Detection triggers on scroll events
- **Page Type**: Works on product listing pages (not individual products)
- **Site Changes**: Website layout updates may require selector updates
- **Network Issues**: Check internet connection

#### 📊 Deep Scan Issues

- **Security Restrictions**: Some pages block iframe access (normal)
- **Rate Limiting**: Extension respects site rate limits
- **Timeout Errors**: Slow pages may timeout (normal fallback)
- **CORS Errors**: Cross-origin restrictions (expected behavior)

#### 💾 Storage Problems

- **Storage Full**: Clear old data or increase browser storage
- **Corruption**: Use storage health check and recovery tools
- **Performance**: Run maintenance to optimize storage

### Error Categories

| Error Type         | Cause                     | Solution                              |
| ------------------ | ------------------------- | ------------------------------------- |
| `CORS_ERROR`       | Cross-origin restrictions | Normal - fallback methods used        |
| `TIMEOUT_ERROR`    | Page loading timeout      | Normal - proceeds with available data |
| `NETWORK_ERROR`    | Connection issues         | Check internet connection             |
| `STORAGE_ERROR`    | Storage space/corruption  | Use storage maintenance tools         |
| `VALIDATION_ERROR` | Invalid data format       | Clear corrupted data                  |

### Debug Tools

```javascript
// Storage health check
AutoGreenDebug.checkStorageHealth();

// Performance analysis
AutoGreenDebug.getPerformanceMetrics();

// Memory usage
AutoGreenDebug.getMemoryUsage();

// Component status
AutoGreenDebug.getSystemStatus();
```

## 📈 Roadmap

### Immediate Improvements (v1.1)

- **� Enhanced UI**: Improved popup interface with better statistics
- **📊 Analytics Dashboard**: Built-in data visualization charts
- **🔧 Advanced Settings**: More customization options
- **🌍 Multi-region**: Support for other Lazada/Shopee regions

### Future Features (v2.0)

- **🤖 AI Integration**: Automated product categorization
- **📱 Mobile Support**: Extension for mobile browsers
- **☁️ Cloud Sync**: Optional cloud backup and sync
- **🎯 Smart Filtering**: Machine learning-based product relevance
- **📈 Trend Analysis**: Product price and availability tracking

### Technical Roadmap

- **⚡ Performance**: WebAssembly for intensive processing
- **🧪 Testing**: Comprehensive automated test suite
- **� Packaging**: Distribution through Chrome Web Store
- **🔄 API Integration**: Optional integration with external services

## 🤝 Contributing

### How to Contribute

1. **🍴 Fork** the repository on GitHub
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **✏️ Make** your changes following the coding standards
4. **🧪 Test** thoroughly on target websites
5. **📝 Commit** changes (`git commit -m 'Add amazing feature'`)
6. **📤 Push** to branch (`git push origin feature/amazing-feature`)
7. **🎯 Submit** a Pull Request

### Development Guidelines

#### Code Style

- Use modern ES6+ JavaScript features
- Follow existing naming conventions and patterns
- Add comprehensive error handling
- Include detailed comments for complex logic
- Maintain modular architecture principles

#### Testing Checklist

- [ ] Test on both Lazada and Shopee
- [ ] Verify deep scanning functionality
- [ ] Check storage operations
- [ ] Test error recovery mechanisms
- [ ] Validate UI responsiveness
- [ ] Confirm data export functionality

#### Documentation

- Update README for new features
- Add inline code documentation
- Update ARCHITECTURE.md for structural changes
- Include usage examples

### Bug Reports

When reporting bugs, please include:

- Browser version and operating system
- Steps to reproduce the issue
- Expected vs actual behavior
- Console error messages (if any)
- Extension version and settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors & Contributors

- **AutoGreen Team** - _Initial work_ - [Onyxxx17](https://github.com/Onyxxx17)
- **Community Contributors** - See [CONTRIBUTORS.md](CONTRIBUTORS.md)

## 🙏 Acknowledgments

- **Chrome Extension Community** - Documentation and best practices
- **E-commerce Platforms** - Lazada and Shopee for rich product ecosystems
- **Open Source Community** - Tools, libraries, and inspiration
- **Beta Testers** - Early adopters who helped improve the extension

## 📞 Support

### Getting Help

- **📖 Documentation**: Check ARCHITECTURE.md for technical details
- **🐛 Issues**: Report bugs on GitHub Issues
- **💬 Discussions**: Join GitHub Discussions for questions
- **📧 Contact**: Reach out to the development team

### Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Extension Architecture Guide](./ARCHITECTURE.md)
- [Security Best Practices](./SECURITY.md)

---

**⚠️ Important Notice**: This extension is designed for educational and research purposes. Please respect the terms of service of the websites you visit and use the extension responsibly. The extension operates within browser security boundaries and does not circumvent any website protections.
