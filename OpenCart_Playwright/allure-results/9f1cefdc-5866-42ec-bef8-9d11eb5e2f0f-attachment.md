# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\auth.spec.ts >> FakeStore Authentication API Tests >> POST - Successful login @master @sanity @api
- Location: tests\api\auth.spec.ts:17:7

# Error details

```
Error: Valid login should return status 201

expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 401
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import dotenv from "dotenv";
  3  | import { Routes } from "../../api/endpoints/routes";
  4  | import { RandomDataUtil } from "../../utils/dataGenerator";
  5  | 
  6  | dotenv.config();
  7  | 
  8  | test.describe("FakeStore Authentication API Tests", () => {
  9  |   const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  10 |   const USERNAME = process.env.USERNAME || "";
  11 |   const PASSWORD = process.env.PASSWORD || "";
  12 | 
  13 |   // ---------------------------------------------------------
  14 |   // POST - Authentication
  15 |   // ---------------------------------------------------------
  16 | 
  17 |   test("POST - Successful login @master @sanity @api", async ({ request }) => {
  18 |     const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
  19 |       data: { username: USERNAME, password: PASSWORD },
  20 |     });
> 21 |     expect(response.status(), "Valid login should return status 201").toBe(201);
     |                                                                       ^ Error: Valid login should return status 201
  22 | 
  23 |     const responseBody = await response.json();
  24 |     expect(responseBody.token, "Login response should include a token").toEqual(
  25 |       expect.any(String),
  26 |     );
  27 |     expect(responseBody.token.trim(), "Authentication token should not be empty").not.toBe("");
  28 |   });
  29 | 
  30 |   test("POST - Invalid login @master @regression @api", async ({ request }) => {
  31 |     const payload = RandomDataUtil.generateInvalidLoginPayload();
  32 |     const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
  33 |       data: payload,
  34 |     });
  35 |     expect(response.status(), "Invalid login should return status 401").toBe(401);
  36 | 
  37 |     const responseBody = await response.text();
  38 |     expect(
  39 |       responseBody.trim(),
  40 |       "Invalid login should return the documented error message",
  41 |     ).toBe("username or password is incorrect");
  42 |   });
  43 | });
  44 | 
```