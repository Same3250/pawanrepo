import { Locator, Page } from "@playwright/test";

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly productHeading: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.productHeading = page.getByRole("heading", { level: 1 });
    this.quantityInput = page.locator("#input-quantity");
    this.addToCartButton = page.getByRole("button", {
      name: "Add to Cart",
      exact: true,
    });
  }

  /**
   * Checks whether the requested product detail page is displayed.
   * @param productName - Expected product name
   * @returns Promise<boolean> - true if the product heading matches
   */
  async isProductPageExists(productName: string): Promise<boolean> {
    return (await this.productHeading.innerText()) === productName;
  }

  /**
   * Reads the displayed product price.
   * @param price - Expected displayed price
   * @returns Promise<string> - Displayed product price
   */
  async getDisplayedPrice(price: string): Promise<string> {
    return this.page
      .getByRole("heading", { name: price, exact: true })
      .innerText();
  }

  /**
   * Sets the requested product quantity.
   * @param quantity - Quantity to add
   * @returns Promise<void>
   */
  async setQuantity(quantity: string): Promise<void> {
    await this.quantityInput.fill(quantity);
  }

  /**
   * Adds the selected product to the shopping cart.
   * @returns Promise<void>
   */
  async addToCart(): Promise<void> {
    try {
      await this.addToCartButton.click();
    } catch (error) {
      console.log(`Error adding product to cart: ${error}`);
      throw error;
    }
  }
}
