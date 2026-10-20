import { Locator, Page } from "@playwright/test";

export class ProductSearchPage {
  private readonly page: Page;

  // Locators
  private readonly searchHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.searchHeading = page.getByRole("heading", { name: /^Search - / });
  }

  /**
   * Opens a product from the search results.
   * @param productName - Product name to open
   * @returns Promise<void>
   */
  async openProduct(productName: string): Promise<void> {
    await this.searchHeading.waitFor({ state: "visible" });
    await Promise.all([
      this.page.waitForURL(/route=product\/product/),
      this.page
        .getByRole("heading", { name: productName, exact: true })
        .getByRole("link")
        .click(),
    ]);
  }
}
