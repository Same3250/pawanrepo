import Ajv from "ajv";
import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { Routes } from "../../api/endpoints/routes";
import { DataProvider } from "../../utils/DataReader";

dotenv.config();

test.describe("FakeStore API Schema Tests", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
  const USER_ID = Number(process.env.USER_ID ?? 1);
  const CART_ID = Number(process.env.CART_ID ?? 1);
  const ajv = new Ajv();

  // ---------------------------------------------------------
  // JSON Schema Validation
  // ---------------------------------------------------------

  test("GET - Product response schema @master @regression @api", async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace("{id}", String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Product lookup should return status 200").toBe(200);

    const product = await response.json();
    const schema = DataProvider.readJson(
      path.resolve(__dirname, "../../api/schemas/product_api_schema.json"),
    );
    const validate = ajv.compile(schema);
    const isValid = validate(product);
    expect(
      isValid,
      `Product response schema errors: ${JSON.stringify(validate.errors)}`,
    ).toBe(true);
  });

  test("GET - User response schema @master @regression @api", async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace("{id}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "User lookup should return status 200").toBe(200);

    const user = await response.json();
    const schema = DataProvider.readJson(
      path.resolve(__dirname, "../../api/schemas/user_api_schema.json"),
    );
    const validate = ajv.compile(schema);
    const isValid = validate(user);
    expect(
      isValid,
      `User response schema errors: ${JSON.stringify(validate.errors)}`,
    ).toBe(true);
  });

  test("GET - Cart response schema @master @regression @api", async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace("{id}", String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), "Cart lookup should return status 200").toBe(200);

    const cart = await response.json();
    const schema = DataProvider.readJson(
      path.resolve(__dirname, "../../api/schemas/cart_api_schema.json"),
    );
    const validate = ajv.compile(schema);
    const isValid = validate(cart);
    expect(
      isValid,
      `Cart response schema errors: ${JSON.stringify(validate.errors)}`,
    ).toBe(true);
  });
});
