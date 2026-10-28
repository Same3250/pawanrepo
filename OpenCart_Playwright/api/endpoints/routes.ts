
export const Routes = {

    BASE_URL: 'https://fakestoreapi.com',
    PETSTORE_BASE_URL: 'https://petstore.swagger.io/v2',

    // =========================
    // Petstore Routes
    // =========================

    PETSTORE_UPLOAD_PET_IMAGE: '/pet/{petId}/uploadImage',
    PETSTORE_PETS: '/pet',
    PETSTORE_PETS_BY_STATUS: '/pet/findByStatus',
    PETSTORE_PETS_BY_TAGS: '/pet/findByTags',
    PETSTORE_PET_BY_ID: '/pet/{petId}',
    PETSTORE_INVENTORY: '/store/inventory',
    PETSTORE_ORDERS: '/store/order',
    PETSTORE_ORDER_BY_ID: '/store/order/{orderId}',
    PETSTORE_USERS_CREATE_WITH_LIST: '/user/createWithList',
    PETSTORE_USERS: '/user',
    PETSTORE_USER_BY_NAME: '/user/{username}',
    PETSTORE_USER_LOGIN: '/user/login',
    PETSTORE_USER_LOGOUT: '/user/logout',
    PETSTORE_USERS_CREATE_WITH_ARRAY: '/user/createWithArray',

    // =========================
    // Product Routes
    // =========================

    GET_ALL_PRODUCTS: '/products',
    GET_PRODUCT_BY_ID: '/products/{id}',
    GET_PRODUCTS_WITH_LIMIT: '/products?limit={limit}',
    GET_PRODUCTS_SORTED: '/products?sort={order}',
    GET_ALL_CATEGORIES: '/products/categories',
    GET_PRODUCTS_BY_CATEGORY: '/products/category/{category}',
    CREATE_PRODUCT: '/products',
    UPDATE_PRODUCT: '/products/{id}',
    DELETE_PRODUCT: '/products/{id}',

    // =========================
    // User Routes
    // =========================

    GET_ALL_USERS: '/users',
    GET_USER_BY_ID: '/users/{id}',
    GET_USERS_WITH_LIMIT: '/users?limit={limit}',
    GET_USERS_SORTED: '/users?sort={order}',
    CREATE_USER: '/users',
    UPDATE_USER: '/users/{id}',
    DELETE_USER: '/users/{id}',

    // =========================
    // Cart Routes
    // =========================

    GET_ALL_CARTS: '/carts',
    GET_CART_BY_ID: '/carts/{id}',
    GET_CARTS_BY_DATE_RANGE: '/carts?startdate={startdate}&enddate={enddate}',
    GET_USER_CART: '/carts/user/{userId}',
    GET_CARTS_WITH_LIMIT: '/carts?limit={limit}',
    GET_CARTS_SORTED: '/carts?sort={order}',
    CREATE_CART: '/carts',
    UPDATE_CART: '/carts/{id}',
    DELETE_CART: '/carts/{id}',

    // =========================
    // Authentication Routes
    // =========================

    AUTH_LOGIN: '/auth/login'
}
