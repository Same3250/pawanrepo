# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\customer-shopping-journey.spec.ts >> Complete customer shopping journey @master @sanity @regression @web
- Location: tests\web\customer-shopping-journey.spec.ts:5:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: net::ERR_ABORTED; maybe frame was detached?
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Test source

```ts
  1  | import { Locator, Page } from "@playwright/test";
  2  | 
  3  | export class HomePage {
  4  |   private readonly page: Page;
  5  | 
  6  |   // Locators
  7  |   private readonly accountMenu: Locator;
  8  |   private readonly registerLink: Locator;
  9  |   private readonly loginLink: Locator;
  10 |   private readonly searchInput: Locator;
  11 |   private readonly featuredHeading: Locator;
  12 | 
  13 |   constructor(page: Page) {
  14 |     this.page = page;
  15 | 
  16 |     // Initialize locators with CSS selectors
  17 |     this.accountMenu = page.getByRole("button", { name: "My Account" });
  18 |     this.registerLink = page.getByRole("link", { name: "Register", exact: true });
  19 |     this.loginLink = page.getByRole("link", { name: "Login", exact: true });
  20 |     this.searchInput = page.getByPlaceholder("Search");
  21 |     this.featuredHeading = page.getByRole("heading", {
  22 |       name: "Featured",
  23 |       exact: true,
  24 |     });
  25 |   }
  26 | 
  27 |   /**
  28 |    * Checks whether the store home page is displayed.
  29 |    * @returns Promise<boolean> - true if the home page is displayed
  30 |    */
  31 |   async isHomePageExists(): Promise<boolean> {
  32 |     return this.featuredHeading.isVisible();
  33 |   }
  34 | 
  35 |   /**
  36 |    * Opens the customer registration page.
  37 |    * @returns Promise<void>
  38 |    */
  39 |   async openRegistrationPage(): Promise<void> {
  40 |     await this.accountMenu.click();
  41 |     await this.registerLink.first().click();
  42 |   }
  43 | 
  44 |   /**
  45 |    * Opens the customer login page.
  46 |    * @returns Promise<void>
  47 |    */
  48 |   async openLoginPage(): Promise<void> {
  49 |     await this.accountMenu.click();
  50 |     await this.loginLink.first().click();
  51 |   }
  52 | 
  53 |   /**
  54 |    * Searches the product catalog.
  55 |    * @param productName - Product name to search for
  56 |    * @returns Promise<void>
  57 |    */
  58 |   async searchForProduct(productName: string): Promise<void> {
  59 |     await this.searchInput.fill(productName);
  60 |     await Promise.all([
> 61 |       this.page.waitForURL(/route=product\/search/),
     |                 ^ Error: page.waitForURL: net::ERR_ABORTED; maybe frame was detached?
  62 |       this.searchInput.press("Enter"),
  63 |     ]);
  64 |   }
  65 | }
  66 | 
```