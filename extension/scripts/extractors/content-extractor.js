/**
 * AutoGreen.sg Extension - Content Extractor
 * 
 * Handles extraction of product details from loaded pages
 * 
 * @author AutoGreen Team
 * @version 1.0.0
 */

class AutoGreenContentExtractor {
  static config = window.AutoGreenConfig;
  static logger = window.AutoGreenLogger;

  /**
   * Extract product details from loaded iframe
   */
  static async extractProductDetails(iframe) {
    try {
      // Check if iframe is accessible
      const iframeDoc = window.AutoGreenIframeExtractor.getIframeDocument(iframe);
      
      if (!iframeDoc) {
        throw new Error("Cannot access product page due to security restrictions");
      }

      // Check if page loaded properly
      const bodyText = iframeDoc.body ? iframeDoc.body.textContent : "";
      if (bodyText.length < 100) {
        throw new Error("Page appears to be empty or blocked");
      }

      // Extract product detail container
      const detailContainer = iframeDoc.querySelector(
        this.config?.DEEP_SCAN?.SELECTORS?.LAZADA?.PRODUCT_DETAIL_CONTAINER || "#module_product_detail"
      );

      if (!detailContainer) {
        this.logger?.warn("Product detail container not found, trying alternative extraction");

        // Try alternative extraction methods
        const productDetails = this.extractAlternativeDetails(iframeDoc);
        if (productDetails) {
          return productDetails;
        }

        throw new Error("Product detail container not found");
      }

      const productDetails = {
        highlights: this.extractHighlights(detailContainer),
        ingredients: this.extractIngredients(detailContainer),
        specifications: this.extractSpecifications(detailContainer),
        extractedAt: new Date().toISOString(),
        extractionMethod: "standard",
      };

      return productDetails;
    } catch (error) {
      this.logger?.error("Failed to extract product details:", error);
      throw error;
    }
  }

  /**
   * Alternative extraction method for pages without standard structure
   */
  static extractAlternativeDetails(doc) {
    try {
      // Look for any text that might contain product information
      const textElements = doc.querySelectorAll("p, div, span, li");
      const productInfo = {
        highlights: [],
        ingredients: [],
        specifications: {},
        extractedAt: new Date().toISOString(),
        extractionMethod: "alternative",
      };

      let foundSomeInfo = false;

      textElements.forEach((element) => {
        const text = element.textContent.trim();
        const lowerText = text.toLowerCase();

        // Extract ingredients
        if (lowerText.includes("ingredient") && text.length > 20 && text.length < 500) {
          productInfo.ingredients.push(text);
          foundSomeInfo = true;
        } 
        // Extract highlights/features
        else if (
          (lowerText.includes("feature") ||
          lowerText.includes("benefit") ||
          lowerText.includes("highlight") ||
          lowerText.includes("description")) &&
          text.length > 20 && text.length < 300
        ) {
          productInfo.highlights.push(text);
          foundSomeInfo = true;
        }
        // Extract specifications
        else if (
          text.includes(":") && 
          text.length > 5 && 
          text.length < 100 &&
          (lowerText.includes("brand") || 
           lowerText.includes("weight") || 
           lowerText.includes("size") ||
           lowerText.includes("model"))
        ) {
          const [key, value] = text.split(":").map(s => s.trim());
          if (key && value) {
            productInfo.specifications[key] = value;
            foundSomeInfo = true;
          }
        }
      });

      return foundSomeInfo ? productInfo : null;
    } catch (error) {
      this.logger?.error("Alternative extraction failed:", error);
      return null;
    }
  }

  /**
   * Extract highlights from product detail
   */
  static extractHighlights(container) {
    try {
      const highlightElements = container.querySelectorAll(
        ".html-content.detail-content p, .product-highlights li, .feature-list li"
      );
      const highlights = [];

      let isHighlightSection = false;

      for (const element of highlightElements) {
        const text = element.textContent.trim();

        if (text.toLowerCase().includes("highlights") || text.toLowerCase().includes("features")) {
          isHighlightSection = true;
          continue;
        }

        if (text.toLowerCase().includes("ingredients") || text.toLowerCase().includes("specifications")) {
          isHighlightSection = false;
          continue;
        }

        if ((isHighlightSection || element.closest(".product-highlights, .feature-list")) && 
            text && text !== " " && text.length > 10) {
          highlights.push(text);
        }
      }

      return highlights.slice(0, 10); // Limit to 10 highlights
    } catch (error) {
      this.logger?.error("Failed to extract highlights:", error);
      return [];
    }
  }

  /**
   * Extract ingredients from product detail
   */
  static extractIngredients(container) {
    try {
      const ingredientElements = container.querySelectorAll(
        ".html-content.detail-content p, .ingredients-list li, .ingredient-info p"
      );
      const ingredients = [];

      let isIngredientSection = false;

      for (const element of ingredientElements) {
        const text = element.textContent.trim();

        if (text.toLowerCase().includes("ingredients")) {
          isIngredientSection = true;
          continue;
        }

        // Stop if we hit another section
        if (
          isIngredientSection &&
          text &&
          (text.toLowerCase().includes("nutrition") ||
            text.toLowerCase().includes("storage") ||
            text.toLowerCase().includes("direction") ||
            text.toLowerCase().includes("usage"))
        ) {
          break;
        }

        if ((isIngredientSection || element.closest(".ingredients-list, .ingredient-info")) && 
            text && text !== " " && text.length > 5) {
          ingredients.push(text);
        }
      }

      return ingredients.slice(0, 20); // Limit to 20 ingredients
    } catch (error) {
      this.logger?.error("Failed to extract ingredients:", error);
      return [];
    }
  }

  /**
   * Extract specifications from product detail
   */
  static extractSpecifications(container) {
    try {
      const specSelectors = [
        ".pdp-mod-spec-item",
        ".product-spec-item",
        ".specification-item",
        ".spec-row"
      ];
      
      const specifications = {};

      for (const selector of specSelectors) {
        const specItems = container.querySelectorAll(selector);
        
        specItems.forEach((item) => {
          const nameElement = item.querySelector(
            ".pdp-mod-spec-item-name, .spec-name, .spec-key, dt"
          );
          const valueElement = item.querySelector(
            ".pdp-mod-spec-item-text, .spec-value, .spec-val, dd"
          );

          if (nameElement && valueElement) {
            const name = nameElement.textContent.trim();
            const value = valueElement.textContent.trim();

            if (name && value && name.length < 50 && value.length < 200) {
              specifications[name] = value;
            }
          }
        });
      }

      // Also try table-based specifications
      const tables = container.querySelectorAll("table");
      tables.forEach(table => {
        const rows = table.querySelectorAll("tr");
        rows.forEach(row => {
          const cells = row.querySelectorAll("td, th");
          if (cells.length >= 2) {
            const key = cells[0].textContent.trim();
            const value = cells[1].textContent.trim();
            if (key && value && key.length < 50 && value.length < 200) {
              specifications[key] = value;
            }
          }
        });
      });

      return specifications;
    } catch (error) {
      this.logger?.error("Failed to extract specifications:", error);
      return {};
    }
  }

  /**
   * Extract additional product data like price, rating, etc.
   */
  static extractAdditionalData(container) {
    try {
      const additionalData = {};

      // Try to extract price
      const priceSelectors = [
        ".pdp-price",
        ".product-price",
        ".price-current",
        ".price"
      ];

      for (const selector of priceSelectors) {
        const priceElement = container.querySelector(selector);
        if (priceElement) {
          additionalData.price = priceElement.textContent.trim();
          break;
        }
      }

      // Try to extract rating
      const ratingSelectors = [
        ".score-average",
        ".product-rating",
        ".rating-score",
        ".stars"
      ];

      for (const selector of ratingSelectors) {
        const ratingElement = container.querySelector(selector);
        if (ratingElement) {
          additionalData.rating = ratingElement.textContent.trim();
          break;
        }
      }

      return additionalData;
    } catch (error) {
      this.logger?.error("Failed to extract additional data:", error);
      return {};
    }
  }
}

// Make available globally
if (typeof window !== "undefined") {
  window.AutoGreenContentExtractor = AutoGreenContentExtractor;
}
