import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

test.describe("FakeStore Products API Tests", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
  const LIMIT = Number(process.env.LIMIT ?? 3);

  // ---------------------------------------------------------
  // GET - Products
  // ---------------------------------------------------------

  test("GET - All products @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), "Product list should return status 200").toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), "Product response should be an array").toBe(true);
    expect(products.length, "Product list should not be empty").toBeGreaterThan(0);

    for (const product of products) {
      expect(product.id, "Product ID should be a number").toEqual(expect.any(Number));
      expect(product.title, "Product title should be a string").toEqual(expect.any(String));
      expect(product.price, "Product price should be a number").toEqual(expect.any(Number));
      expect(product.category, "Product category should be a string").toEqual(expect.any(String));
      expect(product.image, "Product image should be a string").toEqual(expect.any(String));
    }
  });

  test("GET - Product by ID @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace("{id}", String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Product lookup should return status 200").toBe(200);

    const product = await response.json();
    expect(product.id, "Returned product ID should match the requested ID").toBe(PRODUCT_ID);
    expect(product.title).toEqual(expect.any(String));
    expect(product.price).toEqual(expect.any(Number));
    expect(product.category).toEqual(expect.any(String));
    expect(product.image).toEqual(expect.any(String));
  });

  test("GET - Products with limit @master @sanity @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace("{limit}", String(LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Limited product list should return status 200").toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), "Limited product response should be an array").toBe(true);
    expect(products.length, "Product count should match the requested limit").toBe(LIMIT);
  });

  test("GET - Products sorted ascending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace("{order}", "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Ascending product sort should return status 200").toBe(200);

    const products = await response.json();
    const ids = products.map((product: { id: number }) => product.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => first - second));
  });

  test("GET - Products sorted descending @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace("{order}", "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Descending product sort should return status 200").toBe(200);

    const products = await response.json();
    const ids = products.map((product: { id: number }) => product.id);
    expect(ids).toEqual([...ids].sort((first: number, second: number) => second - first));
  });

  test("GET - All product categories @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status(), "Product categories should return status 200").toBe(200);

    const categories = await response.json();
    expect(Array.isArray(categories), "Category response should be an array").toBe(true);
    expect(categories.length, "Category list should not be empty").toBeGreaterThan(0);
  });

  test("GET - Products by category @master @sanity @api", async ({ request }) => {
    const category = "electronics";
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace(
      "{category}",
      encodeURIComponent(category),
    );
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Category lookup should return status 200").toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), "Category products should be an array").toBe(true);
    for (const product of products) {
      expect(product.category, "Each product should match the requested category").toBe(category);
    }
  });

  // ---------------------------------------------------------
  // POST - Create Product
  // ---------------------------------------------------------

  test("POST - Create product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: payload,
    });
    expect(response.status(), "Product creation should return status 201").toBe(201);

    const created = await response.json();
    expect(created.id, "Created product should include an ID").toEqual(expect.any(Number));
    expect(created.title).toBe(payload.title);
    expect(created.price).toBe(payload.price);
    expect(created.description).toBe(payload.description);
    expect(created.image).toBe(payload.image);
    expect(created.category).toBe(payload.category);
  });

  // ---------------------------------------------------------
  // PUT - Update Product
  // ---------------------------------------------------------

  test("PUT - Update product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUpdatedProductPayload();
    const route = Routes.UPDATE_PRODUCT.replace("{id}", String(PRODUCT_ID));
    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), "Product update should return status 200").toBe(200);

    const updated = await response.json();
    expect(updated.id, "Updated product ID should match the requested ID").toBe(PRODUCT_ID);
    expect(updated.title).toBe(payload.title);
    expect(updated.price).toBe(payload.price);
    expect(updated.description).toBe(payload.description);
    expect(updated.image).toBe(payload.image);
    expect(updated.category).toBe(payload.category);
  });

  // ---------------------------------------------------------
  // DELETE - Product
  // ---------------------------------------------------------

  test("DELETE - Product @master @regression @api", async ({ request }) => {
    const route = Routes.DELETE_PRODUCT.replace("{id}", String(PRODUCT_ID));
    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), "Product deletion should return status 200").toBe(200);

    const responseBody = await response.json();
    if (responseBody !== null && typeof responseBody === "object") {
      expect(responseBody.id, "Deleted product response should retain its ID").toBe(PRODUCT_ID);
    }
  });
});
