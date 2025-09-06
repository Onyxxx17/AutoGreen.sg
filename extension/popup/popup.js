/**
 * AutoGreen.sg Extension - Popup Controller
 *
 * Handles the popup interface for controlling extension settings
 * 
 * @author AutoGreen Team
 * @version 1.0.0
 */

// ================================================
// 🚀 POPUP INITIALIZATION
// ================================================

document.addEventListener("DOMContentLoaded", async function () {
  console.log("[AutoGreen Popup] Initializing...");

  // Get references to UI elements
  const deepScanToggle = document.getElementById("deepScanToggle");
  const deepScanStatus = document.getElementById("deepScanStatus");
  const deepScanStats = document.getElementById("deep-scan-stats");
  const basicStats = document.getElementById("basic-stats");

  // Initialize popup
  await initializePopup();

  // Set up event listeners
  setupEventListeners();

  // ================================================
  // 🔧 INITIALIZATION FUNCTIONS
  // ================================================

  /**
   * Initialize popup with current settings and stats
   */
  async function initializePopup() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab) {
        showError("Cannot access current tab");
        return;
      }

      // Check if extension is active on current page
      const isValidPage =
        tab.url && (tab.url.includes("lazada.") || tab.url.includes("foodpanda."));

      if (!isValidPage) {
        showInactivePage();
        return;
      }

      // Load current settings and stats
      await loadSettings();
      await loadStats();
    } catch (error) {
      console.error("[AutoGreen Popup] Initialization error:", error);
      showError("Failed to initialize popup");
    }
  }

  // ================================================
  // ⚙️ SETTINGS & STATS LOADING
  // ================================================

  /**
   * Load current settings from storage
   */
  async function loadSettings() {
    try {
      // Get deep scan status from localStorage via content script
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      const result = await chrome.tabs.sendMessage(tab.id, {
        action: "getDeepScanStatus",
      });

      if (result && typeof result.enabled === "boolean") {
        deepScanToggle.checked = result.enabled;
        updateDeepScanStatus(result.enabled);
      }
    } catch (error) {
      console.error("[AutoGreen Popup] Failed to load settings:", error);
      deepScanStatus.textContent = "Failed to load settings";
    }
  }

  /**
   * Load current statistics
   */
  async function loadStats() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Get basic stats
      const basicResult = await chrome.tabs.sendMessage(tab.id, {
        action: "getBasicStats",
      });

      if (basicResult) {
        basicStats.innerHTML = `
          <div>Products Found: ${basicResult.totalProcessed || 0}</div>
          <div>Currently Processing: ${
            basicResult.currentlyProcessing ? "Yes" : "No"
          }</div>
        `;
      }

      // Get deep scan stats
      const deepResult = await chrome.tabs.sendMessage(tab.id, {
        action: "getDeepScanStats",
      });

      if (deepResult) {
        deepScanStats.innerHTML = `
          <div>Queue Length: ${deepResult.queueLength || 0}</div>
          <div>Active Scanners: ${deepResult.activeScanners || 0}/${
          deepResult.maxConcurrent || 3
        }</div>
          <div>Scanned Products: ${deepResult.scannedCount || 0}</div>
        `;
      }
    } catch (error) {
      console.error("[AutoGreen Popup] Failed to load stats:", error);
      basicStats.textContent = "Failed to load stats";
      deepScanStats.textContent = "Failed to load deep scan stats";
    }
  }

  // ================================================
  // 🎛️ EVENT LISTENERS & CONTROLS
  // ================================================

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Deep scan toggle
    deepScanToggle.addEventListener("change", async function () {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        const result = await chrome.tabs.sendMessage(tab.id, {
          action: "toggleDeepScan",
          enabled: this.checked,
        });

        if (result && result.success) {
          updateDeepScanStatus(this.checked);
          await loadStats(); // Refresh stats
        } else {
          // Revert toggle if failed
          this.checked = !this.checked;
          showError("Failed to toggle deep scan");
        }
      } catch (error) {
        console.error("[AutoGreen Popup] Toggle error:", error);
        this.checked = !this.checked;
        showError("Failed to toggle deep scan");
      }
    });
  }

  /**
   * Update deep scan status text
   */
  function updateDeepScanStatus(enabled) {
    if (enabled) {
      deepScanStatus.textContent =
        "✅ Deep scan enabled - Products will be analyzed in detail";
      deepScanStatus.style.color = "#4CAF50";
    } else {
      deepScanStatus.textContent =
        "❌ Deep scan disabled - Only basic product detection";
      deepScanStatus.style.color = "#666";
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    deepScanStatus.textContent = `❌ ${message}`;
    deepScanStatus.style.color = "#f44336";
  }
  /**
   * Show inactive page message
   */
  function showInactivePage() {
    document.body.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2>🛍️ AutoGreen Extension</h2>
        <p>This extension only works on Lazada and Shopee websites.</p>
        <p>Please navigate to a supported e-commerce site to use the extension.</p>
      </div>
    `;
  }
});
/**
 * Application State Management
 */
class AutoGreenState {
    constructor() {
      this.extensionEnabled = true;
      this.userStats = {
        points: 0,
        streak: 0,
        itemsSaved: 0,
        noCutlery: 0,
        greenDelivery: 0,
        paperless: 0,
        ecoProducts: 0
      };
      this.supportedSites = [
        'grab', 'foodpanda', 'deliveroo', 'lazada', 'shopee', 
        'redmart', 'fairprice', 'amazon.sg', 'carousell'
      ];
    }
  
    /**
     * Update user statistics
     */
    updateStats(newStats) {
      this.userStats = { ...this.userStats, ...newStats };
      this.saveToStorage();
      this.updateStatsDisplay();
    }
  
    /**
     * Save current state to Chrome storage
     */
    saveToStorage() {
      if (this.isChromeExtension()) {
        try {
          chrome.storage.sync.set({ 
            extensionEnabled: this.extensionEnabled,
            userStats: this.userStats 
          });
        } catch (error) {
          console.error('Failed to save to storage:', error);
        }
      }
    }
  
    /**
     * Load state from Chrome storage
     */
    async loadFromStorage() {
      if (this.isChromeExtension()) {
        try {
          const data = await new Promise((resolve, reject) => {
            chrome.storage.sync.get(['extensionEnabled', 'userStats'], (result) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(result);
              }
            });
          });
  
          this.extensionEnabled = data.extensionEnabled !== false;
          if (data.userStats) {
            this.userStats = { ...this.userStats, ...data.userStats };
          }

          // Load eco-friendly statistics
          await this.loadEcoStats();
          
        } catch (error) {
          console.error('Failed to load from storage:', error);
          this.loadDemoData();
        }
      } else {
        this.loadDemoData();
      }
    }

    /**
     * Load eco-friendly statistics from local storage
     */
    async loadEcoStats() {
      try {
        const ecoData = await new Promise((resolve, reject) => {
          chrome.storage.local.get(['autogreen_eco_products'], (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });

        if (ecoData.autogreen_eco_products) {
          const ecoStats = ecoData.autogreen_eco_products;
          this.userStats.ecoProducts = ecoStats.totalEcoProducts || 0;
          console.log('Loaded eco-friendly stats:', ecoStats);
        }
      } catch (error) {
        console.error('Failed to load eco stats:', error);
      }
    }
  
    /**
     * Load demo data for testing
     */
    loadDemoData() {
      this.userStats = {
        points: 127,
        streak: 5,
        itemsSaved: 23,
        noCutlery: 8,
        greenDelivery: 4,
        paperless: 11,
        ecoProducts: 15
      };
    }
  
    /**
     * Check if running as Chrome extension
     */
    isChromeExtension() {
      return typeof chrome !== 'undefined' && chrome.storage && chrome.runtime;
    }
  
    /**
     * Update the stats display in the UI
     */
    updateStatsDisplay() {
      const statElements = {
        'user-points': this.userStats.points,
        'user-streak': this.userStats.streak,
        'items-saved': this.userStats.itemsSaved,
        'no-cutlery': this.userStats.noCutlery,
        'green-delivery': this.userStats.greenDelivery,
        'paperless': this.userStats.paperless,
        'eco-products': this.userStats.ecoProducts
      };
  
      Object.entries(statElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          // Add animation when value changes
          if (element.textContent !== value.toString()) {
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
              element.style.transform = 'scale(1)';
            }, 200);
          }
          element.textContent = value;
        }
      });
    }
  }
  
  /**
   * UI Controller
   */
  class AutoGreenUI {
    constructor(state) {
      this.state = state;
      this.notificationQueue = [];
    }
  
    /**
     * Initialize UI components
     */
    initialize() {
      this.updateToggleButton();
      this.checkCurrentSite();
      this.setupEventListeners();
      this.initializeLucideIcons();
    }
  
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
      if (this.state.isChromeExtension()) {
        chrome.runtime.onMessage.addListener((message) => {
          this.handleExtensionMessage(message);
        });
      }
    }
  
    /**
     * Handle messages from extension
     */
    handleExtensionMessage(message) {
      switch (message.action) {
        case 'updateStats':
          this.state.loadFromStorage();
          break;
        case 'ecoActionDetected':
          this.showNotification('🌱 Eco option auto-selected!', 'success');
          break;
        default:
          console.warn('Unknown message action:', message.action);
      }
    }
  
    /**
     * Check if current site is supported
     */
    async checkCurrentSite() {
      if (!this.state.isChromeExtension()) {
        this.updateSiteStatus(true);
        return;
      }
  
      try {
        const tabs = await new Promise((resolve, reject) => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(tabs);
            }
          });
        });
  
        if (tabs[0]) {
          const isSupported = this.state.supportedSites.some(site => 
            tabs[0].url.includes(site)
          );
          this.updateSiteStatus(isSupported);
        }
      } catch (error) {
        console.error('Failed to check current site:', error);
        this.updateSiteStatus(false);
      }
    }
  
    /**
     * Update site status indicator
     */
    updateSiteStatus(isSupported) {
      const statusDot = document.getElementById('status-dot');
      const statusText = document.getElementById('status-text');
      const detectionStatus = document.getElementById('detection-status');
  
      if (isSupported) {
        statusDot.className = 'status-dot status-active';
        statusText.textContent = 'Active';
        statusText.className = 'status-text';
        detectionStatus.textContent = 'Monitoring eco-friendly options...';
      } else {
        statusDot.className = 'status-dot status-standby';
        statusText.textContent = 'Standby';
        statusText.className = 'status-text';
        statusText.style.color = 'var(--color-yellow-600)';
        detectionStatus.textContent = 'Visit supported sites for eco tracking';
      }
    }
  
    /**
     * Toggle extension on/off
     */
    toggleExtension() {
      this.state.extensionEnabled = !this.state.extensionEnabled;
      this.state.saveToStorage();
  
      if (this.state.isChromeExtension()) {
        this.sendMessageToContentScript({
          action: 'toggleExtension',
          enabled: this.state.extensionEnabled
        });
      }
  
      this.updateToggleButton();
      this.showNotification(
        this.state.extensionEnabled ? 'Extension enabled!' : 'Extension paused',
        this.state.extensionEnabled ? 'success' : 'info'
      );
    }
  
    /**
     * Update toggle button appearance
     */
    updateToggleButton() {
      const btn = document.getElementById('toggle-btn');
      if (this.state.extensionEnabled) {
        btn.innerHTML = '<i data-lucide="power" class="icon-small"></i><span>Extension Enabled</span>';
        btn.className = 'toggle-btn toggle-enabled';
      } else {
        btn.innerHTML = '<i data-lucide="pause" class="icon-small"></i><span>Extension Paused</span>';
        btn.className = 'toggle-btn toggle-disabled';
      }
      this.initializeLucideIcons();
    }
  
    /**
     * Open URL in new tab
     */
    openUrl(url) {
      if (this.state.isChromeExtension()) {
        try {
          chrome.tabs.create({ url });
          window.close();
        } catch (error) {
          console.error('Failed to open URL:', error);
          // Fallback to window.open
          window.open(url, '_blank');
        }
      } else {
        window.open(url, '_blank');
      }
    }
  
    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
      const notification = this.createNotificationElement(message, type);
      const container = document.getElementById('notifications');
      
      container.appendChild(notification);
  
      // Auto-remove after 3 seconds
      setTimeout(() => {
        this.removeNotification(notification);
      }, 3000);
    }
  
    /**
     * Create notification element
     */
    createNotificationElement(message, type) {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      return notification;
    }
  
    /**
     * Remove notification with animation
     */
    removeNotification(notification) {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutUp 0.3s ease-in forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    }
  
    /**
     * Send message to content script
     */
    sendMessageToContentScript(message) {
      if (this.state.isChromeExtension()) {
        try {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, message);
            }
          });
        } catch (error) {
          console.error('Failed to send message to content script:', error);
        }
      }
    }
  
    /**
     * Initialize Lucide icons
     */
    initializeLucideIcons() {
      setTimeout(() => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }, 100);
    }
  }
  
  /**
   * Application Controller
   */
  class AutoGreenApp {
    constructor() {
      this.state = new AutoGreenState();
      this.ui = new AutoGreenUI(this.state);
    }
  
    /**
     * Initialize the application
     */
    async initialize() {
      try {
        await this.state.loadFromStorage();
        this.state.updateStatsDisplay();
        this.ui.initialize();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Still initialize UI with default values
        this.ui.initialize();
      }
    }
  }
  
  // Global app instance
  let app;
  
  /**
   * Initialize popup when DOM is loaded
   */
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      app = new AutoGreenApp();
      await app.initialize();
    } catch (error) {
      console.error('Failed to start AutoGreen popup:', error);
    }
  });
  
  /**
   * Global functions for button onclick handlers
   * These need to remain global for the HTML onclick attributes
   */
  function toggleExtension() {
    if (app && app.ui) {
      app.ui.toggleExtension();
    }
  }
  
  function openSettings() {
    if (app && app.ui) {
      app.ui.openUrl('https://autogreen-sg.vercel.app/settings');
    }
  }