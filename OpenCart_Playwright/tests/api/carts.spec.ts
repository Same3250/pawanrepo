import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

test.describe("FakeStore Carts API Tests", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const CART_ID = Number(process.env.CART_ID ?? 1);
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);
  const START_DATE = process.env.START_DATE || "2019-12-10";
  const END_DATE = process.env.END_DATE || "2020-10-10";

  // ---------------------------------------------------------
  // GET - Carts
  // ---------------------------------------------------------

  test("GET - All carts @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), "Cart list should return status 200").toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), "Cart response should be an array").toBe(true);
    expect(carts.length, "Cart list should not be empty").toBeGreaterThan(0);
  });

  test("GET - Cart by ID @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Cart lookup should return status 200").toBe(200);

    const cart = await response.json();
    expect(cart.id, "Returned cart ID should match the requested ID").toBe(CART_ID);
  });

  test("GET - Carts by date range @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_BY_DATE_RANGE
      .replace("{startdate}", encodeURIComponent(START_DATE))
      .replace("{enddate}", encodeURIComponent(END_DATE));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Date-filtered carts should return status 200").toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), "Date-filtered cart response should be an array").toBe(true);
    for (const cart of carts) {
      const cartDate = new Date(cart.date).toISOString().slice(0, 10);
      expect(
        cartDate >= START_DATE,
        "Cart date should not be before the start date",
      ).toBe(true);
      expect(
        cartDate <= END_DATE,
        "Cart date should not be after the end date",
      ).toBe(true);
    }
  });

  test("GET - Carts for a user @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_USER_CART.replace("{userId}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "User carts should return status 200").toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), "User cart response should be an array").toBe(true);
    for (const cart of carts) {
      expect(cart.userId, "Each cart should belong to the requested user").toBe(USER_ID);
    }
  });

  test("GET - Carts with limit @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_CARTS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Limited cart list should return status 200").toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), "Limited cart response should be an array").toBe(true);
    expect(carts.length, "Cart count should match the requested limit").toBe(LIMIT);
  });

  test("GET - Carts sorted ascending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace("{order}", "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Ascending cart sort should return status 200").toBe(200);

    const carts = await response.json();
    const ids = carts.map((cart: { id: number }) => cart.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => first - second));
  });

  test("GET - Carts sorted descending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace("{order}", "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Descending cart sort should return status 200").toBe(200);

    const carts = await response.json();
    const ids = carts.map((cart: { id: number }) => cart.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => second - first));
  });

  // ---------------------------------------------------------
  // POST - Create Cart
  // ---------------------------------------------------------

  test("POST - Create cart @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
      data: payload,
    });
    expect(response.status(), "Cart creation should return status 201").toBe(201);

    const created = await response.json();
    expect(created.id, "Created cart should include an ID").toEqual(expect.any(Number));
    expect(created.userId).toBe(payload.userId);
    expect(created.products).toEqual(payload.products);
  });

  // ---------------------------------------------------------
  // PUT - Update Cart
  // ---------------------------------------------------------

  test("PUT - Update cart @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
    const route = Routes.UPDATE_CART.replace("{id}", String(CART_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "Cart update should return status 200").toBe(200);

    const updated = await response.json();
    expect(updated.id, "Updated cart ID should match the requested ID").toBe(CART_ID);
    expect(updated.userId).toBe(payload.userId);
    expect(updated.products).toEqual(payload.products);
  });

  // ---------------------------------------------------------
  // DELETE - Cart
  // ---------------------------------------------------------

  test("DELETE - Cart @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_CART.replace("{id}", String(CART_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Cart deletion should return status 200").toBe(200);

    const responseBody = await response.json();
    if (responseBody !== null && typeof responseBody === "object") {
      expect(responseBody.id, "Deleted cart response should retain its ID").toBe(CART_ID);
    }
  });
});
