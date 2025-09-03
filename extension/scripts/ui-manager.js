/**
 * AutoGreen.sg Extension - UI Manager
 *
 * Handles all UI-related functionality for indicators and counters
 */

class UIManager {
  constructor() {
    this.indicators = new Map();
    this.config = window.AutoGreenConfig;
    this.logger = window.AutoGreenLogger;
  }

  /**
   * Create and show a temporary indicator message
   */
  showIndicator(
    message,
    type = "info",
    duration = this.config.INDICATOR_DURATION
  ) {
    try {
      this.removeIndicator("scroll-indicator");

      const indicator = this.createIndicatorElement(message, type);
      indicator.id = "autogreen-scroll-indicator";

      document.body.appendChild(indicator);
      this.indicators.set("scroll-indicator", indicator);

      this.logger.log(`Indicator: ${message}`);

      setTimeout(() => this.removeIndicator("scroll-indicator"), duration);
    } catch (error) {
      this.logger.error("Failed to show indicator:", error);
    }
  }

  /**
   * Create and maintain a persistent counter display
   */
  showCounter(count) {
    try {
      let counter = document.getElementById("autogreen-counter");

      if (!counter) {
        counter = this.createCounterElement();
        document.body.appendChild(counter);
        this.indicators.set("counter", counter);
      }

      counter.textContent = `🛍️ Products Found: ${count}`;
    } catch (error) {
      this.logger.error("Failed to update counter:", error);
    }
  }

  /**
   * Create indicator element with consistent styling
   */
  createIndicatorElement(message, type) {
    const indicator = document.createElement("div");
    const color = this.getColorForType(type);

    indicator.style.cssText = `
      position: fixed !important;
      top: 10px !important;
      right: 10px !important;
      background: ${color} !important;
      color: white !important;
      padding: 12px 16px !important;
      z-index: ${this.config.UI.Z_INDEX} !important;
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
      font-weight: bold !important;
      border: 2px solid white !important;
      border-radius: 6px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
      max-width: 300px !important;
      word-wrap: break-word !important;
    `;

    indicator.textContent = message;
    return indicator;
  }

  /**
   * Create persistent counter element
   */
  createCounterElement() {
    const counter = document.createElement("div");
    counter.id = "autogreen-counter";

    counter.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      background: ${this.config.UI.COLORS.COUNTER_BG} !important;
      color: white !important;
      padding: 10px 15px !important;
      z-index: ${this.config.UI.Z_INDEX} !important;
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
      font-weight: bold !important;
      border-radius: 20px !important;
      border: 2px solid ${this.config.UI.COLORS.SUCCESS} !important;
    `;

    return counter;
  }

  /**
   * Get color based on indicator type
   */
  getColorForType(type) {
    const colorMap = {
      success: this.config.UI.COLORS.SUCCESS,
      info: this.config.UI.COLORS.INFO,
      warning: this.config.UI.COLORS.WARNING,
      error: this.config.UI.COLORS.ERROR,
    };

    return colorMap[type] || this.config.UI.COLORS.INFO;
  }

  /**
   * Remove a specific indicator
   */
  removeIndicator(key) {
    const indicator = this.indicators.get(key);
    if (indicator?.parentNode) {
      indicator.remove();
      this.indicators.delete(key);
    }
  }

  /**
   * Clean up all UI elements
   */
  cleanup() {
    this.indicators.forEach((indicator) => {
      if (indicator.parentNode) {
        indicator.remove();
      }
    });
    this.indicators.clear();
  }
}

// Make UIManager available globally
if (typeof window !== "undefined") {
  window.AutoGreenUIManager = UIManager;
}
