# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\customer-shopping-journey.spec.ts >> Complete customer shopping journey @master @sanity @regression @web
- Location: tests\web\customer-shopping-journey.spec.ts:5:5

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: page.waitForURL: Target page, context or browser has been closed
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Test source

```ts
  1  | import { Locator, Page } from "@playwright/test";
  2  | 
  3  | export class LoginPage {
  4  |   private readonly page: Page;
  5  | 
  6  |   // Locators
  7  |   private readonly emailInput: Locator;
  8  |   private readonly passwordInput: Locator;
  9  |   private readonly loginButton: Locator;
  10 | 
  11 |   constructor(page: Page) {
  12 |     this.page = page;
  13 | 
  14 |     // Initialize locators with CSS selectors
  15 |     this.emailInput = page.getByPlaceholder("E-Mail Address");
  16 |     this.passwordInput = page.getByPlaceholder("Password", { exact: true });
  17 |     this.loginButton = page.getByRole("button", { name: "Login", exact: true });
  18 |   }
  19 | 
  20 |   /**
  21 |    * Signs in with the supplied customer credentials.
  22 |    * @param email - Customer email
  23 |    * @param password - Customer password
  24 |    * @returns Promise<void>
  25 |    */
  26 |   async login(email: string, password: string): Promise<void> {
  27 |     await this.emailInput.fill(email);
  28 |     await this.passwordInput.fill(password);
  29 |     await Promise.all([
> 30 |       this.page.waitForURL(/route=account\/account/),
     |                 ^ Error: page.waitForURL: Target page, context or browser has been closed
  31 |       this.loginButton.click(),
  32 |     ]);
  33 |   }
  34 | }
  35 | 
```