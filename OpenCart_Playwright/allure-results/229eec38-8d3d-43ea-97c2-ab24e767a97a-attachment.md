# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: db\customer-registration-db.spec.ts >> Register customer and verify admin and database records @master @regression @end-to-end @db
- Location: tests\db\customer-registration-db.spec.ts:17:5

# Error details

```
Error: The registered customer should appear in the admin list.

expect(received).toContain(expected) // indexOf

Expected substring: "Hollis01792491127838@gmail.com"
Received string:    "	Dorthy Willms	hollis01792491127838@gmail.com	Default	20/10/2026	"
```

# Test source

```ts
  1   | import { RowDataPacket } from "mysql2";
  2   | import dotenv from "dotenv";
  3   | import { test, expect } from "../../fixtures/pageFixtures";
  4   | import { RandomDataUtil } from "../../utils/dataGenerator";
  5   | import { executeQuery } from "../../utils/dbClient";
  6   | 
  7   | dotenv.config();
  8   | 
  9   | interface CustomerRecord extends RowDataPacket {
  10  |   firstname: string;
  11  |   lastname: string;
  12  |   email: string;
  13  |   status: number;
  14  |   date_added: Date;
  15  | }
  16  | 
  17  | test(
  18  |   "Register customer and verify admin and database records @master @regression @end-to-end @db",
  19  |   async ({
  20  |     adminCustomerPage,
  21  |     homePage,
  22  |     page,
  23  |     registerPage,
  24  |   }) => {
  25  |     test.setTimeout(120000);
  26  | 
  27  |     const appUrl = process.env.WEB_APP_URL;
  28  |     const adminUsername = process.env.ADMIN_USERNAME;
  29  |     const adminPassword = process.env.ADMIN_PASSWORD;
  30  | 
  31  |     if (!appUrl || !adminUsername || !adminPassword) {
  32  |       throw new Error(
  33  |         "WEB_APP_URL, ADMIN_USERNAME, and ADMIN_PASSWORD must be configured.",
  34  |       );
  35  |     }
  36  | 
  37  |     const firstName = RandomDataUtil.getFirstName();
  38  |     const lastName = RandomDataUtil.getLastName();
  39  |     const email = RandomDataUtil.getEmail().replace("@", `${Date.now()}@`);
  40  |     const password = `${RandomDataUtil.getPassword(9).replace(/[^a-zA-Z0-9]/g, "x")}A1!`;
  41  |     let cleanupRequired = false;
  42  | 
  43  |     try {
  44  |       await test.step("Register a dynamically generated customer", async () => {
  45  |         expect(await homePage.isHomePageExists()).toBeTruthy();
  46  |         await homePage.openRegistrationPage();
  47  |         await expect(
  48  |           page.getByRole("heading", { name: "Register Account" }),
  49  |         ).toBeVisible();
  50  | 
  51  |         cleanupRequired = true;
  52  |         await registerPage.register(firstName, lastName, email, password);
  53  | 
  54  |         await expect(
  55  |           page.getByRole("heading", {
  56  |             name: "Your Account Has Been Created!",
  57  |             exact: true,
  58  |           }),
  59  |         ).toBeVisible();
  60  |       });
  61  | 
  62  |       await test.step("Find and verify the customer in the admin portal", async () => {
  63  |         const adminUrl = new URL("admin/index.php", appUrl).toString();
  64  |         await adminCustomerPage.login(
  65  |           adminUrl,
  66  |           adminUsername,
  67  |           adminPassword,
  68  |         );
  69  |         await adminCustomerPage.openCustomerList();
  70  |         await adminCustomerPage.filterByEmail(email);
  71  | 
  72  |         const customerListRow =
  73  |           await adminCustomerPage.getCustomerListDetails(email);
  74  |         expect(
  75  |           customerListRow,
  76  |           "The registered customer should appear in the admin list.",
> 77  |         ).toContain(email);
      |           ^ Error: The registered customer should appear in the admin list.
  78  |         expect(customerListRow).toContain(firstName);
  79  |         expect(customerListRow).toContain(lastName);
  80  | 
  81  |         await adminCustomerPage.openCustomerDetails(email);
  82  |         const customerDetails =
  83  |           await adminCustomerPage.getCustomerDetails();
  84  |         expect(customerDetails.firstName).toBe(firstName);
  85  |         expect(customerDetails.lastName).toBe(lastName);
  86  |         expect(customerDetails.email).toBe(email);
  87  |         expect(customerDetails.enabled).toBeTruthy();
  88  |       });
  89  | 
  90  |       await test.step("Verify the registered customer in MySQL", async () => {
  91  |         const customers = (await executeQuery(
  92  |           "SELECT firstname, lastname, email, status, date_added FROM oc_customer WHERE email = ?",
  93  |           [email],
  94  |         )) as CustomerRecord[];
  95  | 
  96  |         expect(
  97  |           customers,
  98  |           "Exactly one database record should match the registered email.",
  99  |         ).toHaveLength(1);
  100 |         expect(customers[0].firstname).toBe(firstName);
  101 |         expect(customers[0].lastname).toBe(lastName);
  102 |         expect(customers[0].email).toBe(email);
  103 |         expect(customers[0].status).toBe(1);
  104 |         expect(customers[0].date_added).toBeTruthy();
  105 |       });
  106 |     } finally {
  107 |       if (cleanupRequired) {
  108 |         await executeQuery("DELETE FROM oc_customer WHERE email = ?", [email]);
  109 |       }
  110 |     }
  111 |   },
  112 | );
  113 | 
```