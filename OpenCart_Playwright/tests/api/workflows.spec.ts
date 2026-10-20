import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

test.describe("FakeStore API CRUD Workflows", () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const USER_ID = Number(process.env.USER_ID ?? 1);

  // ---------------------------------------------------------
  // Product CRUD Workflow
  // ---------------------------------------------------------

  test("POST / PUT / DELETE - Product workflow @master @regression @api", async ({
    request,
  }) => {
    const createPayload = RandomDataUtil.generateProductPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: createPayload,
    });
    expect(createResponse.status(), "Product creation should return status 201").toBe(201);

    const created = await createResponse.json();
    expect(created.id, "Created product should include an ID").toEqual(expect.any(Number));

    const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
    const updateRoute = Routes.UPDATE_PRODUCT.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
      data: updatePayload,
    });
    expect(updateResponse.status(), "Product update should return status 200").toBe(200);

    const updated = await updateResponse.json();
    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe(updatePayload.title);
    expect(updated.price).toBe(updatePayload.price);
    expect(updated.description).toBe(updatePayload.description);
    expect(updated.image).toBe(updatePayload.image);
    expect(updated.category).toBe(updatePayload.category);

    const deleteRoute = Routes.DELETE_PRODUCT.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Product deletion should return status 200").toBe(200);
  });

  // ---------------------------------------------------------
  // User CRUD Workflow
  // ---------------------------------------------------------

  test("POST / PUT / DELETE - User workflow @master @regression @api", async ({
    request,
  }) => {
    const createPayload = RandomDataUtil.generateUserPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: createPayload,
    });
    expect(createResponse.status(), "User creation should return status 201").toBe(201);

    const created = await createResponse.json();
    expect(created.id, "Created user should include an ID").toEqual(expect.any(Number));

    const updatePayload = RandomDataUtil.generateUserUpdatePayload();
    const updateRoute = Routes.UPDATE_USER.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
      data: updatePayload,
    });
    expect(updateResponse.status(), "User update should return status 200").toBe(200);

    const updated = await updateResponse.json();
    expect(updated.email).toBe(updatePayload.email);
    expect(updated.username).toBe(updatePayload.username);
    expect(updated.name).toEqual(updatePayload.name);
    expect(updated.address).toEqual(updatePayload.address);
    expect(updated.phone).toBe(updatePayload.phone);

    const deleteRoute = Routes.DELETE_USER.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "User deletion should return status 200").toBe(200);
  });

  // ---------------------------------------------------------
  // Cart CRUD Workflow
  // ---------------------------------------------------------

  test("POST / PUT / DELETE - Cart workflow @master @regression @api", async ({
    request,
  }) => {
    const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
      data: createPayload,
    });
    expect(createResponse.status(), "Cart creation should return status 201").toBe(201);

    const created = await createResponse.json();
    expect(created.id, "Created cart should include an ID").toEqual(expect.any(Number));
    expect(created.userId).toBe(createPayload.userId);
    expect(created.products).toEqual(createPayload.products);

    const updatePayload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
    const originalQuantity = createPayload.products[0].quantity;
    updatePayload.products[0].quantity =
      originalQuantity === 999 ? originalQuantity - 1 : originalQuantity + 1;
    const updateRoute = Routes.UPDATE_CART.replace("{id}", String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, {
      data: updatePayload,
    });
    expect(updateResponse.status(), "Cart update should return status 200").toBe(200);

    const updated = await updateResponse.json();
    expect(updated.id).toBe(created.id);
    expect(updated.userId).toBe(updatePayload.userId);
    expect(updated.products[0].quantity).toBe(updatePayload.products[0].quantity);
    expect(updated.products[0].quantity).not.toBe(originalQuantity);

    const deleteRoute = Routes.DELETE_CART.replace("{id}", String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), "Cart deletion should return status 200").toBe(200);
  });
});
