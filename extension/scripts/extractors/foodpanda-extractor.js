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

  // ================================================
  // 📍 PAGE DETECTION & VALIDATION
  // ================================================

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

  // ================================================
  // 🍴 CUTLERY DETECTION & MONITORING
  // ================================================

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

      // Determine if eco-friendly option is active based on the subtitle text
      // "No cutlery provided. Thanks for reducing waste!" = eco-friendly
      // "If available, your order will come with cutlery" = not eco-friendly
      const isEcoFriendly = subtitleText.toLowerCase().includes('no cutlery provided') || 
                           subtitleText.toLowerCase().includes('thanks for reducing waste');


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
      
      // Store the choice for later use on review page
      this.storeCutleryChoice(status);
      
      if (callback && typeof callback === 'function') {
        callback(status);
      }
    };

    checkbox.addEventListener('change', handleToggle);
    
    // Store initial status
    const initialStatus = this.checkCutleryStatus();
    this.storeCutleryChoice(initialStatus);
    
    this.logger?.log("Started monitoring cutlery toggle");
    
    // Return cleanup function
    return () => {
      checkbox.removeEventListener('change', handleToggle);
      this.logger?.log("Stopped monitoring cutlery toggle");
    };
  }

  /**
   * Store cutlery choice for later use on review page
   */
  static storeCutleryChoice(cutleryStatus) {
    try {
      const choiceData = {
        found: cutleryStatus.found,
        enabled: cutleryStatus.enabled,
        timestamp: Date.now(),
        url: window.location.href
      };
      
      // Store in session storage (survives page navigation)
      sessionStorage.setItem('autogreen_cutlery_choice', JSON.stringify(choiceData));
      
      // Also store globally for immediate access
      window.autoGreenCutleryChoice = choiceData;
      
      this.logger?.log('💾 Cutlery choice stored:', choiceData);
    } catch (error) {
      this.logger?.error('Error storing cutlery choice:', error);
    }
  }

  /**
   * Get stored cutlery choice from cart page
   */
  static getStoredCutleryChoice() {
    try {
      // First try global variable
      if (window.autoGreenCutleryChoice) {
        const choice = window.autoGreenCutleryChoice;
        // Check if choice is recent (within last 10 minutes)
        if (Date.now() - choice.timestamp < 10 * 60 * 1000) {
          return choice;
        }
      }
      
      // Then try session storage
      const stored = sessionStorage.getItem('autogreen_cutlery_choice');
      if (stored) {
        const choice = JSON.parse(stored);
        // Check if choice is recent (within last 10 minutes)
        if (Date.now() - choice.timestamp < 10 * 60 * 1000) {
          window.autoGreenCutleryChoice = choice; // Cache it
          return choice;
        } else {
          // Clear old choice
          this.clearStoredCutleryChoice();
        }
      }
      
      return null;
    } catch (error) {
      this.logger?.error('Error getting stored cutlery choice:', error);
      return null;
    }
  }

  /**
   * Clear stored cutlery choice
   */
  static clearStoredCutleryChoice() {
    try {
      sessionStorage.removeItem('autogreen_cutlery_choice');
      window.autoGreenCutleryChoice = null;
      this.logger?.log('🗑️ Cleared old cutlery choice');
    } catch (error) {
      this.logger?.error('Error clearing stored cutlery choice:', error);
    }
  }

  // ================================================
  // 💾 CAMPAIGN DECISION STORAGE & PERSISTENCE
  // ================================================

  /**
   * Store campaign decision with 24-hour expiry
   */
  static storeCampaignDecision(decision) {
    try {
      const decisionData = {
        decision: decision, // 'joined' or 'skipped'
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      };
      
      localStorage.setItem('autogreen_campaign_decision', JSON.stringify(decisionData));
      this.logger?.log('💾 Campaign decision stored for 24 hours:', decisionData);
    } catch (error) {
      this.logger?.error('Error storing campaign decision:', error);
    }
  }

  /**
   * Get stored campaign decision (with expiry check)
   */
  static getCampaignDecision() {
    try {
      const stored = localStorage.getItem('autogreen_campaign_decision');
      
      if (stored) {
        const data = JSON.parse(stored);
        
        // Check if decision has expired (24 hours)
        if (data.expiresAt && Date.now() > data.expiresAt) {
          this.logger?.log('⏰ Campaign decision expired, removing...');
          localStorage.removeItem('autogreen_campaign_decision');
          return null;
        }
        
        this.logger?.log('📖 Retrieved valid campaign decision:', data);
        return data;
      }
      
      return null;
    } catch (error) {
      this.logger?.error('Error getting campaign decision:', error);
      return null;
    }
  }

  /**
   * Check if we should show campaign modal
   */
  static shouldShowCampaign() {
    const decision = this.getCampaignDecision();
    if (decision) {
      this.logger?.log('❌ Campaign already decided this session:', decision.decision);
      return false;
    }
    return true;
  }

  /**
   * Clear campaign decision (for testing or reset)
   */
  static clearCampaignDecision() {
    try {
      localStorage.removeItem('autogreen_campaign_decision');
      this.logger?.log('🗑️ Campaign decision cleared');
    } catch (error) {
      this.logger?.error('Error clearing campaign decision:', error);
    }
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

  /**
   * Check if an element or its parents is a Place Order button
   */
  static isPlaceOrderElement(element) {
    let currentElement = element;
    
    // Traverse up the DOM tree to find button or matching element
    while (currentElement && currentElement !== document.body) {
      try {
        // Check for button with Place Order text
        if (currentElement.tagName === 'BUTTON') {
          const text = currentElement.textContent?.toLowerCase().trim();
          
          // Use the improved text detection
          if (this.isActualPlaceOrderButton(text)) {
            return true;
          }
          
          // Check for FoodPanda specific classes on confirmed place order buttons
          if (currentElement.querySelector('.bds-c-btn__idle-content')) {
            // Additional check: make sure it's not a review/payment button
            if (this.isActualPlaceOrderButton(text)) {
              return true;
            }
          }
        }
        
        // Check for specific FoodPanda classes, but validate text
        if (currentElement.classList) {
          if (currentElement.classList.contains('bds-c-btn__idle-content__label') ||
              currentElement.classList.contains('bds-c-btn__idle-content')) {
            
            // Find parent button and check its text
            let parentButton = currentElement;
            while (parentButton && parentButton.tagName !== 'BUTTON') {
              parentButton = parentButton.parentElement;
            }
            
            if (parentButton) {
              const buttonText = parentButton.textContent?.toLowerCase().trim();
              if (this.isActualPlaceOrderButton(buttonText)) {
                return true;
              }
            }
          }
        }
        
        // Check data attributes
        if (currentElement.getAttribute) {
          const testId = currentElement.getAttribute('data-testid');
          if (testId && testId.includes('place-order')) {
            // Double-check with text content
            const text = currentElement.textContent?.toLowerCase().trim();
            if (this.isActualPlaceOrderButton(text)) {
              return true;
            }
          }
        }
        
      } catch (e) {
        // Continue traversing on any error
      }
      
      currentElement = currentElement.parentElement;
    }
    
    return false;
  }

  // ================================================
  // 🎯 CAMPAIGN MONITORING & ORDER DETECTION
  // ================================================

  /**
   * Monitor for "Place Order" button clicks and trigger campaign modal
   */
  static setupCampaignMonitoring() {
    try {
      this.logger?.log('Setting up FoodPanda campaign monitoring...');
      
      // Monitor for Place Order button
      const placeOrderSelectors = [
        'button[data-testid="place-order"]',
        'button[data-testid="place-order-button"]', 
        '[data-testid*="place-order"]',
        '[data-testid*="checkout-place-order"]',
        '.place-order-btn',
        '.checkout-place-order',
        // New selectors based on actual FoodPanda structure
        '.bds-c-btn__idle-content__label',
        '.bds-c-btn__idle-content'
      ];

      // Use event delegation to catch dynamically added buttons
      document.addEventListener('click', (event) => {
        const target = event.target;
        
        // Check if clicked element or its parents match place order selectors
        const isPlaceOrderButton = this.isPlaceOrderElement(target);

        if (isPlaceOrderButton) {
          this.logger?.log('Place Order button clicked, checking for campaign eligibility...');
          this.handlePlaceOrderClick(event);
        }
      }, true); // Use capture phase to catch early

      // Also monitor for URL changes to checkout/payment pages
      this.monitorCheckoutPageChanges();

    } catch (error) {
      this.logger?.error('Error setting up campaign monitoring:', error);
    }
  }

  /**
   * Handle Place Order button click
   */
  static handlePlaceOrderClick(event) {
    try {
      // Check if we're already processing an order to prevent loops
      if (this.isProcessingOrder) {
        this.logger?.log('⏭️ Order already being processed, skipping...');
        return;
      }

      this.logger?.log('=== PLACE ORDER BUTTON CLICKED ===');
      
      // Check if this is actually a place order button (not review/payment)
      const target = event.target;
      const buttonText = this.getButtonText(target);
      this.logger?.log('Button text detected:', buttonText);
      
      // Only proceed if it's actually "Place order" button
      if (!this.isActualPlaceOrderButton(buttonText)) {
        this.logger?.log('❌ Not a place order button, ignoring:', buttonText);
        return;
      }
      
      // Check stored cutlery choice from cart page (not current page)
      const storedChoice = this.getStoredCutleryChoice();
      this.logger?.log('Stored cutlery choice from cart page:', storedChoice);
      
      // Also check current page as fallback
      const currentStatus = this.checkCutleryStatus();
      this.logger?.log('Current page cutlery status:', currentStatus);
      
      // Use stored choice if available, otherwise fall back to current
      const cutleryChoice = storedChoice || currentStatus;
      
      // Check if user has already made a campaign decision this session
      if (!this.shouldShowCampaign()) {
        this.logger?.log('🏁 User already made campaign decision this session, allowing normal order placement');
        // Allow normal order placement without showing campaign modal
        return;
      }
      
      if (cutleryChoice && cutleryChoice.found && !cutleryChoice.enabled) {
        this.logger?.log('✅ User made eco-friendly choice (no cutlery), preventing navigation and showing campaign modal...');
        
        // Set processing flag to prevent loops
        this.isProcessingOrder = true;
        
        // PREVENT PAGE NAVIGATION until campaign is complete
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Store the original event target for later use
        this.originalOrderButton = target;
        this.originalOrderEvent = event;
        
        // Show campaign modal immediately
        this.showCampaignModal();
      } else {
        this.logger?.log('❌ Campaign not triggered - cutlery selected or not found', {
          storedChoice,
          currentStatus,
          finalChoice: cutleryChoice
        });
        // Allow normal navigation for non-eco users
      }
    } catch (error) {
      this.logger?.error('Error handling place order click:', error);
    }
  }

  /**
   * Get button text from element or its parents
   */
  static getButtonText(element) {
    let currentElement = element;
    
    while (currentElement && currentElement !== document.body) {
      if (currentElement.tagName === 'BUTTON') {
        return currentElement.textContent?.toLowerCase().trim() || '';
      }
      currentElement = currentElement.parentElement;
    }
    
    return element.textContent?.toLowerCase().trim() || '';
  }

  /**
   * Check if this is actually a place order button
   */
  static isActualPlaceOrderButton(buttonText) {
    const placeOrderTexts = [
      'place order',
      'place order now',
      'confirm order',
      'submit order'
    ];
    
    const reviewTexts = [
      'review',
      'payment',
      'address',
      'checkout',
      'continue',
      'next',
      'proceed'
    ];
    
    // Must contain place order text
    const hasPlaceOrderText = placeOrderTexts.some(text => buttonText.includes(text));
    
    // Must NOT contain review/payment text
    const hasReviewText = reviewTexts.some(text => buttonText.includes(text));
    
    return hasPlaceOrderText && !hasReviewText;
  }

  /**
   * Monitor for checkout page changes
   */
  static monitorCheckoutPageChanges() {
    let lastUrl = window.location.href;
    
    const checkUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        
        this.logger?.log('🔄 Page navigation detected:', {
          from: lastUrl,
          to: currentUrl
        });
        
        // Check if we're on a payment/checkout page (where Place Order appears)
        if (currentUrl.includes('checkout') || currentUrl.includes('payment') || currentUrl.includes('review')) {
          this.logger?.log('📋 Review/checkout page detected, setting up place order monitoring...');
          
          // Load stored cutlery choice from previous page
          const storedChoice = this.getStoredCutleryChoice();
          if (storedChoice) {
            this.logger?.log('✅ Using stored cutlery choice:', storedChoice);
          } else {
            this.logger?.log('⚠️ No stored cutlery choice found');
          }
          
          // Wait for page to load, then set up monitoring
          setTimeout(() => {
            this.setupPlaceOrderButtonMonitoring();
          }, 2000);
        }
        
        // If we're on cart page, ensure cutlery monitoring is active
        if (currentUrl.includes('cart') || currentUrl.includes('basket')) {
          this.logger?.log('🛒 Cart page detected, ensuring cutlery monitoring...');
          setTimeout(() => {
            // Re-check and store cutlery status
            const cutleryStatus = this.checkCutleryStatus();
            if (cutleryStatus.found) {
              this.storeCutleryChoice(cutleryStatus);
            }
          }, 1000);
        }
      }
    };

    // Check URL changes periodically
    setInterval(checkUrlChange, 1000);
    
    // Also use MutationObserver for SPA navigation
    const observer = new MutationObserver(checkUrlChange);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Set up specific monitoring for place order button
   */
  static setupPlaceOrderButtonMonitoring() {
    // Look for place order button specifically
    const checkForPlaceOrderButton = () => {
      // Find all buttons and check their content
      const allButtons = document.querySelectorAll('button');
      allButtons.forEach(button => {
        if (!button.hasAttribute('data-autogreen-monitored')) {
          const text = button.textContent?.toLowerCase().trim();
          const hasPlaceOrderText = text.includes('place order');
          const hasFoodPandaClass = button.querySelector('.bds-c-btn__idle-content');
          
          if (hasPlaceOrderText || hasFoodPandaClass) {
            button.setAttribute('data-autogreen-monitored', 'true');
            
            button.addEventListener('click', (event) => {
              this.handlePlaceOrderClick(event);
            });
            
            this.logger?.debug('Added campaign monitoring to place order button:', text);
          }
        }
      });
      
      // Also check elements with FoodPanda-specific classes
      const fpElements = document.querySelectorAll('.bds-c-btn__idle-content, .bds-c-btn__idle-content__label');
      fpElements.forEach(element => {
        if (!element.hasAttribute('data-autogreen-monitored')) {
          element.setAttribute('data-autogreen-monitored', 'true');
          
          element.addEventListener('click', (event) => {
            this.handlePlaceOrderClick(event);
          });
          
          this.logger?.debug('Added campaign monitoring to FoodPanda element');
        }
      });
    };

    // Check immediately and then periodically
    checkForPlaceOrderButton();
    const intervalId = setInterval(checkForPlaceOrderButton, 2000);
    
    // Store interval ID for cleanup
    this.placeOrderMonitoringInterval = intervalId;
  }

  // ================================================
  // 🎨 CAMPAIGN MODAL UI & USER INTERACTION
  // ================================================

  /**
   * Show campaign participation modal
   */
  static showCampaignModal() {
    try {
      // Create modal HTML
      const modalHtml = `
        <div id="autogreen-campaign-modal" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 999999;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: Arial, sans-serif;
        ">
          <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: autogreen-modal-appear 0.3s ease-out;
          ">
            <div style="font-size: 48px; margin-bottom: 15px;">🌱</div>
            <h2 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 24px;">Join Our Green Campaign!</h2>
            <p style="color: #666; margin: 0 0 20px 0; line-height: 1.4;">
              Thank you for choosing no cutlery! Would you like to join our neighbourhood green campaign and earn points for your eco-friendly choices?
            </p>
            <p style="color: #888; margin: 0 0 20px 0; font-size: 12px;">
              Your order will continue after this quick step.
            </p>
            <div style="margin: 20px 0;">
              <button id="autogreen-join-campaign" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin: 0 10px;
                transition: background 0.3s;
              ">Yes, Join Campaign!</button>
              <button id="autogreen-skip-campaign" style="
                background: #ccc;
                color: #666;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin: 0 10px;
                transition: background 0.3s;
              ">Maybe Later</button>
            </div>
          </div>
        </div>
        <style>
          @keyframes autogreen-modal-appear {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          #autogreen-join-campaign:hover {
            background: #45A049 !important;
          }
          #autogreen-skip-campaign:hover {
            background: #bbb !important;
          }
        </style>
      `;

      // Add modal to page
      document.body.insertAdjacentHTML('beforeend', modalHtml);

      // Set up event listeners
      document.getElementById('autogreen-join-campaign').addEventListener('click', () => {
        this.handleJoinCampaign();
      });

      document.getElementById('autogreen-skip-campaign').addEventListener('click', () => {
        this.handleSkipCampaign();
      });

      // Close on backdrop click - but continue order
      document.getElementById('autogreen-campaign-modal').addEventListener('click', (e) => {
        if (e.target.id === 'autogreen-campaign-modal') {
          this.handleSkipCampaign();
        }
      });

      this.logger?.log('Campaign modal displayed');

    } catch (error) {
      this.logger?.error('Error showing campaign modal:', error);
    }
  }

  /**
   * Handle user joining the campaign
   */
  static handleJoinCampaign() {
    try {
      // Close initial modal
      this.closeCampaignModal();
      
      // Show postal code input modal
      setTimeout(() => {
        this.showPostalCodeModal();
      }, 300);

    } catch (error) {
      this.logger?.error('Error handling join campaign:', error);
    }
  }

  /**
   * Handle user skipping the campaign
   */
  static handleSkipCampaign() {
    try {
      this.logger?.log('🔄 User skipped campaign, proceeding with order...');
      
      // Store campaign decision to prevent re-asking
      this.storeCampaignDecision('skipped');
      
      this.closeCampaignModal();
      
      // Continue with original order placement
      this.proceedWithOriginalOrder();
      
    } catch (error) {
      this.logger?.error('Error handling skip campaign:', error);
      // Always clear processing flag on error
      this.isProcessingOrder = false;
    }
  }

  /**
   * Proceed with the original order after campaign interaction
   */
  static proceedWithOriginalOrder() {
    try {
      if (this.originalOrderButton) {
        this.logger?.log('🚀 Proceeding with original order...');
        
        const button = this.originalOrderButton;
        
        // Clear processing flag first
        this.isProcessingOrder = false;
        
        // Remove our monitoring to prevent re-triggering
        button.removeAttribute('data-autogreen-monitored');
        
        // Remove our event listener temporarily
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Click the new button (without our event listeners)
        setTimeout(() => {
          newButton.click();
        }, 100);
        
        // Clear stored references
        this.originalOrderButton = null;
        this.originalOrderEvent = null;
      } else {
        // If no stored button, just clear the processing flag
        this.isProcessingOrder = false;
        this.logger?.log('No stored button found, clearing processing flag');
      }
    } catch (error) {
      this.logger?.error('Error proceeding with original order:', error);
      // Always clear processing flag on error
      this.isProcessingOrder = false;
    }
  }

  /**
   * Show postal code input modal
   */
  static showPostalCodeModal() {
    try {
      const postalModalHtml = `
        <div id="autogreen-postal-modal" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 999999;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: Arial, sans-serif;
        ">
          <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: autogreen-modal-appear 0.3s ease-out;
          ">
            <div style="font-size: 48px; margin-bottom: 15px;">📍</div>
            <h2 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 22px;">Your Neighbourhood</h2>
            <p style="color: #666; margin: 0 0 20px 0; line-height: 1.4;">
              Enter the first 2 digits of your postal code to join your neighbourhood's green initiative:
            </p>
            <div style="margin: 20px 0;">
              <input 
                type="text" 
                id="autogreen-postal-input" 
                placeholder="e.g. 12" 
                maxlength="2"
                style="
                  padding: 12px;
                  border: 2px solid #ddd;
                  border-radius: 8px;
                  font-size: 18px;
                  text-align: center;
                  width: 80px;
                  margin: 0 10px;
                "
              />
            </div>
            <div style="margin: 20px 0;">
              <button id="autogreen-submit-postal" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin: 0 10px;
                transition: background 0.3s;
              ">Submit</button>
              <button id="autogreen-cancel-postal" style="
                background: #ccc;
                color: #666;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin: 0 10px;
                transition: background 0.3s;
              ">Cancel</button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', postalModalHtml);

      const input = document.getElementById('autogreen-postal-input');
      const submitBtn = document.getElementById('autogreen-submit-postal');
      const cancelBtn = document.getElementById('autogreen-cancel-postal');

      // Focus input
      input.focus();

      // Only allow numbers
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
      });

      // Submit on Enter
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.length === 2) {
          this.handlePostalCodeSubmit(input.value);
        }
      });

      submitBtn.addEventListener('click', () => {
        const postalCode = input.value.trim();
        if (postalCode.length === 2) {
          this.handlePostalCodeSubmit(postalCode);
        } else {
          input.style.borderColor = '#f44336';
          setTimeout(() => {
            input.style.borderColor = '#ddd';
          }, 2000);
        }
      });

      cancelBtn.addEventListener('click', () => {
        this.closePostalCodeModal();
        this.proceedWithOriginalOrder();
      });

      // Close on backdrop click and proceed
      document.getElementById('autogreen-postal-modal').addEventListener('click', (e) => {
        if (e.target.id === 'autogreen-postal-modal') {
          this.closePostalCodeModal();
          this.proceedWithOriginalOrder();
        }
      });

    } catch (error) {
      this.logger?.error('Error showing postal code modal:', error);
    }
  }

  /**
   * Handle postal code submission
   */
  static async handlePostalCodeSubmit(postalCode) {
    try {
      this.closePostalCodeModal();
      
      // Store campaign decision to prevent re-asking
      this.storeCampaignDecision('joined');
      
      // Generate UUID
      const uuid = this.generateUUID();
      
      // Store campaign data
      const campaignData = {
        uuid: uuid,
        postalCode: postalCode,
        timestamp: Date.now(),
        action: 'no_cutlery',
        points: 1
      };

      this.logger?.log('Campaign data generated:', campaignData);

      // Make API call and handle response
      const apiResult = await this.submitCampaignData(campaignData);

      // Show success modal with API response info
      setTimeout(() => {
        this.showSuccessModal(postalCode, apiResult);
      }, 500);

    } catch (error) {
      this.logger?.error('Error handling postal code submit:', error);
      
      // Even if there's an error, continue with the order
      this.proceedWithOriginalOrder();
    }
  }

  // ================================================
  // 📊 DATABASE INTEGRATION & API CALLS
  // ================================================

  /**
   * Submit campaign data to API
   */
  static async submitCampaignData(campaignData) {
    try {
      // 🔧 CONFIGURE YOUR DATABASE API ENDPOINT HERE
      const apiEndpoint = 'http://localhost:3000/api/users';
      // Alternative examples:
      // const apiEndpoint = 'https://your-backend.herokuapp.com/api/users';
      // const apiEndpoint = 'https://autogreen.sg/api/users'; // for production
      
      this.logger?.log('📊 Submitting campaign data to database...', campaignData);
      
      // Transform campaign data to match your API structure
      const apiData = {
        userId: campaignData.uuid,           // Use UUID as userId
        sectorCode: campaignData.postalCode, // Use postalCode as sectorCode
        points: campaignData.points          // Points earned (1)
      };
      
      this.logger?.log('� Transformed data for API:', apiData);
      
      // For now, just store locally and log
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const storageKey = `autogreen_campaign_${campaignData.uuid}`;
        chrome.storage.local.set({
          [storageKey]: campaignData
        }, () => {
          this.logger?.log('✅ Campaign data stored locally:', storageKey);
        });
        
        // Also store in a campaigns list for easy retrieval
        chrome.storage.local.get(['autogreen_campaigns'], (result) => {
          const campaigns = result.autogreen_campaigns || [];
          campaigns.push(campaignData);
          chrome.storage.local.set({ autogreen_campaigns: campaigns });
        });
      } else {
        this.logger?.warn('Chrome storage not available, storing in localStorage');
        localStorage.setItem(`autogreen_campaign_${campaignData.uuid}`, JSON.stringify(campaignData));
      }

      // 🔥 ACTUAL DATABASE API CALL - MATCHES YOUR /api/users ENDPOINT
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(apiData)  // Send transformed data
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Database API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        this.logger?.log('🎯 Campaign data successfully saved to database!', result);
        
        // Return the result for any additional processing
        return { success: true, data: result };

      } catch (apiError) {
        this.logger?.error('❌ Failed to save to database:', apiError);
        
        // Fallback: At least we have local storage
        this.logger?.log('📝 Data preserved in local storage as fallback');
        return { success: false, error: apiError.message, localStored: true };
      }

      this.logger?.log('🎯 Campaign participation complete - data stored successfully!');

    } catch (error) {
      this.logger?.error('❌ Error submitting campaign data:', error);
    }
  }

  /**
   * Show success modal with points earned
   */
  static showSuccessModal(postalCode, apiResult = null) {
    try {
      const isApiSuccess = apiResult && apiResult.success;
      const statusMessage = isApiSuccess 
        ? "Successfully saved to database! 🎯" 
        : "Saved locally (will sync later) 📝";
        
      const successModalHtml = `
        <div id="autogreen-success-modal" style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 999999;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: Arial, sans-serif;
        ">
          <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: autogreen-modal-appear 0.3s ease-out;
          ">
            <div style="font-size: 64px; margin-bottom: 15px;">🎉</div>
            <h2 style="color: #4CAF50; margin: 0 0 15px 0; font-size: 24px;">Congratulations!</h2>
            <p style="color: #666; margin: 0 0 20px 0; line-height: 1.4; font-size: 18px;">
              <strong style="color: #4CAF50;">+1 point</strong> added to you and your neighbourhood <strong>${postalCode}xx</strong>!
            </p>
            <p style="color: #888; margin: 0 0 15px 0; font-size: 14px;">
              Thank you for making an eco-friendly choice. Every small action counts towards a greener Singapore! 🇸🇬
            </p>
            <p style="color: #666; margin: 0 0 20px 0; font-size: 12px; opacity: 0.8;">
              ${statusMessage}
            </p>
            <button id="autogreen-close-success" style="
              background: #4CAF50;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: bold;
              cursor: pointer;
              transition: background 0.3s;
            ">Awesome!</button>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', successModalHtml);

      document.getElementById('autogreen-close-success').addEventListener('click', () => {
        this.closeSuccessModal();
        this.proceedWithOriginalOrder();
      });

      // Auto-close after 3 seconds and proceed with order
      setTimeout(() => {
        this.closeSuccessModal();
        this.proceedWithOriginalOrder();
      }, 3000);

      // Close on backdrop click and proceed
      document.getElementById('autogreen-success-modal').addEventListener('click', (e) => {
        if (e.target.id === 'autogreen-success-modal') {
          this.closeSuccessModal();
          this.proceedWithOriginalOrder();
        }
      });

      this.logger?.log('Success modal displayed');

    } catch (error) {
      this.logger?.error('Error showing success modal:', error);
    }
  }

  // ================================================
  // 🔧 UTILITY FUNCTIONS & HELPERS
  // ================================================

  /**
   * Generate a random UUID
   */
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Close campaign modal
   */
  static closeCampaignModal() {
    const modal = document.getElementById('autogreen-campaign-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Close postal code modal
   */
  static closePostalCodeModal() {
    const modal = document.getElementById('autogreen-postal-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Close success modal
   */
  static closeSuccessModal() {
    const modal = document.getElementById('autogreen-success-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Cleanup campaign monitoring
   */
  static cleanupCampaignMonitoring() {
    if (this.placeOrderMonitoringInterval) {
      clearInterval(this.placeOrderMonitoringInterval);
      this.placeOrderMonitoringInterval = null;
    }
    
    // Reset processing state
    this.isProcessingOrder = false;
    this.originalOrderButton = null;
    this.originalOrderEvent = null;
    
    // Clear campaign decision for new session (optional - comment out if you want decisions to persist longer)
    // this.clearCampaignDecision();
    
    this.logger?.log('🧹 Campaign monitoring cleaned up');
  }

  /**
   * Reset processing state (emergency cleanup)
   */
  static resetProcessingState() {
    this.isProcessingOrder = false;
    this.originalOrderButton = null;
    this.originalOrderEvent = null;
    this.logger?.log('🔄 Processing state reset');
  }
}

// ================================================
// 🌐 GLOBAL EXPORTS & TESTING UTILITIES
// ================================================

// Make available globally
if (typeof window !== "undefined") {
  window.AutoGreenFoodPandaExtractor = AutoGreenFoodPandaExtractor;
  
  // 🧪 Testing utility: Clear campaign decision
  window.clearAutoGreenCampaign = () => {
    if (window.AutoGreenFoodPandaExtractor) {
      window.AutoGreenFoodPandaExtractor.clearCampaignDecision();
      console.log('✅ AutoGreen campaign decision cleared! Campaign will show again on next eco-friendly order.');
      console.log('💡 This decision normally persists for 24 hours across tabs and browser restarts.');
    } else {
      console.log('❌ AutoGreen extension not found.');
    }
  };
}
