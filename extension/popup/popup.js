/**
 * AutoGreen.sg Extension - Popup Controller
 *
 * Handles the popup interface for controlling extension settings
 */

document.addEventListener("DOMContentLoaded", async function () {
  console.log("[AutoGreen Popup] Initializing...");

  // Get references to UI elements
  const deepScanToggle = document.getElementById("deepScanToggle");
  const deepScanStatus = document.getElementById("deepScanStatus");
  const deepScanStats = document.getElementById("deep-scan-stats");
  const basicStats = document.getElementById("basic-stats");
  const viewDataBtn = document.getElementById("viewData");
  const clearDataBtn = document.getElementById("clearData");
  const refreshStatsBtn = document.getElementById("refreshStats");

  // Initialize popup
  await initializePopup();

  // Set up event listeners
  setupEventListeners();

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
        tab.url && (tab.url.includes("lazada.") || tab.url.includes("shopee."));

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

    // View data button
    viewDataBtn.addEventListener("click", async function () {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        const result = await chrome.tabs.sendMessage(tab.id, {
          action: "exportData",
        });

        if (result && result.data) {
          // Create a blob and download it
          const blob = new Blob([JSON.stringify(result.data, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);

          await chrome.downloads.download({
            url: url,
            filename: `autogreen-data-${
              new Date().toISOString().split("T")[0]
            }.json`,
          });

          showSuccess("Data exported successfully");
        }
      } catch (error) {
        console.error("[AutoGreen Popup] Export error:", error);
        showError("Failed to export data");
      }
    });

    // Clear data button
    clearDataBtn.addEventListener("click", async function () {
      if (
        !confirm(
          "Are you sure you want to clear all data? This cannot be undone."
        )
      ) {
        return;
      }

      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        const result = await chrome.tabs.sendMessage(tab.id, {
          action: "clearAllData",
        });

        if (result && result.success) {
          await loadStats(); // Refresh stats
          showSuccess("All data cleared");
        } else {
          showError("Failed to clear data");
        }
      } catch (error) {
        console.error("[AutoGreen Popup] Clear error:", error);
        showError("Failed to clear data");
      }
    });

    // Refresh stats button
    refreshStatsBtn.addEventListener("click", async function () {
      await loadStats();
      showSuccess("Stats refreshed");
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
   * Show success message
   */
  function showSuccess(message) {
    const originalText = deepScanStatus.textContent;
    const originalColor = deepScanStatus.style.color;

    deepScanStatus.textContent = `✅ ${message}`;
    deepScanStatus.style.color = "#4CAF50";

    setTimeout(() => {
      deepScanStatus.textContent = originalText;
      deepScanStatus.style.color = originalColor;
    }, 2000);
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
