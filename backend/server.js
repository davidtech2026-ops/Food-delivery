const crypto = require("node:crypto");
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const session = require("express-session");
const db = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";
const secret = process.env.SESSION_SECRET;
const configuredOrigins = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN
  || (isProduction ? "" : "http://localhost:5500,http://127.0.0.1:5500,http://localhost:5173,http://127.0.0.1:5173");
const allowedOrigins = new Set(configuredOrigins.split(",").map((origin) => origin.trim()).filter(Boolean));

if (isProduction && (!secret || secret.length < 32 || secret === "replace-with-a-random-secret-at-least-32-characters")) {
  throw new Error("Set SESSION_SECRET to a random value of at least 32 characters in production.");
}
if (isProduction && allowedOrigins.size === 0) {
  throw new Error("Set FRONTEND_ORIGINS to the deployed frontend origin in production.");
}
if (!secret) {
  console.warn("SESSION_SECRET is unset. Using a development-only session secret.");
}

const SESSION_SECRET = secret || crypto.randomBytes(32).toString("hex");

app.disable("x-powered-by");
app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({ error: "This frontend origin is not allowed to use the API." });
  }
  if (origin) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.vary("Origin");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "50kb" }));
app.use((req, _res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) req.body = {};
  next();
});
app.use(session({
  name: "localbite.sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
  store: new SQLiteSessionStore(),
}));

function SQLiteSessionStore() {
  const Store = session.Store;
  const store = new Store();
  const select = db.prepare("SELECT sess FROM sessions WHERE sid = ? AND expires > ?");
  const upsert = db.prepare(`
    INSERT INTO sessions (sid, sess, expires) VALUES (?, ?, ?)
    ON CONFLICT(sid) DO UPDATE SET sess = excluded.sess, expires = excluded.expires
  `);
  const remove = db.prepare("DELETE FROM sessions WHERE sid = ?");
  const cleanup = db.prepare("DELETE FROM sessions WHERE expires <= ?");
  store.get = (sid, callback) => {
    try {
      cleanup.run(Date.now());
      const row = select.get(sid, Date.now());
      callback(null, row ? JSON.parse(row.sess) : null);
    } catch (error) {
      callback(error);
    }
  };
  store.set = (sid, sess, callback = () => {}) => {
    try {
      const expires = sess.cookie?.expires ? new Date(sess.cookie.expires).getTime() : Date.now() + 86400000;
      upsert.run(sid, JSON.stringify(sess), expires);
      callback(null);
    } catch (error) {
      callback(error);
    }
  };
  store.touch = (sid, sess, callback = () => {}) => store.set(sid, sess, callback);
  store.destroy = (sid, callback = () => {}) => {
    try {
      remove.run(sid);
      callback(null);
    } catch (error) {
      callback(error);
    }
  };
  return store;
}

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
});

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Please sign in to continue." });
  const user = db.prepare("SELECT id, name, email, phone, role FROM users WHERE id = ?").get(req.session.userId);
  if (!user) {
    return req.session.destroy((error) => {
      if (error) return next(error);
      res.status(401).json({ error: "Your session has expired. Please sign in again." });
    });
  }
  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `This action is for ${roles.join(" or ")} accounts.` });
    }
    next();
  };
}

function validateString(value, label, max = 240) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw Object.assign(new Error(`${label} is required and must be at most ${max} characters.`), { status: 400 });
  }
  return value.trim();
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(`${salt.toString("hex")}:${derivedKey.toString("hex")}`);
    });
  });
}

function verifyPassword(password, storedHash) {
  const [saltHex, keyHex] = storedHash.split(":");
  if (!saltHex || !keyHex) return false;
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, Buffer.from(saltHex, "hex"), 64, (error, derivedKey) => {
      if (error) return reject(error);
      const expected = Buffer.from(keyHex, "hex");
      resolve(expected.length === derivedKey.length && crypto.timingSafeEqual(expected, derivedKey));
    });
  });
}

function orderQuery(where, params) {
  return db.prepare(`
    SELECT o.*, r.name AS restaurant_name, c.name AS customer_name, d.name AS driver_name
    FROM orders o
    JOIN restaurants r ON r.id = o.restaurant_id
    JOIN users c ON c.id = o.customer_id
    LEFT JOIN users d ON d.id = o.driver_id
    WHERE ${where}
    ORDER BY o.created_at DESC, o.id DESC
  `).all(...params).map((order) => ({
    ...order,
    items: db.prepare("SELECT item_name, unit_price, quantity FROM order_items WHERE order_id = ?").all(order.id),
  }));
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/auth/signup", asyncRoute(async (req, res) => {
  const name = validateString(req.body.name, "Name", 120);
  const email = validateString(req.body.email, "Email", 254).toLowerCase();
  const password = req.body.password;
  const role = req.body.role || "customer";
  const phone = typeof req.body.phone === "string" ? req.body.phone.trim().slice(0, 40) : "";
  const restaurantName = typeof req.body.restaurantName === "string" ? req.body.restaurantName.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 200) {
    return res.status(400).json({ error: "Password must be between 8 and 200 characters." });
  }
  if (!["customer", "business", "driver"].includes(role)) {
    return res.status(400).json({ error: "Choose customer, business, or driver." });
  }
  if (req.body.terms !== true) {
    return res.status(400).json({ error: "Accept the terms to create an account." });
  }
  if (role === "business" && !restaurantName) {
    return res.status(400).json({ error: "Restaurant name is required for business accounts." });
  }
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const passwordHash = await hashPassword(password);
  db.exec("BEGIN IMMEDIATE");
  let userId;
  try {
    const result = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)
    `).run(name, email, phone, passwordHash, role);
    userId = Number(result.lastInsertRowid);
    if (role === "business") {
      db.prepare(`
        INSERT INTO restaurants (owner_id, name, category, description, address)
        VALUES (?, ?, 'Local kitchen', 'Add a description for your restaurant.', 'Add your restaurant address')
      `).run(userId, restaurantName);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    if (error.code === "ERR_SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "An account with that email already exists." });
    }
    throw error;
  }
  await new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
  req.session.userId = userId;
  res.status(201).json({ user: publicUser(db.prepare("SELECT id, name, email, phone, role FROM users WHERE id = ?").get(userId)) });
}));

app.post("/api/auth/signin", asyncRoute(async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body.password;
  const requestedRole = req.body.role || "customer";
  if (!email || typeof password !== "string" || !["customer", "business", "driver"].includes(requestedRole)) {
    return res.status(400).json({ error: "Enter your email, password, and account role." });
  }
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || user.role !== requestedRole || !(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: "Email, password, or account type is incorrect." });
  }
  await new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
  req.session.userId = user.id;
  req.session.cookie.maxAge = req.body.remember === true ? 1000 * 60 * 60 * 24 * 7 : null;
  res.json({ user: publicUser(user) });
}));

app.post("/api/auth/signout", requireAuth, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("localbite.sid", { httpOnly: true, sameSite: "lax", secure: isProduction });
    res.json({ ok: true });
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.get("/api/restaurants", (req, res) => {
  const search = typeof req.query.q === "string" ? `%${req.query.q.trim()}%` : "%";
  const restaurants = db.prepare(`
    SELECT r.id, r.name, r.category, r.description, r.address, r.delivery_fee, r.eta_min,
      r.eta_max, r.rating, r.is_open, COUNT(m.id) AS menu_count
    FROM restaurants r LEFT JOIN menu_items m ON m.restaurant_id = r.id AND m.available = 1
    WHERE r.is_open = 1 AND r.address <> 'Add your restaurant address'
      AND EXISTS (SELECT 1 FROM menu_items ready WHERE ready.restaurant_id = r.id AND ready.available = 1)
      AND (r.name LIKE ? OR r.category LIKE ? OR r.description LIKE ?)
    GROUP BY r.id ORDER BY r.rating DESC, r.id
  `).all(search, search, search);
  res.json({ restaurants });
});

app.get("/api/restaurants/:id", (req, res) => {
  const restaurant = db.prepare(`
    SELECT id, name, category, description, address, delivery_fee, eta_min, eta_max, rating, is_open
    FROM restaurants WHERE id = ?
  `).get(Number(req.params.id));
  if (!restaurant) return res.status(404).json({ error: "Restaurant not found." });
  const menu = db.prepare(`
    SELECT id, restaurant_id, name, description, price, available
    FROM menu_items WHERE restaurant_id = ? AND available = 1 ORDER BY id
  `).all(restaurant.id);
  res.json({ restaurant, menu });
});

app.post("/api/orders", requireAuth, requireRole("customer"), (req, res) => {
  const restaurantId = Number(req.body.restaurantId);
  const address = typeof req.body.address === "string" ? req.body.address.trim() : "";
  const note = typeof req.body.note === "string" ? req.body.note.trim().slice(0, 500) : "";
  const paymentMethod = req.body.paymentMethod;
  const items = req.body.items;
  if (!Number.isInteger(restaurantId) || !address || address.length > 300) {
    return res.status(400).json({ error: "Choose a restaurant and enter a delivery address." });
  }
  if (!["card_demo", "cash_demo"].includes(paymentMethod)) {
    return res.status(400).json({ error: "Choose one of the demo payment options." });
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > 40) {
    return res.status(400).json({ error: "Add between 1 and 40 menu items to your order." });
  }
  const restaurant = db.prepare("SELECT id, delivery_fee FROM restaurants WHERE id = ? AND is_open = 1").get(restaurantId);
  if (!restaurant) return res.status(404).json({ error: "This restaurant is unavailable." });
  const menu = db.prepare("SELECT id, name, price FROM menu_items WHERE restaurant_id = ? AND available = 1").all(restaurantId);
  const menuById = new Map(menu.map((item) => [item.id, item]));
  const normalized = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return res.status(400).json({ error: "One or more menu items or quantities are invalid." });
    }
    const item = menuById.get(Number(raw.id));
    const quantity = Number(raw.quantity);
    if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return res.status(400).json({ error: "One or more menu items or quantities are invalid." });
    }
    normalized.push({ ...item, quantity });
  }
  const subtotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceFee = Math.round(subtotal * 0.05);
  db.exec("BEGIN IMMEDIATE");
  let orderId;
  try {
    const result = db.prepare(`
      INSERT INTO orders (customer_id, restaurant_id, status, delivery_address, delivery_note,
        payment_method, subtotal, delivery_fee, service_fee, total)
      VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, restaurantId, address, note, paymentMethod, subtotal, restaurant.delivery_fee, serviceFee, subtotal + restaurant.delivery_fee + serviceFee);
    orderId = Number(result.lastInsertRowid);
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);
    normalized.forEach((item) => insertItem.run(orderId, item.id, item.name, item.price, item.quantity));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  res.status(201).json({ order: orderQuery("o.id = ?", [orderId])[0], paymentNotice: "Demo payment only. No charge was made." });
});

app.get("/api/orders/mine", requireAuth, (req, res) => {
  let orders;
  if (req.user.role === "customer") orders = orderQuery("o.customer_id = ?", [req.user.id]);
  else if (req.user.role === "driver") orders = orderQuery("o.driver_id = ?", [req.user.id]);
  else orders = orderQuery("r.owner_id = ?", [req.user.id]);
  res.json({ orders });
});

app.get("/api/business/restaurant", requireAuth, requireRole("business"), (req, res) => {
  const restaurant = db.prepare("SELECT * FROM restaurants WHERE owner_id = ?").get(req.user.id);
  if (!restaurant) return res.status(404).json({ error: "No restaurant is connected to this account." });
  res.json({ restaurant });
});

app.patch("/api/business/restaurant", requireAuth, requireRole("business"), (req, res) => {
  const restaurant = db.prepare("SELECT id, is_open FROM restaurants WHERE owner_id = ?").get(req.user.id);
  if (!restaurant) return res.status(404).json({ error: "No restaurant is connected to this account." });
  const name = validateString(req.body.name, "Restaurant name", 120);
  const category = validateString(req.body.category, "Category", 80);
  const address = validateString(req.body.address, "Address", 300);
  const description = typeof req.body.description === "string" ? req.body.description.trim().slice(0, 500) : "";
  if (req.body.isOpen !== undefined && typeof req.body.isOpen !== "boolean") {
    return res.status(400).json({ error: "Restaurant availability must be true or false." });
  }
  const isOpen = req.body.isOpen === undefined ? restaurant.is_open : Number(req.body.isOpen);
  db.prepare("UPDATE restaurants SET name = ?, category = ?, address = ?, description = ?, is_open = ? WHERE id = ?")
    .run(name, category, address, description, isOpen, restaurant.id);
  res.json({ restaurant: db.prepare("SELECT * FROM restaurants WHERE id = ?").get(restaurant.id) });
});

app.get("/api/business/menu", requireAuth, requireRole("business"), (req, res) => {
  const restaurant = db.prepare("SELECT id FROM restaurants WHERE owner_id = ?").get(req.user.id);
  if (!restaurant) return res.status(404).json({ error: "No restaurant is connected to this account." });
  const menu = db.prepare("SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY id DESC").all(restaurant.id);
  res.json({ menu });
});

app.post("/api/business/menu", requireAuth, requireRole("business"), (req, res) => {
  const restaurant = db.prepare("SELECT id FROM restaurants WHERE owner_id = ?").get(req.user.id);
  if (!restaurant) return res.status(404).json({ error: "No restaurant is connected to this account." });
  const name = validateString(req.body.name, "Item name", 120);
  const description = typeof req.body.description === "string" ? req.body.description.trim().slice(0, 300) : "";
  const price = Number(req.body.price);
  if (!Number.isSafeInteger(price) || price < 1 || price > 100000000) {
    return res.status(400).json({ error: "Enter a valid item price in naira." });
  }
  const result = db.prepare("INSERT INTO menu_items (restaurant_id, name, description, price) VALUES (?, ?, ?, ?)")
    .run(restaurant.id, name, description, price);
  res.status(201).json({ item: db.prepare("SELECT * FROM menu_items WHERE id = ?").get(Number(result.lastInsertRowid)) });
});

app.patch("/api/business/menu/:id", requireAuth, requireRole("business"), (req, res) => {
  const restaurant = db.prepare("SELECT id FROM restaurants WHERE owner_id = ?").get(req.user.id);
  if (!restaurant) return res.status(404).json({ error: "No restaurant is connected to this account." });
  const item = db.prepare("SELECT * FROM menu_items WHERE id = ? AND restaurant_id = ?").get(Number(req.params.id), restaurant.id);
  if (!item) return res.status(404).json({ error: "Menu item not found." });
  const name = req.body.name === undefined ? item.name : validateString(req.body.name, "Item name", 120);
  const description = req.body.description === undefined ? item.description : String(req.body.description).trim().slice(0, 300);
  const price = req.body.price === undefined ? item.price : Number(req.body.price);
  if (req.body.available !== undefined && typeof req.body.available !== "boolean") {
    return res.status(400).json({ error: "Availability must be true or false." });
  }
  const available = req.body.available === undefined ? item.available : Number(req.body.available);
  if (!Number.isSafeInteger(price) || price < 1 || price > 100000000) {
    return res.status(400).json({ error: "Enter a valid item price in naira." });
  }
  db.prepare("UPDATE menu_items SET name = ?, description = ?, price = ?, available = ? WHERE id = ?")
    .run(name, description, price, available, item.id);
  res.json({ item: db.prepare("SELECT * FROM menu_items WHERE id = ?").get(item.id) });
});

app.get("/api/business/orders", requireAuth, requireRole("business"), (req, res) => {
  const restaurant = db.prepare("SELECT id FROM restaurants WHERE owner_id = ?").get(req.user.id);
  if (!restaurant) return res.status(404).json({ error: "No restaurant is connected to this account." });
  res.json({ orders: orderQuery("o.restaurant_id = ?", [restaurant.id]) });
});

app.patch("/api/business/orders/:id/status", requireAuth, requireRole("business"), (req, res) => {
  const restaurant = db.prepare("SELECT id FROM restaurants WHERE owner_id = ?").get(req.user.id);
  if (!restaurant) return res.status(404).json({ error: "No restaurant is connected to this account." });
  const order = db.prepare("SELECT id, status FROM orders WHERE id = ? AND restaurant_id = ?").get(Number(req.params.id), restaurant.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  const transitions = {
    pending: ["accepted", "rejected"],
    accepted: ["preparing", "rejected"],
    preparing: ["ready"],
  };
  const nextStatus = req.body.status;
  if (!transitions[order.status]?.includes(nextStatus)) {
    return res.status(409).json({ error: `Cannot change an order from ${order.status} to ${nextStatus}.` });
  }
  db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(nextStatus, order.id);
  res.json({ order: orderQuery("o.id = ?", [order.id])[0] });
});

app.get("/api/driver/jobs", requireAuth, requireRole("driver"), (_req, res) => {
  res.json({ orders: orderQuery("o.status = 'ready' AND o.driver_id IS NULL", []) });
});

app.post("/api/driver/jobs/:id/accept", requireAuth, requireRole("driver"), (req, res) => {
  const result = db.prepare(`
    UPDATE orders SET driver_id = ?, updated_at = datetime('now')
    WHERE id = ? AND status = 'ready' AND driver_id IS NULL
  `).run(req.user.id, Number(req.params.id));
  if (result.changes !== 1) return res.status(409).json({ error: "This delivery is no longer available." });
  res.json({ order: orderQuery("o.id = ?", [Number(req.params.id)])[0] });
});

app.patch("/api/driver/orders/:id/status", requireAuth, requireRole("driver"), (req, res) => {
  const order = db.prepare("SELECT id, status FROM orders WHERE id = ? AND driver_id = ?").get(Number(req.params.id), req.user.id);
  if (!order) return res.status(404).json({ error: "Assigned delivery not found." });
  const transitions = { ready: "picked_up", picked_up: "delivered" };
  if (transitions[order.status] !== req.body.status) {
    return res.status(409).json({ error: `Cannot change an order from ${order.status} to ${req.body.status}.` });
  }
  db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(req.body.status, order.id);
  res.json({ order: orderQuery("o.id = ?", [order.id])[0] });
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found." }));
app.get("/", (_req, res) => res.json({ name: "LocalBite API", health: "/api/health" }));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (res.headersSent) return;
  res.status(error.status || 500).json({
    error: error.status ? error.message : "Something went wrong. Please try again.",
  });
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`LocalBite is running at http://localhost:${PORT}`);
  });

  function shutdown() {
    server.close(() => {
      db.close();
      process.exit(0);
    });
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = app;
