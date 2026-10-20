import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

const env = dotenv.config();

test.describe("FakeStore Authentication API Tests", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const USERNAME = env.parsed?.USERNAME || process.env.USERNAME || "";
  const PASSWORD = env.parsed?.PASSWORD || process.env.PASSWORD || "";

  // ---------------------------------------------------------
  // POST - Authentication
  // ---------------------------------------------------------

  test("POST - Successful login @master @sanity @api", async ({ request }) => {
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: USERNAME, password: PASSWORD },
    });
    expect(response.status(), "Valid login should return status 201").toBe(201);

    const responseBody = await response.json();
    expect(responseBody.token, "Login response should include a token").toEqual(
      expect.any(String),
    );
    expect(responseBody.token.trim(), "Authentication token should not be empty").not.toBe("");
  });

  test("POST - Invalid login @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateInvalidLoginPayload();
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: payload,
    });
    expect(response.status(), "Invalid login should return status 401").toBe(401);

    const responseBody = await response.text();
    expect(
      responseBody.trim(),
      "Invalid login should return the documented error message",
    ).toBe("username or password is incorrect");
  });
});
