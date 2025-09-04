/**
 * AutoGreen.sg Extension - FoodPanda Extractor
 * 
 * Handles extraction of eco-friendly settings from FoodPanda pages
 * 
 * @author AutoGreen Team
 * @version 1.0.0
 */

class AutoGreenFoodPandaExtractor {
  static config = window.AutoGreenConfig;
  static logger = window.AutoGreenLogger;

  /**
   * Check if the current page is a FoodPanda page
   */
  static isFoodPandaPage(url = window.location.href) {
    return this.config?.URL_PATTERNS?.FOODPANDA?.DOMAIN?.test(url) || false;
  }

  /**
   * Check if we're on a cart/checkout page
   */
  static isCartOrCheckoutPage(url = window.location.href) {
    return this.config?.URL_PATTERNS?.FOODPANDA?.CART_PAGE?.test(url) || 
           document.querySelector(this.config?.SELECTORS?.FOODPANDA?.CART_CONTAINER) !== null ||
           document.querySelector(this.config?.SELECTORS?.FOODPANDA?.CHECKOUT_CONTAINER) !== null;
  }

  /**
   * Check the status of the cutlery toggle
   * @returns {Object} Status of cutlery options
   */
  static checkCutleryStatus() {
    try {
      const selectors = this.config?.SELECTORS?.FOODPANDA?.CUTLERY_TOGGLE;
      
      if (!selectors) {
        throw new Error("FoodPanda selectors not configured");
      }

      // Find the cutlery toggle container
      const container = document.querySelector(selectors.CONTAINER);
      
      if (!container) {
        this.logger?.debug("Cutlery toggle container not found");
        return {
          found: false,
          enabled: null,
          message: "Cutlery toggle not found on this page"
        };
      }

      // Find the checkbox input
      const checkbox = container.querySelector(selectors.CHECKBOX);
      
      if (!checkbox) {
        this.logger?.debug("Cutlery checkbox not found");
        return {
          found: false,
          enabled: null,
          message: "Cutlery checkbox not found"
        };
      }

      // Check if the checkbox is checked (toggled on)
      const isChecked = checkbox.checked;
      
      // Get the label text to understand what the toggle means
      const labelContainer = container.querySelector(selectors.LABEL);
      const labelText = labelContainer?.textContent?.trim() || "";
      
      // Extract the subtitle text that explains what the toggle does
      const subtitleElement = labelContainer?.querySelector('p.cl-neutral-secondary');
      const subtitleText = subtitleElement?.textContent?.trim() || "";

      // Determine if eco-friendly option is active
      // If subtitle mentions "no cutlery" and it's checked, then eco-friendly is ON
      // If subtitle mentions "add cutlery" and it's checked, then eco-friendly is OFF
      const isEcoFriendly = subtitleText.toLowerCase().includes('no cutlery') ? isChecked : !isChecked;

      this.logger?.log(`Cutlery toggle status: ${isChecked ? 'ON' : 'OFF'}, Eco-friendly: ${isEcoFriendly ? 'YES' : 'NO'}`);

      return {
        found: true,
        enabled: isChecked,
        ecoFriendly: isEcoFriendly,
        labelText: labelText,
        subtitleText: subtitleText,
        message: isEcoFriendly ? 
          "✅ Great! No cutlery selected - helping reduce waste!" : 
          "⚠️ Consider selecting 'No cutlery' to reduce waste",
        element: checkbox,
        container: container
      };

    } catch (error) {
      this.logger?.error("Error checking cutlery status:", error);
      return {
        found: false,
        enabled: null,
        error: error.message,
        message: "Error checking cutlery toggle status"
      };
    }
  }

  /**
   * Get all eco-friendly options status from the page
   */
  static getEcoFriendlyStatus() {
    const status = {
      isFoodPanda: this.isFoodPandaPage(),
      isCartPage: this.isCartOrCheckoutPage(),
      cutlery: null,
      overallScore: 0,
      recommendations: [],
      checkedAt: new Date().toISOString()
    };

    if (!status.isFoodPanda) {
      status.message = "Not a FoodPanda page";
      return status;
    }

    // Check cutlery status on any FoodPanda page (not just cart)
    status.cutlery = this.checkCutleryStatus();

    // Calculate overall eco-friendliness score
    if (status.cutlery.found && status.cutlery.ecoFriendly) {
      status.overallScore += 100; // Full points for no cutlery
    }

    // Add recommendations
    if (status.cutlery.found && !status.cutlery.ecoFriendly) {
      status.recommendations.push({
        type: "cutlery",
        message: "Consider selecting 'No cutlery' to reduce plastic waste",
        action: "Toggle the cutlery switch to OFF"
      });
    }

    // Set overall message based on findings
    if (status.cutlery.found) {
      if (status.overallScore >= 100) {
        status.message = "🌟 Excellent! You're making eco-friendly choices!";
      } else if (status.overallScore >= 50) {
        status.message = "👍 Good! You can make it even more eco-friendly.";
      } else {
        status.message = "🌱 Consider making more eco-friendly choices to help the environment.";
      }
    } else {
      status.message = "🔍 No eco-friendly options found on this page. Look for cutlery options during checkout.";
    }

    return status;
  }

  /**
   * Monitor cutlery toggle changes
   */
  static monitorCutleryToggle(callback) {
    const selectors = this.config?.SELECTORS?.FOODPANDA?.CUTLERY_TOGGLE;
    
    if (!selectors) {
      this.logger?.error("FoodPanda selectors not configured");
      return null;
    }

    const checkbox = document.querySelector(selectors.CHECKBOX);
    
    if (!checkbox) {
      this.logger?.debug("Cutlery checkbox not found for monitoring");
      return null;
    }

    // Add event listener for changes
    const handleToggle = () => {
      const status = this.checkCutleryStatus();
      this.logger?.log("Cutlery toggle changed:", status);
      
      if (callback && typeof callback === 'function') {
        callback(status);
      }
    };

    checkbox.addEventListener('change', handleToggle);
    
    this.logger?.log("Started monitoring cutlery toggle");
    
    // Return cleanup function
    return () => {
      checkbox.removeEventListener('change', handleToggle);
      this.logger?.log("Stopped monitoring cutlery toggle");
    };
  }

  /**
   * Automatically suggest eco-friendly options
   */
  static showEcoSuggestions() {
    const status = this.getEcoFriendlyStatus();
    
    if (!status.isFoodPanda) {
      return status;
    }

    // Show suggestions if there are recommendations and cutlery toggle is found
    if (status.cutlery.found && status.recommendations.length > 0 && window.AutoGreenUIManager) {
      const ui = new window.AutoGreenUIManager();
      
      status.recommendations.forEach(recommendation => {
        ui.showIndicator(
          `🌱 Eco Tip: ${recommendation.message}`,
          'info',
          5000
        );
      });
    } else if (status.cutlery.found && status.overallScore >= 100 && window.AutoGreenUIManager) {
      const ui = new window.AutoGreenUIManager();
      ui.showIndicator(
        '🌟 Great eco-friendly choices! Thank you for helping reduce waste!',
        'success',
        3000
      );
    }

    return status;
  }
}

// Make available globally
if (typeof window !== "undefined") {
  window.AutoGreenFoodPandaExtractor = AutoGreenFoodPandaExtractor;
}
