import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

test.describe("FakeStore Users API Tests", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);

  // ---------------------------------------------------------
  // GET - Users
  // ---------------------------------------------------------

  test("GET - All users @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), "User list should return status 200").toBe(200);

    const users = await response.json();
    expect(Array.isArray(users), "User response should be an array").toBe(true);
    expect(users.length, "User list should not be empty").toBeGreaterThan(0);
  });

  test("GET - User by ID @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "User lookup should return status 200").toBe(200);

    const user = await response.json();
    expect(user.id, "Returned user ID should match the requested ID").toBe(USER_ID);
  });

  test("GET - Users with limit @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USERS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Limited user list should return status 200").toBe(200);

    const users = await response.json();
    expect(Array.isArray(users), "Limited user response should be an array").toBe(true);
    expect(users.length, "User count should match the requested limit").toBe(LIMIT);
  });

  test("GET - Users sorted ascending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace("{order}", "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Ascending user sort should return status 200").toBe(200);

    const users = await response.json();
    const ids = users.map((user: { id: number }) => user.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => first - second));
  });

  test("GET - Users sorted descending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace("{order}", "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Descending user sort should return status 200").toBe(200);

    const users = await response.json();
    const ids = users.map((user: { id: number }) => user.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => second - first));
  });

  // ---------------------------------------------------------
  // POST - Create User
  // ---------------------------------------------------------

  test("POST - Create user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: payload,
    });
    expect(response.status(), "User creation should return status 201").toBe(201);

    const created = await response.json();
    expect(created.id, "Created user should include an ID").toEqual(expect.any(Number));
  });

  // ---------------------------------------------------------
  // PUT - Update User
  // ---------------------------------------------------------

  test("PUT - Update user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserUpdatePayload();
    const route = Routes.UPDATE_USER.replace("{id}", String(USER_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "User update should return status 200").toBe(200);

    const updated = await response.json();
    expect(updated.email).toBe(payload.email);
    expect(updated.username).toBe(payload.username);
    expect(updated.name).toEqual(payload.name);
    expect(updated.address).toEqual(payload.address);
    expect(updated.phone).toBe(payload.phone);
  });

  // ---------------------------------------------------------
  // DELETE - User
  // ---------------------------------------------------------

  test("DELETE - User @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_USER.replace("{id}", String(USER_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "User deletion should return status 200").toBe(200);

    const responseBody = await response.json();
    if (responseBody !== null && typeof responseBody === "object") {
      expect(responseBody.id, "Deleted user response should retain its ID").toBe(USER_ID);
    }
  });
});
