const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const configuredPath = process.env.DATABASE_PATH || "./data/localbite.sqlite";
const databasePath = path.isAbsolute(configuredPath)
  ? configuredPath
  : path.resolve(__dirname, configuredPath);
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);
db.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'business', 'driver')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL,
    delivery_fee INTEGER NOT NULL DEFAULT 70000,
    eta_min INTEGER NOT NULL DEFAULT 20,
    eta_max INTEGER NOT NULL DEFAULT 35,
    rating REAL NOT NULL DEFAULT 4.8,
    is_open INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL CHECK (price >= 0),
    available INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id),
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
    driver_id INTEGER REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered', 'rejected')),
    delivery_address TEXT NOT NULL,
    delivery_note TEXT NOT NULL DEFAULT '',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card_demo', 'cash_demo')),
    subtotal INTEGER NOT NULL,
    delivery_fee INTEGER NOT NULL,
    service_fee INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 20)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expires INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires);
  CREATE INDEX IF NOT EXISTS idx_menu_restaurant ON menu_items(restaurant_id);
  CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id, status);
  CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver_id, status);
`);

db.exec("UPDATE restaurants SET delivery_fee = delivery_fee * 100 WHERE delivery_fee > 0 AND delivery_fee < 10000");

const restaurantCount = db.prepare("SELECT COUNT(*) AS count FROM restaurants").get().count;
if (restaurantCount === 0) {
  const insertRestaurant = db.prepare(`
    INSERT INTO restaurants (name, category, description, address, delivery_fee, eta_min, eta_max, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO menu_items (restaurant_id, name, description, price) VALUES (?, ?, ?, ?)
  `);
  db.exec("BEGIN IMMEDIATE");
  try {
    const mama = insertRestaurant.run(
      "Mama's Place", "Nigerian", "Smoky party jollof and neighborhood favorites.",
      "14 Admiralty Way, Lekki Phase 1, Lagos", 70000, 25, 35, 4.8,
    ).lastInsertRowid;
    const burger = insertRestaurant.run(
      "Burger Hub", "Burgers", "Hand-pressed burgers, golden fries, and cold drinks.",
      "8 Akin Adesola Street, Victoria Island, Lagos", 60000, 20, 30, 4.7,
    ).lastInsertRowid;
    const bowl = insertRestaurant.run(
      "Green Bowl Kitchen", "Healthy", "Fresh bowls and bright flavors, made to order.",
      "21 Awolowo Road, Ikoyi, Lagos", 80000, 25, 40, 4.9,
    ).lastInsertRowid;
    [
      [mama, "Jollof rice & chicken", "Smoky party rice with tender grilled chicken.", 250000],
      [mama, "Suya bowl", "Spiced beef, rice, fresh slaw, and suya pepper.", 320000],
      [mama, "Sweet fried plantain", "Golden ripe plantain, fried fresh.", 140000],
      [mama, "Fresh hibiscus zobo", "Chilled hibiscus and ginger drink.", 70000],
      [burger, "Classic smash burger", "Double patty, cheddar, lettuce, house sauce.", 380000],
      [burger, "Crispy chicken burger", "Buttermilk chicken, pickles, and slaw.", 350000],
      [burger, "Golden fries", "Crispy skin-on fries with sea salt.", 120000],
      [bowl, "Harvest grain bowl", "Brown rice, avocado, roasted vegetables.", 420000],
      [bowl, "Citrus chicken salad", "Grilled chicken, greens, citrus dressing.", 390000],
    ].forEach((item) => insertItem.run(...item));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

module.exports = db;
