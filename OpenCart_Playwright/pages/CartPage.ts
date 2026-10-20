import { Locator, Page } from "@playwright/test";

export class CartPage {
  private readonly page: Page;

  // Locators
  private readonly shoppingCartLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.shoppingCartLink = page.getByRole("link", {
      name: "Shopping Cart",
      exact: true,
    });
  }

  private productRow(productName: string): Locator {
    return this.page.getByRole("row").filter({ hasText: productName });
  }

  /**
   * Opens the shopping cart page.
   * @returns Promise<void>
   */
  async openShoppingCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  /**
   * Checks whether the requested product is in the cart.
   * @param productName - Product name to find
   * @returns Promise<boolean> - true if the cart row is visible
   */
  async isProductInCart(productName: string): Promise<boolean> {
    return this.productRow(productName).isVisible();
  }

  /**
   * Reads the cart quantity for a product.
   * @param productName - Product name in the cart
   * @returns Promise<string> - Cart quantity
   */
  async getProductQuantity(productName: string): Promise<string> {
    return this.productRow(productName)
      .locator('input[name="quantity"]')
      .inputValue();
  }

  /**
   * Reads the unit price for a product.
   * @param productName - Product name in the cart
   * @returns Promise<string> - Displayed unit price
   */
  async getProductUnitPrice(productName: string): Promise<string> {
    return this.productRow(productName).getByRole("cell").nth(3).innerText();
  }

  /**
   * Reads the line total for a product.
   * @param productName - Product name in the cart
   * @returns Promise<string> - Displayed line total
   */
  async getProductLineTotal(productName: string): Promise<string> {
    return this.productRow(productName).getByRole("cell").nth(4).innerText();
  }

  /**
   * Reads the cart grand total.
   * @returns Promise<string> - Displayed cart total
   */
  async getGrandTotal(): Promise<string> {
    return this.page
      .getByRole("row", { name: /^Total \$/ })
      .getByRole("cell")
      .nth(1)
      .innerText();
  }
}
