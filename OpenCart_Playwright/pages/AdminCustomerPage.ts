import { Locator, Page } from "@playwright/test";

export type AdminCustomerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
};

export class AdminCustomerPage {
  private readonly page: Page;

  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly securityNotice: Locator;
  private readonly customersMenu: Locator;
  private readonly emailFilter: Locator;
  private readonly filterButton: Locator;
  private readonly statusCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.usernameInput = page.getByRole("textbox", { name: "Username" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
    this.securityNotice = page.locator("#modal-security");
    this.customersMenu = page.getByRole("link", { name: /Customers/ });
    this.emailFilter = page.getByRole("textbox", { name: "E-Mail" });
    this.filterButton = page.getByRole("button", { name: "Filter" });
    this.statusCheckbox = page.locator("#input-status");
  }

  /**
   * Opens the admin portal and signs in.
   * @param adminUrl - Admin portal URL
   * @param username - Configured admin username
   * @param password - Configured admin password
   * @returns Promise<void>
   */
  async login(adminUrl: string, username: string, password: string): Promise<void> {
    await this.page.goto(adminUrl);
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.page.waitForURL(/route=common\/dashboard/),
      this.loginButton.click(),
    ]);

    if (await this.securityNotice.isVisible()) {
      await this.securityNotice.getByRole("button").first().click();
    }
  }

  /**
   * Navigates to the admin customer list.
   * @returns Promise<void>
   */
  async openCustomerList(): Promise<void> {
    await this.customersMenu.first().click();
    const customerListLink = this.customersMenu.last();
    await Promise.all([
      this.page.waitForURL(/route=customer\/customer(?:&|$)/, {
        waitUntil: "domcontentloaded",
      }),
      customerListLink.click(),
    ]);
  }

  /**
   * Filters the admin customer list by email.
   * @param email - Customer email to search
   * @returns Promise<void>
   */
  async filterByEmail(email: string): Promise<void> {
    await this.emailFilter.fill(email);
    await this.filterButton.click();
  }

  /**
   * Reads the matching row from the customer list.
   * @param email - Customer email to locate
   * @returns Promise<AdminCustomerListDetails | null> - Matching row or null
   */
  async getCustomerListDetails(email: string): Promise<string> {
    const row = this.customerRow(email);
    await row.waitFor({ state: "visible" });
    return row.innerText();
  }

  /**
   * Opens the matching customer record.
   * @param email - Customer email to open
   * @returns Promise<void>
   */
  async openCustomerDetails(email: string): Promise<void> {
    const row = this.customerRow(email);
    await Promise.all([
      this.page.waitForURL(/route=customer\/customer\.form/),
      row.getByRole("link", { name: "Edit" }).click(),
    ]);
  }

  /**
   * Reads customer fields and status from the admin record.
   * @returns Promise<AdminCustomerDetails> - Displayed admin customer details
   */
  async getCustomerDetails(): Promise<AdminCustomerDetails> {
    return {
      firstName: await this.page.getByLabel("First Name").inputValue(),
      lastName: await this.page.getByLabel("Last Name").inputValue(),
      email: await this.page.getByLabel("E-Mail").inputValue(),
      enabled: await this.statusCheckbox.isChecked(),
    };
  }

  private customerRow(email: string): Locator {
    return this.page.getByRole("row").filter({ hasText: email });
  }
}
