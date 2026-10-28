export type PetstoreTestCase = {
  id: string;
  area: "Pet" | "Store" | "User";
  methods: readonly ("GET" | "POST" | "PUT" | "DELETE")[];
  endpoints: readonly string[];
  scenario: string;
  expectedOrObservedResult: string;
};

export const petstoreApiTestCases = [
  {
    id: "PET-01",
    area: "Pet",
    methods: ["GET"],
    endpoints: ["/pet/findByStatus"],
    scenario: "Search by each documented status: available, pending, and sold.",
    expectedOrObservedResult:
      "HTTP 200 array; each returned pet has the requested status and matches the Pet schema.",
  },
  {
    id: "PET-02",
    area: "Pet",
    methods: ["GET"],
    endpoints: ["/pet/findByStatus"],
    scenario: "Search with an unknown status value.",
    expectedOrObservedResult:
      "Observed live behavior: HTTP 200 array, although the Swagger specification restricts status values.",
  },
  {
    id: "PET-03",
    area: "Pet",
    methods: ["GET"],
    endpoints: ["/pet/findByStatus"],
    scenario: "Omit the required status query parameter.",
    expectedOrObservedResult:
      "Observed live behavior: HTTP 200 array rather than a missing-parameter error.",
  },
  {
    id: "PET-04",
    area: "Pet",
    methods: ["GET"],
    endpoints: ["/pet/findByTags"],
    scenario: "Search with a unique, non-matching tag.",
    expectedOrObservedResult: "HTTP 200 with an empty array.",
  },
  {
    id: "PET-05",
    area: "Pet",
    methods: ["GET"],
    endpoints: ["/pet/findByTags"],
    scenario: "Omit the required tags query parameter.",
    expectedOrObservedResult:
      "Observed live behavior: HTTP 200 array rather than a missing-parameter error.",
  },
  {
    id: "PET-06",
    area: "Pet",
    methods: ["GET"],
    endpoints: ["/pet/findByStatus", "/pet/{petId}"],
    scenario: "Get a pet ID from a live search, retrieve that pet, and validate its schema.",
    expectedOrObservedResult: "HTTP 200; returned pet ID matches the selected ID.",
  },
  {
    id: "PET-07",
    area: "Pet",
    methods: ["GET"],
    endpoints: ["/pet/{petId}"],
    scenario: "Retrieve an unknown numeric ID and a malformed non-numeric ID.",
    expectedOrObservedResult: "Observed live behavior: HTTP 404 with an ApiResponse body.",
  },
  {
    id: "PET-08",
    area: "Pet",
    methods: ["POST", "PUT", "DELETE"],
    endpoints: [
      "/pet",
      "/pet/{petId}",
      "/pet/{petId}/uploadImage",
    ],
    scenario:
      "Create a generated pet, update its JSON fields, update it with form data, upload an image, delete it, and clean up on failure.",
    expectedOrObservedResult:
      "Successful operations return HTTP 200; the generated pet is deleted after the workflow.",
  },
  {
    id: "PET-09",
    area: "Pet",
    methods: ["GET"],
    endpoints: ["/pet/findByStatus"],
    scenario: "Search using multiple documented status query values.",
    expectedOrObservedResult:
      "HTTP 200 array; each returned pet has one of the requested statuses.",
  },
  {
    id: "PET-10",
    area: "Pet",
    methods: ["GET"],
    endpoints: ["/pet/findByStatus", "/pet/findByTags"],
    scenario: "Use a tag obtained from a live pet response to search by tag.",
    expectedOrObservedResult:
      "HTTP 200 array; returned pets include the requested tag.",
  },
  {
    id: "STORE-01",
    area: "Store",
    methods: ["GET"],
    endpoints: ["/store/inventory"],
    scenario: "Validate the inventory response object and each inventory count.",
    expectedOrObservedResult:
      "HTTP 200 object; every count is a non-negative integer.",
  },
  {
    id: "STORE-02",
    area: "Store",
    methods: ["POST", "GET", "DELETE"],
    endpoints: ["/store/order", "/store/order/{orderId}", "/pet/findByStatus"],
    scenario:
      "Create an order for a pet ID obtained from a live search, retrieve it, delete it, and clean up on failure.",
    expectedOrObservedResult:
      "HTTP 200 for successful operations; the live demo accepted the generated order ID beyond the documented retrieval range.",
  },
  {
    id: "STORE-03",
    area: "Store",
    methods: ["GET", "DELETE"],
    endpoints: ["/store/order/{orderId}"],
    scenario: "Retrieve and delete an unknown numeric order ID and a malformed ID.",
    expectedOrObservedResult: "Observed live behavior: HTTP 404 with an ApiResponse body.",
  },
  {
    id: "STORE-04",
    area: "Store",
    methods: ["GET"],
    endpoints: ["/store/order/{orderId}"],
    scenario: "Retrieve the seeded order whose ID was observed as 1.",
    expectedOrObservedResult: "HTTP 200; response matches the Order schema.",
  },
  {
    id: "USER-01",
    area: "User",
    methods: ["POST", "GET", "PUT", "DELETE"],
    endpoints: [
      "/user",
      "/user/{username}",
      "/user/login",
      "/user/logout",
    ],
    scenario:
      "Create a generated user, retrieve and update it, log in, log out, delete it, and clean up on failure.",
    expectedOrObservedResult:
      "Successful operations return HTTP 200; the generated user is deleted after the workflow.",
  },
  {
    id: "USER-02",
    area: "User",
    methods: ["GET"],
    endpoints: ["/user/{username}"],
    scenario: "Retrieve a unique username that does not exist.",
    expectedOrObservedResult: "HTTP 404 with an ApiResponse body.",
  },
  {
    id: "USER-03",
    area: "User",
    methods: ["POST", "DELETE"],
    endpoints: ["/user/createWithArray", "/user/createWithList", "/user/{username}"],
    scenario:
      "Create generated users with both batch endpoints and delete them afterward.",
    expectedOrObservedResult:
      "Both batch operations return HTTP 200 with an ApiResponse; generated users are cleaned up.",
  },
  {
    id: "USER-04",
    area: "User",
    methods: ["GET"],
    endpoints: ["/user/login"],
    scenario: "Call login without the required username and password query parameters.",
    expectedOrObservedResult:
      "Observed live behavior: HTTP 200 session response despite missing query parameters.",
  },
] as const satisfies readonly PetstoreTestCase[];
