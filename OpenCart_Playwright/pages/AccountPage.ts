import { Locator, Page } from "@playwright/test";

export class AccountPage {
  private readonly page: Page;

  // Locators
  private readonly accountHeading: Locator;
  private readonly accountMenu: Locator;
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.accountHeading = page.getByRole("heading", {
      name: "My Account",
      exact: true,
    });
    this.accountMenu = page.getByRole("button", { name: "My Account" });
    this.logoutLink = page.getByRole("link", { name: "Logout", exact: true });
  }

  /**
   * Checks whether the customer account page is displayed.
   * @returns Promise<boolean> - true if the account URL and heading are displayed
   */
  async isAccountPageExists(): Promise<boolean> {
    return (
      /route=account\/account/.test(this.page.url()) &&
      (await this.accountHeading.first().isVisible())
    );
  }

  /**
   * Signs out of the current customer account.
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    try {
      await this.accountMenu.click();
      await Promise.all([
        this.page.waitForURL(/route=account\/logout/),
        this.logoutLink.first().click(),
      ]);
    } catch (error) {
      console.log(`Error logging out: ${error}`);
      throw error;
    }
  }
}
