import { RowDataPacket } from "mysql2";
import dotenv from "dotenv";
import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { executeQuery } from "../../utils/dbClient";

dotenv.config();

interface CustomerRecord extends RowDataPacket {
  firstname: string;
  lastname: string;
  email: string;
  status: number;
  date_added: Date;
}

test(
  "Register customer and verify admin and database records @master @regression @end-to-end @db",
  async ({
    adminCustomerPage,
    homePage,
    page,
    registerPage,
  }) => {
    test.setTimeout(120000);

    const appUrl = process.env.WEB_APP_URL;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!appUrl || !adminUsername || !adminPassword) {
      throw new Error(
        "WEB_APP_URL, ADMIN_USERNAME, and ADMIN_PASSWORD must be configured.",
      );
    }

    const firstName = RandomDataUtil.getFirstName();
    const lastName = RandomDataUtil.getLastName();
    const email = RandomDataUtil.getEmail()
      .toLowerCase()
      .replace("@", `${Date.now()}@`);
    const password = `${RandomDataUtil.getPassword(9).replace(/[^a-zA-Z0-9]/g, "x")}A1!`;
    let cleanupRequired = false;

    try {
      await test.step("Register a dynamically generated customer", async () => {
        expect(await homePage.isHomePageExists()).toBeTruthy();
        await homePage.openRegistrationPage();
        await expect(
          page.getByRole("heading", { name: "Register Account" }),
        ).toBeVisible();

        cleanupRequired = true;
        await registerPage.register(firstName, lastName, email, password);

        await expect(
          page.getByRole("heading", {
            name: "Your Account Has Been Created!",
            exact: true,
          }),
        ).toBeVisible();
      });

      await test.step("Find and verify the customer in the admin portal", async () => {
        const adminUrl = new URL("admin/index.php", appUrl).toString();
        await adminCustomerPage.login(
          adminUrl,
          adminUsername,
          adminPassword,
        );
        await adminCustomerPage.openCustomerList();
        await adminCustomerPage.filterByEmail(email);

        const customerListRow =
          await adminCustomerPage.getCustomerListDetails(email);
        expect(
          customerListRow,
          "The registered customer should appear in the admin list.",
        ).toContain(email);
        expect(customerListRow).toContain(firstName);
        expect(customerListRow).toContain(lastName);

        await adminCustomerPage.openCustomerDetails(email);
        const customerDetails =
          await adminCustomerPage.getCustomerDetails();
        expect(customerDetails.firstName).toBe(firstName);
        expect(customerDetails.lastName).toBe(lastName);
        expect(customerDetails.email).toBe(email);
        expect(customerDetails.enabled).toBeTruthy();
      });

      await test.step("Verify the registered customer in MySQL", async () => {
        const customers = (await executeQuery(
          "SELECT firstname, lastname, email, status, date_added FROM oc_customer WHERE email = ?",
          [email],
        )) as CustomerRecord[];

        expect(
          customers,
          "Exactly one database record should match the registered email.",
        ).toHaveLength(1);
        expect(customers[0].firstname).toBe(firstName);
        expect(customers[0].lastname).toBe(lastName);
        expect(customers[0].email).toBe(email);
        expect(customers[0].status).toBe(1);
        expect(customers[0].date_added).toBeTruthy();
      });
    } finally {
      if (cleanupRequired) {
        await executeQuery("DELETE FROM oc_customer WHERE email = ?", [email]);
      }
    }
  },
);
