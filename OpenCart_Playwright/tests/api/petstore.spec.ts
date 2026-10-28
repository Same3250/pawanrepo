import Ajv from "ajv";
import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { Routes } from "../../api/endpoints/routes";
import { DataProvider } from "../../utils/DataReader";
import { RandomDataUtil } from "../../utils/dataGenerator";

dotenv.config();

type PetstorePet = {
  id: number;
  category?: { id?: number; name?: string };
  name: string;
  photoUrls: string[];
  tags?: { id?: number; name?: string }[];
  status?: string;
};

type PetstoreOrder = {
  id: number;
  petId: number;
  quantity: number;
  shipDate: string;
  status: string;
  complete: boolean;
};

type PetstoreUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  userStatus: number;
};

test.describe("Swagger Petstore API Tests", () => {
  // ---------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------

  const BASE_URL = process.env.PETSTORE_API_BASE_URL || Routes.PETSTORE_BASE_URL;
  const ajv = new Ajv();
  const schemaDirectory = path.resolve(__dirname, "../../api/schemas");

  ajv.addFormat(
    "date-time",
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/,
  );

  function expectSchema(data: unknown, schemaFile: string): void {
    const schema = DataProvider.readJson(path.join(schemaDirectory, schemaFile));
    const validate = ajv.compile(schema);
    expect(
      validate(data),
      `${schemaFile} validation errors: ${JSON.stringify(validate.errors)}`,
    ).toBe(true);
  }

  function petRoute(petId: number | string): string {
    return Routes.PETSTORE_PET_BY_ID.replace(
      "{petId}",
      encodeURIComponent(String(petId)),
    );
  }

  function orderRoute(orderId: number | string): string {
    return Routes.PETSTORE_ORDER_BY_ID.replace(
      "{orderId}",
      encodeURIComponent(String(orderId)),
    );
  }

  function userRoute(username: string): string {
    return Routes.PETSTORE_USER_BY_NAME.replace(
      "{username}",
      encodeURIComponent(username),
    );
  }

  // ---------------------------------------------------------
  // GET - Pet searches and edge cases
  // ---------------------------------------------------------

  test("PET-01 GET - Search by every documented status @master @sanity @api", async ({
    request,
  }) => {
    for (const status of ["available", "pending", "sold"]) {
      await test.step(`Status: ${status}`, async () => {
        const response = await request.get(
          `${BASE_URL}${Routes.PETSTORE_PETS_BY_STATUS}`,
          { params: { status } },
        );
        expect(response.status(), "Pet status search should return HTTP 200").toBe(200);

        const pets: PetstorePet[] = await response.json();
        expect(Array.isArray(pets), "Pet search response should be an array").toBe(true);
        for (const pet of pets) {
          expect(pet.status, "Each result should match the requested status").toBe(status);
          expectSchema(pet, "petstore_pet_api_schema.json");
        }
      });
    }
  });

  test("PET-09 GET - Search using multiple documented statuses @master @regression @api", async ({
    request,
  }) => {
    const statuses = ["available", "pending"];
    const query = new URLSearchParams();
    for (const status of statuses) {
      query.append("status", status);
    }
    const response = await request.get(
      `${BASE_URL}${Routes.PETSTORE_PETS_BY_STATUS}?${query.toString()}`,
    );
    expect(response.status(), "Multi-status search should return HTTP 200").toBe(200);

    const pets: PetstorePet[] = await response.json();
    expect(Array.isArray(pets), "Multi-status search response should be an array").toBe(true);
    for (const pet of pets) {
      expect(statuses).toContain(pet.status);
      expectSchema(pet, "petstore_pet_api_schema.json");
    }
  });

  test("PET-02 GET - Characterize an undocumented status value @master @regression @api", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}${Routes.PETSTORE_PETS_BY_STATUS}`,
      { params: { status: `pawan-invalid-${Date.now()}` } },
    );
    expect(response.status(), "The live demo currently accepts an unknown status").toBe(200);

    const pets: unknown = await response.json();
    expect(Array.isArray(pets), "Unknown-status response should still be an array").toBe(true);
  });

  test("PET-03 GET - Missing status query behavior @master @regression @api", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}${Routes.PETSTORE_PETS_BY_STATUS}`,
    );
    expect(response.status(), "The live demo currently accepts a missing status").toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });

  test("PET-04 GET - Search with a non-matching tag @master @regression @api", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}${Routes.PETSTORE_PETS_BY_TAGS}`,
      { params: { tags: `pawan-no-match-${Date.now()}` } },
    );
    expect(response.status(), "Tag search should return HTTP 200").toBe(200);

    const pets: unknown[] = await response.json();
    expect(Array.isArray(pets), "Tag search response should be an array").toBe(true);
    expect(pets, "A unique tag should not match existing pets").toHaveLength(0);
  });

  test("PET-05 GET - Missing tags query behavior @master @regression @api", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}${Routes.PETSTORE_PETS_BY_TAGS}`,
    );
    expect(response.status(), "The live demo currently accepts missing tags").toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });

  test("PET-10 GET - Search using a tag returned by the API @master @regression @api", async ({
    request,
  }) => {
    const searchResponse = await request.get(
      `${BASE_URL}${Routes.PETSTORE_PETS_BY_STATUS}`,
      { params: { status: "available" } },
    );
    expect(searchResponse.status()).toBe(200);
    const pets: PetstorePet[] = await searchResponse.json();
    const selectedTag = pets.find((pet) => pet.tags && pet.tags.length > 0)?.tags?.[0]?.name;
    if (!selectedTag) {
      throw new Error("No tag was available in the live Petstore response.");
    }

    const response = await request.get(
      `${BASE_URL}${Routes.PETSTORE_PETS_BY_TAGS}`,
      { params: { tags: selectedTag } },
    );
    expect(response.status(), "Tag search should return HTTP 200").toBe(200);

    const matchingPets: PetstorePet[] = await response.json();
    expect(Array.isArray(matchingPets), "Tag search response should be an array").toBe(true);
    for (const pet of matchingPets) {
      expect(
        pet.tags?.some((tag) => tag.name === selectedTag),
        "Each returned pet should include the requested tag",
      ).toBe(true);
      expectSchema(pet, "petstore_pet_api_schema.json");
    }
  });

  test("PET-06 GET - Retrieve a known pet and validate its schema @master @sanity @api", async ({
    request,
  }) => {
    const searchResponse = await request.get(
      `${BASE_URL}${Routes.PETSTORE_PETS_BY_STATUS}`,
      { params: { status: "available" } },
    );
    expect(searchResponse.status()).toBe(200);
    const pets: PetstorePet[] = await searchResponse.json();
    expect(pets.length, "A pet ID is required for the detail lookup").toBeGreaterThan(0);

    const selectedPet = pets[0];
    const response = await request.get(`${BASE_URL}${petRoute(selectedPet.id)}`);
    expect(response.status(), "Known pet lookup should return HTTP 200").toBe(200);

    const pet: PetstorePet = await response.json();
    expect(pet.id, "The detail ID should match the selected pet").toBe(selectedPet.id);
    expectSchema(pet, "petstore_pet_api_schema.json");
  });

  test("PET-07 GET - Unknown and malformed pet IDs @master @regression @api", async ({
    request,
  }) => {
    for (const petId of [0, "not-a-number"]) {
      await test.step(`Pet ID: ${petId}`, async () => {
        const response = await request.get(`${BASE_URL}${petRoute(petId)}`);
        expect(response.status(), "Unknown pet IDs currently return HTTP 404").toBe(404);
        expectSchema(await response.json(), "petstore_api_response_schema.json");
      });
    }
  });

  // ---------------------------------------------------------
  // POST / PUT / DELETE - Pet workflow
  // ---------------------------------------------------------

  test("PET-08 POST / PUT / form POST / upload / DELETE - Pet workflow @master @regression @api", async ({
    request,
  }) => {
    const petId = Date.now();
    const createPayload = RandomDataUtil.generatePetstorePetPayload(petId);
    let created = false;

    try {
      const createResponse = await request.post(
        `${BASE_URL}${Routes.PETSTORE_PETS}`,
        { data: createPayload },
      );
      expect(createResponse.status(), "Pet creation should return HTTP 200").toBe(200);
      created = true;

      const createdPet: PetstorePet = await createResponse.json();
      expect(createdPet.id, "Created pet should retain the submitted ID").toBe(petId);
      expectSchema(createdPet, "petstore_pet_api_schema.json");

      const updatePayload = {
        ...createPayload,
        name: `Updated ${createPayload.name}`,
        status: "pending",
      };
      const updateResponse = await request.put(
        `${BASE_URL}${Routes.PETSTORE_PETS}`,
        { data: updatePayload },
      );
      expect(updateResponse.status(), "Pet update should return HTTP 200").toBe(200);
      const updatedPet: PetstorePet = await updateResponse.json();
      expect(updatedPet.id).toBe(petId);
      expect(updatedPet.name).toBe(updatePayload.name);
      expect(updatedPet.status).toBe(updatePayload.status);
      expectSchema(updatedPet, "petstore_pet_api_schema.json");

      const formUpdateResponse = await request.post(
        `${BASE_URL}${petRoute(petId)}`,
        { form: { name: "Petstore form update", status: "available" } },
      );
      expect(formUpdateResponse.status(), "Form update should return HTTP 200").toBe(200);
      expectSchema(
        await formUpdateResponse.json(),
        "petstore_api_response_schema.json",
      );

      const imageResponse = await request.post(
        `${BASE_URL}${Routes.PETSTORE_UPLOAD_PET_IMAGE.replace(
          "{petId}",
          String(petId),
        )}`,
        {
          multipart: {
            additionalMetadata: "Playwright API test upload",
            file: {
              name: "petstore-api-test.txt",
              mimeType: "text/plain",
              buffer: Buffer.from("Petstore API upload test"),
            },
          },
        },
      );
      expect(imageResponse.status(), "Image upload should return HTTP 200").toBe(200);
      expectSchema(await imageResponse.json(), "petstore_api_response_schema.json");

      const deleteResponse = await request.delete(`${BASE_URL}${petRoute(petId)}`);
      expect(deleteResponse.status(), "Pet deletion should return HTTP 200").toBe(200);
      expectSchema(await deleteResponse.json(), "petstore_api_response_schema.json");
      created = false;
    } finally {
      if (created) {
        const cleanupResponse = await request.delete(`${BASE_URL}${petRoute(petId)}`);
        expect(
          [200, 404],
          "Pet workflow cleanup should delete the generated pet or find it already absent",
        ).toContain(cleanupResponse.status());
      }
    }
  });

  // ---------------------------------------------------------
  // GET / POST / DELETE - Store orders
  // ---------------------------------------------------------

  test("STORE-01 GET - Inventory response contains non-negative integer counts @master @sanity @api", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}${Routes.PETSTORE_INVENTORY}`,
    );
    expect(response.status(), "Inventory lookup should return HTTP 200").toBe(200);

    const inventory: Record<string, unknown> = await response.json();
    expect(inventory, "Inventory should be a JSON object").toEqual(expect.any(Object));
    for (const [status, count] of Object.entries(inventory)) {
      expect(typeof status).toBe("string");
      expect(Number.isInteger(count), `Inventory count for ${status} should be an integer`).toBe(
        true,
      );
      expect(count, `Inventory count for ${status} should not be negative`).toBeGreaterThanOrEqual(
        0,
      );
    }
  });

  test("STORE-02 POST / GET / DELETE - Order workflow @master @regression @api", async ({
    request,
  }) => {
    const searchResponse = await request.get(
      `${BASE_URL}${Routes.PETSTORE_PETS_BY_STATUS}`,
      { params: { status: "available" } },
    );
    expect(searchResponse.status()).toBe(200);
    const pets: PetstorePet[] = await searchResponse.json();
    expect(pets.length, "Order data requires an existing pet ID").toBeGreaterThan(0);

    const orderId = Date.now();
    const createPayload = RandomDataUtil.generatePetstoreOrderPayload(
      orderId,
      pets[0].id,
    );
    let created = false;

    try {
      const createResponse = await request.post(
        `${BASE_URL}${Routes.PETSTORE_ORDERS}`,
        { data: createPayload },
      );
      expect(createResponse.status(), "Order creation should return HTTP 200").toBe(200);
      created = true;

      const createdOrder: PetstoreOrder = await createResponse.json();
      expect(createdOrder.id).toBe(orderId);
      expect(createdOrder.petId).toBe(createPayload.petId);
      expectSchema(createdOrder, "petstore_order_api_schema.json");

      const getResponse = await request.get(`${BASE_URL}${orderRoute(orderId)}`);
      expect(getResponse.status(), "Created order lookup should return HTTP 200").toBe(200);
      const order: PetstoreOrder = await getResponse.json();
      expect(order.id).toBe(orderId);
      expectSchema(order, "petstore_order_api_schema.json");

      const deleteResponse = await request.delete(`${BASE_URL}${orderRoute(orderId)}`);
      expect(deleteResponse.status(), "Order deletion should return HTTP 200").toBe(200);
      expectSchema(await deleteResponse.json(), "petstore_api_response_schema.json");
      created = false;
    } finally {
      if (created) {
        const cleanupResponse = await request.delete(`${BASE_URL}${orderRoute(orderId)}`);
        expect(
          [200, 404],
          "Order workflow cleanup should delete the generated order or find it absent",
        ).toContain(cleanupResponse.status());
      }
    }
  });

  test("STORE-03 GET / DELETE - Unknown and malformed order IDs @master @regression @api", async ({
    request,
  }) => {
    for (const orderId of [0, "not-a-number"]) {
      await test.step(`Order ID: ${orderId}`, async () => {
        const getResponse = await request.get(`${BASE_URL}${orderRoute(orderId)}`);
        expect(getResponse.status(), "Unknown order IDs currently return HTTP 404").toBe(404);
        expectSchema(await getResponse.json(), "petstore_api_response_schema.json");

        const deleteResponse = await request.delete(`${BASE_URL}${orderRoute(orderId)}`);
        expect(deleteResponse.status(), "Deleting an unknown order currently returns HTTP 404").toBe(
          404,
        );
        expectSchema(await deleteResponse.json(), "petstore_api_response_schema.json");
      });
    }
  });

  test("STORE-04 GET - Retrieve the observed seeded order @master @sanity @api", async ({
    request,
  }) => {
    const response = await request.get(`${BASE_URL}${orderRoute(1)}`);
    expect(response.status(), "Observed seeded order lookup should return HTTP 200").toBe(200);

    const order: PetstoreOrder = await response.json();
    expect(order.id, "Returned order ID should match the requested ID").toBe(1);
    expectSchema(order, "petstore_order_api_schema.json");
  });

  // ---------------------------------------------------------
  // POST / GET / PUT / DELETE - User workflows
  // ---------------------------------------------------------

  test("USER-01 POST / GET / PUT / login / logout / DELETE - User workflow @master @regression @api", async ({
    request,
  }) => {
    const createPayload = RandomDataUtil.generatePetstoreUserPayload();
    let created = false;

    try {
      const createResponse = await request.post(
        `${BASE_URL}${Routes.PETSTORE_USERS}`,
        { data: createPayload },
      );
      expect(createResponse.status(), "User creation should return HTTP 200").toBe(200);
      created = true;
      expectSchema(await createResponse.json(), "petstore_api_response_schema.json");

      const getResponse = await request.get(
        `${BASE_URL}${userRoute(createPayload.username)}`,
      );
      expect(getResponse.status(), "Created user lookup should return HTTP 200").toBe(200);
      const user: PetstoreUser = await getResponse.json();
      expect(user.username).toBe(createPayload.username);
      expectSchema(user, "petstore_user_api_schema.json");

      const updatePayload = {
        ...createPayload,
        firstName: `Updated ${createPayload.firstName}`,
      };
      const updateResponse = await request.put(
        `${BASE_URL}${userRoute(createPayload.username)}`,
        { data: updatePayload },
      );
      expect(updateResponse.status(), "User update should return HTTP 200").toBe(200);
      expectSchema(await updateResponse.json(), "petstore_api_response_schema.json");

      const loginResponse = await request.get(
        `${BASE_URL}${Routes.PETSTORE_USER_LOGIN}`,
        { params: { username: createPayload.username, password: createPayload.password } },
      );
      expect(loginResponse.status(), "User login should return HTTP 200").toBe(200);
      expectSchema(await loginResponse.json(), "petstore_api_response_schema.json");

      const logoutResponse = await request.get(
        `${BASE_URL}${Routes.PETSTORE_USER_LOGOUT}`,
      );
      expect(logoutResponse.status(), "User logout should return HTTP 200").toBe(200);
      expectSchema(await logoutResponse.json(), "petstore_api_response_schema.json");

      const deleteResponse = await request.delete(
        `${BASE_URL}${userRoute(createPayload.username)}`,
      );
      expect(deleteResponse.status(), "User deletion should return HTTP 200").toBe(200);
      expectSchema(await deleteResponse.json(), "petstore_api_response_schema.json");
      created = false;
    } finally {
      if (created) {
        const cleanupResponse = await request.delete(
          `${BASE_URL}${userRoute(createPayload.username)}`,
        );
        expect(
          [200, 404],
          "User workflow cleanup should delete the generated user or find it absent",
        ).toContain(cleanupResponse.status());
      }
    }
  });

  test("USER-02 GET - Unknown username returns the documented not-found response @master @regression @api", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}${userRoute(`pawan-no-such-user-${Date.now()}`)}`,
    );
    expect(response.status(), "Unknown username lookup should return HTTP 404").toBe(404);
    expectSchema(await response.json(), "petstore_api_response_schema.json");
  });

  test("USER-03 POST - Create users with array and list operations @master @regression @api", async ({
    request,
  }) => {
    const arrayUsers = [
      RandomDataUtil.generatePetstoreUserPayload(),
      RandomDataUtil.generatePetstoreUserPayload(),
    ];
    const listUsers = [RandomDataUtil.generatePetstoreUserPayload()];
    const createdUsernames: string[] = [];

    try {
      const arrayResponse = await request.post(
        `${BASE_URL}${Routes.PETSTORE_USERS_CREATE_WITH_ARRAY}`,
        { data: arrayUsers },
      );
      expect(arrayResponse.status(), "Array user creation should return HTTP 200").toBe(200);
      expectSchema(await arrayResponse.json(), "petstore_api_response_schema.json");
      createdUsernames.push(...arrayUsers.map((user) => user.username));

      const listResponse = await request.post(
        `${BASE_URL}${Routes.PETSTORE_USERS_CREATE_WITH_LIST}`,
        { data: listUsers },
      );
      expect(listResponse.status(), "List user creation should return HTTP 200").toBe(200);
      expectSchema(await listResponse.json(), "petstore_api_response_schema.json");
      createdUsernames.push(...listUsers.map((user) => user.username));
    } finally {
      for (const username of createdUsernames) {
        const cleanupResponse = await request.delete(
          `${BASE_URL}${userRoute(username)}`,
        );
        expect(
          [200, 404],
          `Cleanup should delete generated user ${username} or find it absent`,
        ).toContain(cleanupResponse.status());
      }
    }
  });

  test("USER-04 GET - Login with missing required query parameters @master @regression @api", async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}${Routes.PETSTORE_USER_LOGIN}`,
    );
    expect(response.status(), "The live demo currently accepts missing login parameters").toBe(
      200,
    );
    expectSchema(await response.json(), "petstore_api_response_schema.json");
  });
});
