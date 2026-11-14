const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "localbite-test-"));
process.env.DATABASE_PATH = path.join(tempDir, "test.sqlite");
process.env.SESSION_SECRET = "test-session-secret-that-is-long-enough";
process.env.FRONTEND_ORIGINS = "http://localhost:5500";

const app = require("../server");
const db = require("../db");
let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  db.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

async function request(url, { cookie, method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  const setCookie = response.headers.getSetCookie?.()[0];
  return {
    status: response.status,
    payload,
    cookie: setCookie ? setCookie.split(";")[0] : cookie,
  };
}

async function signup(role, email, extra = {}) {
  const response = await request("/api/auth/signup", {
    method: "POST",
    body: {
      name: `${role} tester`,
      email,
      password: "localbite-test-password",
      role,
      terms: true,
      ...extra,
    },
  });
  assert.equal(response.status, 201, JSON.stringify(response.payload));
  return { cookie: response.cookie, user: response.payload.user };
}

test("customer, business, and driver order lifecycle is connected and role-protected", async () => {
  const customer = await signup("customer", "customer@example.test");
  assert.equal(customer.user.role, "customer");

  const deniedRestaurantMutation = await request("/api/business/orders", { cookie: customer.cookie });
  assert.equal(deniedRestaurantMutation.status, 403);

  const restaurantsResponse = await request("/api/restaurants");
  assert.equal(restaurantsResponse.status, 200);
  assert.ok(restaurantsResponse.payload.restaurants.length >= 3);

  const seededRestaurant = restaurantsResponse.payload.restaurants[0];
  const seededMenu = await request(`/api/restaurants/${seededRestaurant.id}`);
  assert.ok(seededMenu.payload.menu.length > 0);

  const business = await signup("business", "business@example.test", { restaurantName: "Test Kitchen" });
  const createdMenu = await request("/api/business/menu", {
    cookie: business.cookie,
    method: "POST",
    body: { name: "Test Jollof", description: "A demo dish.", price: 250000 },
  });
  assert.equal(createdMenu.status, 201, JSON.stringify(createdMenu.payload));
  const menuItem = createdMenu.payload.item;
  const ownedRestaurant = await request("/api/business/restaurant", { cookie: business.cookie });
  const restaurantId = ownedRestaurant.payload.restaurant.id;
  const hiddenUntilConfigured = await request("/api/restaurants?q=Test%20Kitchen");
  assert.equal(hiddenUntilConfigured.payload.restaurants.length, 0);
  const profile = await request("/api/business/restaurant", {
    cookie: business.cookie,
    method: "PATCH",
    body: {
      name: "Test Kitchen",
      category: "Nigerian",
      address: "20 Demo Avenue, Lagos",
      description: "Test kitchen ready for local orders.",
      isOpen: true,
    },
  });
  assert.equal(profile.status, 200);
  const publishedRestaurant = await request("/api/restaurants?q=Test%20Kitchen");
  assert.equal(publishedRestaurant.payload.restaurants.length, 1);

  const firstOrder = await request("/api/orders", {
    cookie: customer.cookie,
    method: "POST",
    body: {
      restaurantId: seededRestaurant.id,
      address: "12 Demo Street, Lagos",
      paymentMethod: "cash_demo",
      items: [{ id: seededMenu.payload.menu[0].id, quantity: 1 }],
    },
  });
  assert.equal(firstOrder.status, 201, JSON.stringify(firstOrder.payload));
  assert.equal(firstOrder.payload.paymentNotice, "Demo payment only. No charge was made.");
  assert.equal(firstOrder.payload.order.status, "pending");
  assert.equal(firstOrder.payload.order.delivery_fee, seededRestaurant.delivery_fee);

  const order = await request("/api/orders", {
    cookie: customer.cookie,
    method: "POST",
    body: {
      restaurantId,
      address: "12 Demo Street, Lagos",
      paymentMethod: "card_demo",
      items: [{ id: menuItem.id, quantity: 2 }],
    },
  });
  assert.equal(order.status, 201, JSON.stringify(order.payload));
  const orderId = order.payload.order.id;

  const businessOrders = await request("/api/business/orders", { cookie: business.cookie });
  assert.equal(businessOrders.status, 200);
  assert.equal(businessOrders.payload.orders.length, 1);
  assert.equal(businessOrders.payload.orders[0].id, orderId);

  for (const status of ["accepted", "preparing", "ready"]) {
    const updated = await request(`/api/business/orders/${orderId}/status`, {
      cookie: business.cookie,
      method: "PATCH",
      body: { status },
    });
    assert.equal(updated.status, 200, JSON.stringify(updated.payload));
    assert.equal(updated.payload.order.status, status);
  }

  const driver = await signup("driver", "driver@example.test");
  const jobs = await request("/api/driver/jobs", { cookie: driver.cookie });
  assert.ok(jobs.payload.orders.some((job) => job.id === orderId));
  const accepted = await request(`/api/driver/jobs/${orderId}/accept`, {
    cookie: driver.cookie,
    method: "POST",
  });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.payload.order.driver_id, driver.user.id);

  const pickedUp = await request(`/api/driver/orders/${orderId}/status`, {
    cookie: driver.cookie,
    method: "PATCH",
    body: { status: "picked_up" },
  });
  assert.equal(pickedUp.status, 200);
  const delivered = await request(`/api/driver/orders/${orderId}/status`, {
    cookie: driver.cookie,
    method: "PATCH",
    body: { status: "delivered" },
  });
  assert.equal(delivered.status, 200);
  assert.equal(delivered.payload.order.status, "delivered");

  const customerOrders = await request("/api/orders/mine", { cookie: customer.cookie });
  assert.equal(customerOrders.status, 200);
  assert.ok(customerOrders.payload.orders.some((item) => item.id === orderId && item.status === "delivered"));
});

test("signup validates roles, terms, and duplicate emails; signin validates selected role", async () => {
  const noTerms = await request("/api/auth/signup", {
    method: "POST",
    body: { name: "No terms", email: "terms@example.test", password: "password123", role: "customer" },
  });
  assert.equal(noTerms.status, 400);

  const noRestaurant = await request("/api/auth/signup", {
    method: "POST",
    body: { name: "No restaurant", email: "business-no-name@example.test", password: "password123", role: "business", terms: true },
  });
  assert.equal(noRestaurant.status, 400);

  const duplicate = await request("/api/auth/signup", {
    method: "POST",
    body: { name: "Duplicate", email: "customer@example.test", password: "password123", role: "customer", terms: true },
  });
  assert.equal(duplicate.status, 409);

  const wrongRole = await request("/api/auth/signin", {
    method: "POST",
    body: { email: "customer@example.test", password: "localbite-test-password", role: "driver" },
  });
  assert.equal(wrongRole.status, 401);

  const signedIn = await request("/api/auth/signin", {
    method: "POST",
    body: { email: "customer@example.test", password: "localbite-test-password", role: "customer" },
  });
  assert.equal(signedIn.status, 200);
  assert.equal(signedIn.payload.user.role, "customer");
  const sessionUser = await request("/api/auth/me", { cookie: signedIn.cookie });
  assert.equal(sessionUser.status, 200);
  assert.equal(sessionUser.payload.user.email, "customer@example.test");
});

test("API is separate from frontend assets and restricts credentialed CORS to configured origins", async () => {
  assert.equal((await fetch(`${baseUrl}/`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/app.html`)).status, 404);
  assert.equal((await fetch(`${baseUrl}/auth/signin.html`)).status, 404);

  const allowed = await fetch(`${baseUrl}/api/health`, { headers: { Origin: "http://localhost:5500" } });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get("access-control-allow-origin"), "http://localhost:5500");
  assert.equal(allowed.headers.get("access-control-allow-credentials"), "true");

  const denied = await fetch(`${baseUrl}/api/health`, { headers: { Origin: "https://not-allowed.example" } });
  assert.equal(denied.status, 403);
});
