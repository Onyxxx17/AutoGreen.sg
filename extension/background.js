/**
 * AutoGreen.sg Extension - Background Service Worker
 *
 * Handles background tasks and extension lifecycle events
 *
 * @author AutoGreen Team
 * @version 1.0.0
 */

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Initialize storage with default settings
    chrome.storage.local.set({
      autogreen_deep_scan_enabled: false,
      autogreen_installation_date: new Date().toISOString(),
    });
  }
});

// Handle tab updates to inject content scripts if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process when the page is completely loaded
  if (changeInfo.status === "complete" && tab.url) {
    const isValidSite =
      tab.url.includes("lazada.") || 
      tab.url.includes("foodpanda.");

    if (isValidSite) {
      // Update extension badge to show it's active
      chrome.action.setBadgeText({
        tabId: tabId,
        text: "✓",
      });

      chrome.action.setBadgeBackgroundColor({
        tabId: tabId,
        color: "#4CAF50",
      });
    } else {
      // Clear badge for non-supported sites
      chrome.action.setBadgeText({
        tabId: tabId,
        text: "",
      });
    }
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "log_analytics":
      // Handle analytics logging if needed
      sendResponse({ success: true });
      break;

    case "get_extension_info":
      // Provide extension information
      sendResponse({
        version: chrome.runtime.getManifest().version,
        id: chrome.runtime.id,
      });
      break;

    default:
      sendResponse({ error: "Unknown action" });
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  // Extension started
});

// Clean up on extension suspension
chrome.runtime.onSuspend.addListener(() => {
  // Extension suspending
});
