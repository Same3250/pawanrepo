import { Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly page: Page;

  // Locators
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.emailInput = page.getByPlaceholder("E-Mail Address");
    this.passwordInput = page.getByPlaceholder("Password", { exact: true });
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
  }

  /**
   * Signs in with the supplied customer credentials.
   * @param email - Customer email
   * @param password - Customer password
   * @returns Promise<void>
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.page.waitForURL(/route=account\/account/),
      this.loginButton.click(),
    ]);
  }
}
