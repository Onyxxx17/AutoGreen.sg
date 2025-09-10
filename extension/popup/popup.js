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

  // Initialize the application
  await initializeApp();
});

// Listen for messages from content scripts (e.g., when points are earned)
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'pointsEarned') {
      console.log('📊 Points earned notification received, refreshing stats...');
      
      // Refresh stats if app is initialized
      if (window.app && window.app.state && window.app.state.fetchAndUpdateStats) {
        window.app.state.fetchAndUpdateStats().then(() => {
          console.log('✅ Stats refreshed after points earned');
          sendResponse({ success: true });
        }).catch((error) => {
          console.error('❌ Failed to refresh stats:', error);
          sendResponse({ success: false, error: error.message });
        });
      } else {
        sendResponse({ success: false, error: 'App not initialized' });
      }
      
      return true; // Keep message channel open for async response
    }
  });
}


// ================================================
// 📊 STATE MANAGEMENT
// ================================================

class AutoGreenState {
  constructor() {
    this.extensionEnabled = true;
    this.deepScanEnabled = false;
    this.userStats = {
      points: 0,
      itemsSaved: 0
    };
    this.supportedSites = [
      'lazada', 'foodpanda'
    ];
    this.userId = null; // Will store persistent user ID
  }

  /**
   * Load state from Chrome storage
   */
  async loadFromStorage() {
    if (this.isChromeExtension()) {
      try {
        const data = await new Promise((resolve, reject) => {
          chrome.storage.sync.get(['extensionEnabled', 'userStats', 'deepScanEnabled', 'userId'], (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });

        this.extensionEnabled = data.extensionEnabled !== false;
        this.deepScanEnabled = data.deepScanEnabled || false;
        
        // Get or create persistent user ID
        if (data.userId) {
          this.userId = data.userId;
        } else {
          this.userId = this.generateUUID();
          // Save the new user ID immediately
          chrome.storage.sync.set({ userId: this.userId });
        }
        
        if (data.userStats) {
          this.userStats = { ...this.userStats, ...data.userStats };
        }
        
      } catch (error) {
        console.error('Failed to load from storage:', error);
        this.loadDemoData();
      }
    } else {
      this.loadDemoData();
    }
  }

  /**
   * Save current state to Chrome storage
   */
  saveToStorage() {
    if (this.isChromeExtension()) {
      try {
        chrome.storage.sync.set({ 
          extensionEnabled: this.extensionEnabled,
          deepScanEnabled: this.deepScanEnabled,
          userStats: this.userStats,
          userId: this.userId
        });
      } catch (error) {
        console.error('Failed to save to storage:', error);
      }
    }
  }

  /**
   * Load demo data for testing
   */
  loadDemoData() {
    this.userStats = {
      points: 127,
      itemsSaved: 23
    };
  }

  /**
   * Check if running as Chrome extension
   */
  isChromeExtension() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.runtime;
  }

  /**
   * Generate a random UUID for user identification
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Update the stats display in the UI
   */
  updateStatsDisplay() {
    const pointsEl = document.getElementById('user-points');
    const itemsEl = document.getElementById('items-saved');

    if (pointsEl) pointsEl.textContent = this.userStats.points;
    if (itemsEl) itemsEl.textContent = this.userStats.itemsSaved;
  }

  /**
   * Fetch user stats from backend API and update display
   */
  async fetchAndUpdateStats() {
    if (!this.userId) {
      console.log('No user ID available, cannot fetch stats');
      return;
    }

    try {
      const apiUrl = `https://autogreen-sg.vercel.app/api/users/${this.userId}/stats`;
      console.log('Fetching user stats from API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Received user stats from API:', data);

        // Update user stats with backend data (check if response has success wrapper)
        if (data.success && data.stats) {
          this.userStats.points = data.stats.greenPoints || 0;
          this.userStats.itemsSaved = data.stats.recordCount || 0;
        } else {
          // Direct stats object
          this.userStats.points = data.greenPoints || data.totalPoints || 0;
          this.userStats.itemsSaved = data.recordCount || data.totalActions || 0;
        }

        // Update the UI immediately
        this.updateStatsDisplay();
        
        // Save updated stats to local storage
        this.saveToStorage();

        return data;
      } else if (response.status === 404) {
        console.log('User not found in database, keeping local stats');
      } else {
        console.log('API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch user stats from API:', error);
    }
  }
}

// ================================================
// 🎮 UI CONTROLLER
// ================================================

class AutoGreenUI {
  constructor(state) {
    this.state = state;
  }

  /**
   * Initialize UI components
   */
  async initialize() {
    await this.checkCurrentSite();
    this.updateToggleButton();
    this.setupEventListeners();
    await this.loadStats();
    
    // Fetch real stats from backend database
    await this.state.fetchAndUpdateStats();
    
    await this.loadSettings();
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
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        const isSupported = this.state.supportedSites.some(site => 
          tab.url && tab.url.includes(site)
        );
        this.updateSiteStatus(isSupported);
        
        if (!isSupported) {
          this.showInactivePage();
        }
      }
    } catch (error) {
      console.error('Failed to check current site:', error);
      this.updateSiteStatus(false);
    }
  }

  /**
   * Update site status
   */
  updateSiteStatus(isSupported) {
    const detectionStatus = document.getElementById('detection-status');
    
    if (detectionStatus) {
      if (isSupported) {
        detectionStatus.textContent = 'Monitoring eco-friendly options...';
      } else {
        detectionStatus.textContent = 'Navigate to Lazada or FoodPanda to activate';
      }
    }
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Deep scan toggle
    const deepScanToggle = document.getElementById('deepScanToggle');
    if (deepScanToggle) {
      deepScanToggle.addEventListener('change', async (e) => {
        await this.toggleDeepScan(e.target.checked);
      });
    }

    // Main extension toggle
    const toggleBtn = document.getElementById('toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleExtension();
      });
    }


    // Quick action buttons
    const viewDataBtn = document.getElementById('viewData');
    const clearDataBtn = document.getElementById('clearData');
    const refreshStatsBtn = document.getElementById('refreshStats');

    if (viewDataBtn) {
      viewDataBtn.addEventListener('click', () => this.exportData());
    }

    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => this.clearData());
    }

    if (refreshStatsBtn) {
      refreshStatsBtn.addEventListener('click', () => this.refreshStats());
    }
  }

  /**
   * Load current settings
   */
  async loadSettings() {
    try {
      if (this.state.isChromeExtension()) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && tab.url && this.state.supportedSites.some(site => tab.url.includes(site))) {
          const result = await chrome.tabs.sendMessage(tab.id, {
            action: "getDeepScanStatus",
          });

          if (result && typeof result.enabled === "boolean") {
            this.state.deepScanEnabled = result.enabled;
            const deepScanToggle = document.getElementById('deepScanToggle');
            if (deepScanToggle) {
              deepScanToggle.checked = result.enabled;
            }
            this.updateDeepScanStatus(result.enabled);
          }
        }

      }
      
      // Update toggle from stored state
      const deepScanToggle = document.getElementById('deepScanToggle');
      if (deepScanToggle) {
        deepScanToggle.checked = this.state.deepScanEnabled;
      }
      this.updateDeepScanStatus(this.state.deepScanEnabled);
      
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showStatus('Failed to load settings', 'error');
    }
  }

  /**
   * Load current statistics
   */
  async loadStats() {
    try {
      if (this.state.isChromeExtension()) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && tab.url && this.state.supportedSites.some(site => tab.url.includes(site))) {
          // Get basic stats
          const basicResult = await chrome.tabs.sendMessage(tab.id, {
            action: "getBasicStats",
          });

          if (basicResult) {
            const basicStats = document.getElementById('basic-stats');
            if (basicStats) {
              if (basicResult.disabled) {
                basicStats.innerHTML = `<div style="color: #999;">Extension Disabled</div>`;
              } else {
                basicStats.innerHTML = `
                  <div>Currently Processing: ${basicResult.currentlyProcessing ? "Yes" : "No"}</div>
                `;
              }
            }
          }

          // Get deep scan stats
          const deepResult = await chrome.tabs.sendMessage(tab.id, {
            action: "getDeepScanStats",
          });

          if (deepResult) {
            const deepStats = document.getElementById('deep-scan-stats');
            if (deepStats) {
              if (deepResult.disabled) {
                deepStats.innerHTML = `<div style="color: #999;">Extension Disabled</div>`;
              } else {
                deepStats.innerHTML = `
                  <div>Queue Length: ${deepResult.queueLength || 0}</div>
                  <div>Active Scanners: ${deepResult.activeScanners || 0}/${deepResult.maxConcurrent || 3}</div>
                  <div>Scanned Products: ${deepResult.scannedCount || 0}</div>
                `;
              }
            }
          }
        }
      }
      
      // Set default stats if no content script response
      const basicStats = document.getElementById('basic-stats');
      const deepStats = document.getElementById('deep-scan-stats');
      
      if (basicStats && basicStats.textContent === 'Loading...') {
        basicStats.innerHTML = `
          <div>Currently Processing: No</div>
        `;
      }
      
      if (deepStats && deepStats.textContent === 'Loading...') {
        deepStats.innerHTML = `
          <div>Queue Length: 0</div>
          <div>Active Scanners: 0/3</div>
          <div>Scanned Products: 0</div>
        `;
      }
      
    } catch (error) {
      console.error('Failed to load stats:', error);
      const basicStats = document.getElementById('basic-stats');
      const deepStats = document.getElementById('deep-scan-stats');
      
      if (basicStats) basicStats.textContent = 'Stats unavailable';
      if (deepStats) deepStats.textContent = 'Deep scan stats unavailable';
    }

//         if (result && result.success) {
//           updateDeepScanStatus(this.checked);
//           await loadStats(); // Refresh stats
//         } else {
//           // Revert toggle if failed
//           this.checked = !this.checked;
//           showError("Failed to toggle deep scan");
//         }
//       } catch (error) {
//         console.error("[AutoGreen Popup] Toggle error:", error);
//         this.checked = !this.checked;
//         showError("Failed to toggle deep scan");
//       }
//     });

  }

  /**
   * Toggle deep scan mode
   */
  async toggleDeepScan(enabled) {
    try {
      this.state.deepScanEnabled = enabled;
      this.state.saveToStorage();
      
      if (this.state.isChromeExtension()) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && tab.url && this.state.supportedSites.some(site => tab.url.includes(site))) {
          const result = await chrome.tabs.sendMessage(tab.id, {
            action: "toggleDeepScan",
            enabled: enabled,
          });

          if (result && result.success) {
            this.updateDeepScanStatus(enabled);
            await this.loadStats();
            return;
          }
        }
      }
      
      // Update UI even if no content script
      this.updateDeepScanStatus(enabled);
      
    } catch (error) {
      console.error('Toggle deep scan error:', error);
      // Revert toggle
      const deepScanToggle = document.getElementById('deepScanToggle');
      if (deepScanToggle) {
        deepScanToggle.checked = !enabled;
      }
      this.showStatus('Failed to toggle deep scan', 'error');
    }
  }

  /**
   * Toggle main extension
   */
  async toggleExtension() {
    this.state.extensionEnabled = !this.state.extensionEnabled;
    this.state.saveToStorage();
    this.updateToggleButton();
    
    // Notify all content scripts about the extension toggle
    try {
      const tabs = await chrome.tabs.query({
        url: ["https://lazada.sg/*", "https://www.lazada.sg/*", "https://lazada.com.sg/*", 
              "https://www.lazada.com.sg/*", "https://checkout.lazada.sg/*",
              "https://foodpanda.sg/*", "https://www.foodpanda.sg/*", 
              "https://foodpanda.com.sg/*", "https://www.foodpanda.com.sg/*"]
      });
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: "extensionToggled",
            enabled: this.state.extensionEnabled
          });
        } catch (error) {
          // Tab might not have content script injected, ignore
          console.log(`Could not notify tab ${tab.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('Failed to notify tabs about extension toggle:', error);
    }
    
    this.showStatus(
      this.state.extensionEnabled ? 'Extension enabled!' : 'Extension disabled',
      this.state.extensionEnabled ? 'success' : 'info'
    );
  }

  /**
   * Update toggle button appearance
   */
  updateToggleButton() {
    const btn = document.getElementById('toggle-btn');
    if (!btn) return;

    if (this.state.extensionEnabled) {
      btn.innerHTML = '<span class="toggle-icon">●</span><span class="toggle-text">Enabled</span>';
      btn.className = 'toggle-btn toggle-enabled';
    } else {
      btn.innerHTML = '<span class="toggle-icon">○</span><span class="toggle-text">Disabled</span>';
      btn.className = 'toggle-btn toggle-disabled';
    }
  }

  /**
   * Update deep scan status text
   */
  updateDeepScanStatus(enabled) {
    const deepScanStatus = document.getElementById('deepScanStatus');
    if (!deepScanStatus) return;

    if (enabled) {
      deepScanStatus.textContent = "Deep scan enabled - Products will be analyzed in detail";
      deepScanStatus.style.color = "#22c55e";
    } else {
      deepScanStatus.textContent = "Deep scan disabled - Only basic product detection";
      deepScanStatus.style.color = "#666";
    }
  }

  /**
   * Export data functionality
   */
  async exportData() {
    try {
      let dataToExport = {
        userStats: this.state.userStats,
        extensionEnabled: this.state.extensionEnabled,
        deepScanEnabled: this.state.deepScanEnabled,
        exportDate: new Date().toISOString()
      };

      if (this.state.isChromeExtension()) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && tab.url && this.state.supportedSites.some(site => tab.url.includes(site))) {
          const result = await chrome.tabs.sendMessage(tab.id, {
            action: "exportData",
          });

          if (result && result.data) {
            dataToExport = { ...dataToExport, ...result.data };
          }
        }
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      if (this.state.isChromeExtension()) {
        await chrome.downloads.download({
          url: url,
          filename: `autogreen-data-${new Date().toISOString().split("T")[0]}.json`,
        });
      } else {
        // Fallback for non-extension environment
        const a = document.createElement('a');
        a.href = url;
        a.download = `autogreen-data-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
      }

      this.showStatus("Data exported successfully", "success");
      
    } catch (error) {
      console.error('Export error:', error);
      this.showStatus("Failed to export data", "error");
    }
  }

  /**
   * Clear all data
   */
  async clearData() {
    if (!confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      return;
    }

    try {
      // Reset local state
      this.state.userStats = { points: 0, itemsSaved: 0 };
      this.state.updateStatsDisplay();
      this.state.saveToStorage();

      if (this.state.isChromeExtension()) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && tab.url && this.state.supportedSites.some(site => tab.url.includes(site))) {
          const result = await chrome.tabs.sendMessage(tab.id, {
            action: "clearAllData",
          });
        }
      }

      await this.loadStats();
      this.showStatus("All data cleared", "success");
      
    } catch (error) {
      console.error('Clear data error:', error);
      this.showStatus("Failed to clear data", "error");
    }
  }

  /**
   * Refresh statistics
   */
  async refreshStats() {
    await this.loadStats();
    
    // Fetch updated stats from backend database
    await this.state.fetchAndUpdateStats();
    
    this.showStatus("Stats refreshed", "success");
  }

  /**
   * Show status message
   */
  showStatus(message, type = 'info') {
    const deepScanStatus = document.getElementById('deepScanStatus');
    if (!deepScanStatus) return;

    const originalText = deepScanStatus.textContent;
    const originalColor = deepScanStatus.style.color;

    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      info: '#3b82f6'
    };

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };

    deepScanStatus.textContent = `${icons[type]} ${message}`;
    deepScanStatus.style.color = colors[type];

    setTimeout(() => {
      deepScanStatus.textContent = originalText;
      deepScanStatus.style.color = originalColor;
    }, 2000);
  }

  /**
   * Show inactive page message
   */
  showInactivePage() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--color-gray-600);">
          <h2 style="color: var(--color-primary); margin-bottom: 16px;">🌿 AutoGreen Extension</h2>
          <p style="margin-bottom: 8px;">This extension works on Lazada and FoodPanda websites.</p>
          <p>Navigate to a supported site to use the extension.</p>
        </div>
      `;
    }
  }

}

// ================================================
// 🎯 APPLICATION CONTROLLER
// ================================================

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
      await this.ui.initialize();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      await this.ui.initialize();
    }
  }
}

// ================================================
// 🌍 GLOBAL FUNCTIONS & INITIALIZATION
// ================================================

let app;

/**
 * Initialize the application
 */
async function initializeApp() {
  try {
    app = new AutoGreenApp();
    window.app = app; // Make app globally accessible for message handlers
    await app.initialize();
  } catch (error) {
    console.error('Failed to start AutoGreen popup:', error);
  }
}
