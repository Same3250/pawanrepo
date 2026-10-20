import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { Helper } from "../../utils/helper";

test(
  "Complete customer shopping journey @master @sanity @regression @web",
  async ({
    accountPage,
    cartPage,
    homePage,
    loginPage,
    page,
    productPage,
    productSearchPage,
    registerPage,
  }) => {
    test.setTimeout(90000);

    const { productName, productQuantity, totalPrice } =
      Helper.getProductDetails();
    const firstName = RandomDataUtil.getFirstName();
    const lastName = RandomDataUtil.getLastName();
    const email = RandomDataUtil.getEmail().replace("@", `${Date.now()}@`);
    const password = `${RandomDataUtil.getPassword(9).replace(/[^a-zA-Z0-9]/g, "x")}A1!`;
    const pageErrors: string[] = [];

    page.on("pageerror", (error) => pageErrors.push(error.message));

    await test.step("1) Open the application", async () => {
      expect(await homePage.isHomePageExists()).toBeTruthy();
    });

    await test.step("2) Register a new customer with unique data", async () => {
      await homePage.openRegistrationPage();
      await registerPage.register(firstName, lastName, email, password);
    });

    await test.step("3) Verify successful registration", async () => {
      expect(await registerPage.isRegistrationSuccessful()).toBeTruthy();
    });

    await test.step("4) Log out of the new customer account", async () => {
      await accountPage.logout();
    });

    await test.step("5) Log in with the newly created credentials", async () => {
      await homePage.openLoginPage();
      await loginPage.login(email, password);
    });

    await test.step("6) Verify successful authentication", async () => {
      expect(await accountPage.isAccountPageExists()).toBeTruthy();
    });

    await test.step("7) Search for the known product", async () => {
      await homePage.searchForProduct(productName);
      await expect(
        page.getByRole("heading", { name: `Search - ${productName}` }),
      ).toBeVisible();
      await expect(
        page
          .getByRole("heading", { name: productName, exact: true })
          .getByRole("link"),
      ).toBeVisible();
    });

    await test.step("8) Open the product details page", async () => {
      await productSearchPage.openProduct(productName);
      expect(await productPage.isProductPageExists(productName)).toBeTruthy();
      expect(await productPage.getDisplayedPrice(totalPrice)).toBe(totalPrice);
    });

    await test.step("9) Add the product to the cart", async () => {
      await productPage.setQuantity(productQuantity);
      await productPage.addToCart();
      await expect(page.locator(".alert-success")).toContainText(
        `Success: You have added ${productName} to your shopping cart!`,
      );
    });

    await test.step("10) Open the shopping cart", async () => {
      await cartPage.openShoppingCart();
      await expect(
        page.getByRole("heading", { name: /Shopping Cart/ }),
      ).toBeVisible();
    });

    await test.step("11) Verify the correct product", async () => {
      expect(await cartPage.isProductInCart(productName)).toBeTruthy();
    });

    await test.step("12) Verify the product quantity", async () => {
      expect(await cartPage.getProductQuantity(productName)).toBe(
        productQuantity,
      );
    });

    await test.step("13) Verify the product price", async () => {
      expect(await cartPage.getProductUnitPrice(productName)).toBe(totalPrice);
      expect(await cartPage.getProductLineTotal(productName)).toBe(totalPrice);
    });

    await test.step("14) Verify the applicable cart total", async () => {
      expect(await cartPage.getGrandTotal()).toBe(totalPrice);
    });

    await test.step("15) Verify the journey completed without page errors", async () => {
      expect(pageErrors).toEqual([]);
    });

    console.log("✅ Completed customer registration, login, and shopping journey.");
  },
);
