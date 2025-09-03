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
      this.ecoTips = [
        "Choosing 'No cutlery' saves ~15g plastic per order and earns you +1 Green Point!",
        "Green delivery reduces carbon emissions by up to 40% and earns +2 Points!",
        "Paperless receipts help save ~3M trees/year in Singapore. +1 Point each!",
        "Consolidating deliveries cuts packaging waste by 60%. Smart shopping!",
        "Eco-friendly products use 50% less water in production. +3 Points each!",
        "Bringing your own bag saves 1kg of plastic per month on average.",
        "Local products cut transport emissions by 70%. Support local businesses!"
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
        } catch (error) {
          console.error('Failed to load from storage:', error);
          this.loadDemoData();
        }
      } else {
        this.loadDemoData();
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
        ecoProducts: 3
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
  
      // Click outside modal to close
      document.getElementById('eco-tip-modal').addEventListener('click', (e) => {
        if (e.target.id === 'eco-tip-modal') {
          this.closeEcoTip();
        }
      });
  
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeEcoTip();
        }
      });
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
     * Show random eco tip modal
     */
    showEcoTip() {
      const randomTip = this.state.ecoTips[Math.floor(Math.random() * this.state.ecoTips.length)];
      const modal = document.getElementById('eco-tip-modal');
      const content = document.getElementById('tip-content');
      
      content.textContent = randomTip;
      modal.classList.remove('hidden');
      
      // Focus management for accessibility
      const modalContent = modal.querySelector('.modal-content');
      modalContent.focus();
    }
  
    /**
     * Close eco tip modal
     */
    closeEcoTip() {
      const modal = document.getElementById('eco-tip-modal');
      modal.classList.add('hidden');
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
  
  function showEcoTip() {
    if (app && app.ui) {
      app.ui.showEcoTip();
    }
  }
  
  function closeEcoTip() {
    if (app && app.ui) {
      app.ui.closeEcoTip();
    }
  }
  
  function openWebsite() {
    if (app && app.ui) {
      app.ui.openUrl('https://autogreen-sg.vercel.app');
    }
  }
  
  function openLeaderboard() {
    if (app && app.ui) {
      app.ui.openUrl('https://autogreen-sg.vercel.app/leaderboard');
    }
  }
  
  function openSettings() {
    if (app && app.ui) {
      app.ui.openUrl('https://autogreen-sg.vercel.app/settings');
    }
  }