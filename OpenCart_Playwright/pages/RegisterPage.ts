import { Locator, Page } from "@playwright/test";

export class RegisterPage {
  private readonly page: Page;

  // Locators
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly privacyAgreement: Locator;
  private readonly continueButton: Locator;
  private readonly successHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.firstNameInput = page.getByPlaceholder("First Name");
    this.lastNameInput = page.getByPlaceholder("Last Name");
    this.emailInput = page.getByPlaceholder("E-Mail");
    this.passwordInput = page.getByPlaceholder("Password", { exact: true });
    this.privacyAgreement = page.locator('input[name="agree"]');
    this.continueButton = page.getByRole("button", { name: "Continue" });
    this.successHeading = page.getByRole("heading", {
      name: "Your Account Has Been Created!",
      exact: true,
    });
  }

  /**
   * Registers a new customer.
   * @param firstName - Customer first name
   * @param lastName - Customer last name
   * @param email - Unique customer email
   * @param password - Customer password
   * @returns Promise<void>
   */
  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.privacyAgreement.check();
    await Promise.all([
      this.page.waitForURL(/route=account\/success/),
      this.continueButton.click(),
    ]);
  }

  /**
   * Checks whether registration completed successfully.
   * @returns Promise<boolean> - true if the success heading is displayed
   */
  async isRegistrationSuccessful(): Promise<boolean> {
    return this.successHeading.isVisible();
  }
}
