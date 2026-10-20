# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\workflows.spec.ts >> FakeStore API CRUD Workflows >> POST / PUT / DELETE - User workflow @master @regression @api
- Location: tests\api\workflows.spec.ts:52:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 11
Received: undefined
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | import dotenv from "dotenv";
  3   | import { Routes } from "../../api/endpoints/routes";
  4   | import { RandomDataUtil } from "../../utils/dataGenerator";
  5   | 
  6   | dotenv.config();
  7   | 
  8   | test.describe("FakeStore API CRUD Workflows", () => {
  9   |   const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  10  |   const USER_ID = Number(process.env.USER_ID ?? 1);
  11  | 
  12  |   // ---------------------------------------------------------
  13  |   // Product CRUD Workflow
  14  |   // ---------------------------------------------------------
  15  | 
  16  |   test("POST / PUT / DELETE - Product workflow @master @regression @api", async ({
  17  |     request,
  18  |   }) => {
  19  |     const createPayload = RandomDataUtil.generateProductPayload();
  20  |     const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
  21  |       data: createPayload,
  22  |     });
  23  |     expect(createResponse.status(), "Product creation should return status 201").toBe(201);
  24  | 
  25  |     const created = await createResponse.json();
  26  |     expect(created.id, "Created product should include an ID").toEqual(expect.any(Number));
  27  | 
  28  |     const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
  29  |     const updateRoute = Routes.UPDATE_PRODUCT.replace("{id}", String(created.id));
  30  |     const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
  31  |       data: updatePayload,
  32  |     });
  33  |     expect(updateResponse.status(), "Product update should return status 200").toBe(200);
  34  | 
  35  |     const updated = await updateResponse.json();
  36  |     expect(updated.id).toBe(created.id);
  37  |     expect(updated.title).toBe(updatePayload.title);
  38  |     expect(updated.price).toBe(updatePayload.price);
  39  |     expect(updated.description).toBe(updatePayload.description);
  40  |     expect(updated.image).toBe(updatePayload.image);
  41  |     expect(updated.category).toBe(updatePayload.category);
  42  | 
  43  |     const deleteRoute = Routes.DELETE_PRODUCT.replace("{id}", String(created.id));
  44  |     const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
  45  |     expect(deleteResponse.status(), "Product deletion should return status 200").toBe(200);
  46  |   });
  47  | 
  48  |   // ---------------------------------------------------------
  49  |   // User CRUD Workflow
  50  |   // ---------------------------------------------------------
  51  | 
  52  |   test("POST / PUT / DELETE - User workflow @master @regression @api", async ({
  53  |     request,
  54  |   }) => {
  55  |     const createPayload = RandomDataUtil.generateUserPayload();
  56  |     const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
  57  |       data: createPayload,
  58  |     });
  59  |     expect(createResponse.status(), "User creation should return status 201").toBe(201);
  60  | 
  61  |     const created = await createResponse.json();
  62  |     expect(created.id, "Created user should include an ID").toEqual(expect.any(Number));
  63  | 
  64  |     const updatePayload = RandomDataUtil.generateUserUpdatePayload();
  65  |     const updateRoute = Routes.UPDATE_USER.replace("{id}", String(created.id));
  66  |     const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
  67  |       data: updatePayload,
  68  |     });
  69  |     expect(updateResponse.status(), "User update should return status 200").toBe(200);
  70  | 
  71  |     const updated = await updateResponse.json();
> 72  |     expect(updated.id).toBe(created.id);
      |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  73  |     expect(updated.email).toBe(updatePayload.email);
  74  |     expect(updated.username).toBe(updatePayload.username);
  75  |     expect(updated.name).toEqual(updatePayload.name);
  76  |     expect(updated.address).toEqual(updatePayload.address);
  77  |     expect(updated.phone).toBe(updatePayload.phone);
  78  | 
  79  |     const deleteRoute = Routes.DELETE_USER.replace("{id}", String(created.id));
  80  |     const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
  81  |     expect(deleteResponse.status(), "User deletion should return status 200").toBe(200);
  82  |   });
  83  | 
  84  |   // ---------------------------------------------------------
  85  |   // Cart CRUD Workflow
  86  |   // ---------------------------------------------------------
  87  | 
  88  |   test("POST / PUT / DELETE - Cart workflow @master @regression @api", async ({
  89  |     request,
  90  |   }) => {
  91  |     const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
  92  |     const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
  93  |       data: createPayload,
  94  |     });
  95  |     expect(createResponse.status(), "Cart creation should return status 201").toBe(201);
  96  | 
  97  |     const created = await createResponse.json();
  98  |     expect(created.id, "Created cart should include an ID").toEqual(expect.any(Number));
  99  |     expect(created.userId).toBe(createPayload.userId);
  100 |     expect(created.products).toEqual(createPayload.products);
  101 | 
  102 |     const updatePayload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
  103 |     const originalQuantity = createPayload.products[0].quantity;
  104 |     updatePayload.products[0].quantity =
  105 |       originalQuantity === 999 ? originalQuantity - 1 : originalQuantity + 1;
  106 |     const updateRoute = Routes.UPDATE_CART.replace("{id}", String(created.id));
  107 |     const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
  108 |       data: updatePayload,
  109 |     });
  110 |     expect(updateResponse.status(), "Cart update should return status 200").toBe(200);
  111 | 
  112 |     const updated = await updateResponse.json();
  113 |     expect(updated.id).toBe(created.id);
  114 |     expect(updated.userId).toBe(updatePayload.userId);
  115 |     expect(updated.products[0].quantity).toBe(updatePayload.products[0].quantity);
  116 |     expect(updated.products[0].quantity).not.toBe(originalQuantity);
  117 | 
  118 |     const deleteRoute = Routes.DELETE_CART.replace("{id}", String(created.id));
  119 |     const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
  120 |     expect(deleteResponse.status(), "Cart deletion should return status 200").toBe(200);
  121 |   });
  122 | });
  123 | 
```