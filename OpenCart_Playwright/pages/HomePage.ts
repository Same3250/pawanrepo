import { Locator, Page } from "@playwright/test";

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly accountMenu: Locator;
  private readonly registerLink: Locator;
  private readonly loginLink: Locator;
  private readonly searchInput: Locator;
  private readonly featuredHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.accountMenu = page.getByRole("button", { name: "My Account" });
    this.registerLink = page.getByRole("link", { name: "Register", exact: true });
    this.loginLink = page.getByRole("link", { name: "Login", exact: true });
    this.searchInput = page.getByPlaceholder("Search");
    this.featuredHeading = page.getByRole("heading", {
      name: "Featured",
      exact: true,
    });
  }

  /**
   * Checks whether the store home page is displayed.
   * @returns Promise<boolean> - true if the home page is displayed
   */
  async isHomePageExists(): Promise<boolean> {
    return this.featuredHeading.isVisible();
  }

  /**
   * Opens the customer registration page.
   * @returns Promise<void>
   */
  async openRegistrationPage(): Promise<void> {
    await this.accountMenu.click();
    await this.registerLink.first().click();
  }

  /**
   * Opens the customer login page.
   * @returns Promise<void>
   */
  async openLoginPage(): Promise<void> {
    await this.accountMenu.click();
    await this.loginLink.first().click();
  }

  /**
   * Searches the product catalog.
   * @param productName - Product name to search for
   * @returns Promise<void>
   */
  async searchForProduct(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await Promise.all([
      this.page.waitForURL(/route=product\/search/),
      this.searchInput.press("Enter"),
    ]);
  }
}
