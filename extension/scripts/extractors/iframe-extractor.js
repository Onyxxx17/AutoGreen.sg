/**
 * AutoGreen.sg Extension - Iframe Extractor
 *
 * Handles iframe creation and management for secure content extraction
 *
 * @author AutoGreen Team
 * @version 1.0.0
 */

class AutoGreenIframeExtractor {
  static config = window.AutoGreenConfig;
  static logger = window.AutoGreenLogger;

  /**
   * Create hidden iframe to load product page with improved reliability
   */
  static async createHiddenIframe(url) {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.style.cssText = `
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        width: 1200px !important;
        height: 800px !important;
        visibility: hidden !important;
        opacity: 0 !important;
        border: none !important;
        pointer-events: none !important;
      `;

      // Add sandbox attributes for security but allow necessary permissions
      iframe.setAttribute(
        "sandbox",
        "allow-same-origin allow-scripts allow-forms allow-popups"
      );

      let loadTimeout;
      let isResolved = false;
      let loadCheckInterval;
      let checkCount = 0;
      const maxChecks = 8; // Reduced from 10 for faster response
      const checkInterval = 750; // Optimized timing

      const cleanup = () => {
        if (loadTimeout) {
          clearTimeout(loadTimeout);
        }
        if (loadCheckInterval) {
          clearInterval(loadCheckInterval);
        }
      };

      const resolveIframe = () => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          AutoGreenIframeExtractor.logger?.log(
            `Iframe successfully loaded: ${url}`
          );
          // Reduced wait time for dynamic content
          setTimeout(() => resolve(iframe), 2000); // Reduced from 5000ms
        }
      };

      const rejectIframe = (error) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          AutoGreenIframeExtractor.removeIframe(iframe);
          reject(error);
        }
      };

      // Enhanced page readiness check with multiple strategies
      const checkPageReady = () => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc) {
            AutoGreenIframeExtractor.logger?.debug("Document not accessible");
            return false;
          }

          // Strategy 1: Basic content check
          const bodyText = doc.body?.textContent || "";
          const hasBasicContent = bodyText.length > 150; // Lowered threshold

          // Strategy 2: DOM readiness
          const readyState = doc.readyState === "complete";

          // Strategy 3: Specific e-commerce content indicators
          const ecommerceSelectors = [
            ".pdp-block",
            "#module_product_detail",
            ".pdp-product-detail",
            ".product-detail",
            ".product-info",
            ".item-detail",
            "[data-spm*='product']",
            ".product-title",
            ".price-section",
          ];

          const hasEcommerceElements = ecommerceSelectors.some((selector) =>
            doc.querySelector(selector)
          );

          // Strategy 4: Text-based content indicators
          const contentKeywords = [
            "product",
            "price",
            "description",
            "add to cart",
            "buy now",
            "rating",
          ];
          const lowerBodyText = bodyText.toLowerCase();
          const hasContentKeywords = contentKeywords.some((keyword) =>
            lowerBodyText.includes(keyword)
          );

          // Strategy 5: Check for substantial DOM structure
          const hasSubstantialDOM = doc.querySelectorAll("*").length > 50;

          // Calculate readiness score
          let readinessScore = 0;
          if (hasBasicContent) readinessScore += 2;
          if (readyState) readinessScore += 3;
          if (hasEcommerceElements) readinessScore += 3;
          if (hasContentKeywords) readinessScore += 1;
          if (hasSubstantialDOM) readinessScore += 1;

          const isReady = readinessScore >= 6; // Threshold for considering page ready

          AutoGreenIframeExtractor.logger?.debug(
            `Page readiness: score=${readinessScore}/10, ready=${isReady} (content=${hasBasicContent}, dom=${readyState}, ecommerce=${hasEcommerceElements})`
          );

          return isReady;
        } catch (error) {
          AutoGreenIframeExtractor.logger?.error(
            "Error checking page readiness:",
            error
          );
          return false;
        }
      };

      iframe.onload = () => {
        AutoGreenIframeExtractor.logger?.debug(
          `Iframe onload triggered for: ${url}`
        );

        // Initial quick check after onload
        setTimeout(() => {
          if (checkPageReady()) {
            AutoGreenIframeExtractor.logger?.log(
              `Page ready immediately after load`
            );
            resolveIframe();
            return;
          }

          // Start periodic checking if not ready immediately
          loadCheckInterval = setInterval(() => {
            checkCount++;
            AutoGreenIframeExtractor.logger?.debug(
              `Page readiness check ${checkCount}/${maxChecks}`
            );

            if (checkPageReady()) {
              AutoGreenIframeExtractor.logger?.log(
                `Page ready after ${checkCount} checks`
              );
              resolveIframe();
            } else if (checkCount >= maxChecks) {
              AutoGreenIframeExtractor.logger?.warn(
                `Page not fully ready after ${maxChecks} checks (${
                  (checkCount * checkInterval) / 1000
                }s), proceeding with available content`
              );
              resolveIframe();
            }
          }, checkInterval);
        }, 500); // Short delay to let initial rendering complete
      };

      iframe.onerror = (event) => {
        AutoGreenIframeExtractor.logger?.error("Iframe load error:", event);
        rejectIframe(new Error("Failed to load product page - network error"));
      };

      // Optimized timeout for better user experience
      loadTimeout = setTimeout(() => {
        AutoGreenIframeExtractor.logger?.warn(
          `Timeout loading iframe after 12 seconds: ${url}`
        );
        rejectIframe(
          new Error(
            "Page loading timeout - site may be slow or blocking requests"
          )
        );
      }, 12000); // Reduced from 15 seconds to 12 seconds

      // Try to load the URL with better error handling
      try {
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        document.body.appendChild(iframe);
        iframe.src = url;

        AutoGreenIframeExtractor.logger?.log(`Starting to load: ${url}`);
      } catch (error) {
        rejectIframe(new Error(`Failed to set iframe src: ${error.message}`));
      }
    });
  }

  /**
   * Remove iframe from DOM
   */
  static removeIframe(iframe) {
    try {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
        AutoGreenIframeExtractor.logger?.debug("Iframe removed from DOM");
      }
    } catch (error) {
      AutoGreenIframeExtractor.logger?.error("Error removing iframe:", error);
    }
  }

  /**
   * Check if iframe content is accessible
   */
  static isIframeAccessible(iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      return !!doc;
    } catch (error) {
      AutoGreenIframeExtractor.logger?.debug(
        "Iframe not accessible:",
        error.message
      );
      return false;
    }
  }

  /**
   * Get iframe document safely
   */
  static getIframeDocument(iframe) {
    try {
      if (!AutoGreenIframeExtractor.isIframeAccessible(iframe)) {
        return null;
      }
      return iframe.contentDocument || iframe.contentWindow.document;
    } catch (error) {
      AutoGreenIframeExtractor.logger?.error(
        "Error getting iframe document:",
        error
      );
      return null;
    }
  }

  /**
   * Debug iframe content for troubleshooting
   */
  static debugIframeContent(iframe) {
    try {
      const doc = AutoGreenIframeExtractor.getIframeDocument(iframe);
      if (!doc) {
        AutoGreenIframeExtractor.logger?.warn(
          "Cannot debug iframe - document not accessible"
        );
        return null;
      }

      const debug = {
        url: iframe.src,
        readyState: doc.readyState,
        title: doc.title,
        bodyLength: doc.body?.textContent?.length || 0,
        elementCount: doc.querySelectorAll("*").length,
        hasProductElements: !!(
          doc.querySelector(".pdp-block") ||
          doc.querySelector("#module_product_detail") ||
          doc.querySelector(".product-detail")
        ),
        bodyPreview: doc.body?.textContent?.substring(0, 200) || "",
      };

      AutoGreenIframeExtractor.logger?.debug("Iframe content debug:", debug);
      return debug;
    } catch (error) {
      AutoGreenIframeExtractor.logger?.error(
        "Error debugging iframe content:",
        error
      );
      return null;
    }
  }
}

// Make available globally
if (typeof window !== "undefined") {
  window.AutoGreenIframeExtractor = AutoGreenIframeExtractor;
}
