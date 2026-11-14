const screenElement = document.querySelector("#screen");
const navElement = document.querySelector("#side-nav");
const mobileNavElement = document.querySelector("#mobile-nav");
const toastElement = document.querySelector("#toast");
const titleElement = document.querySelector("#page-title");
const eyebrowElement = document.querySelector("#topbar-eyebrow");
const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

const state = {
  user: null,
  screen: "home",
  restaurants: [],
  restaurant: null,
  menu: [],
  cart: new Map(),
  orders: [],
  businessRestaurant: null,
  businessOrders: [],
  businessMenu: [],
  driverJobs: [],
  driverOrders: [],
  search: "",
};

const navigation = {
  customer: [
    { id: "home", icon: "⌂", label: "Discover" },
    { id: "orders", icon: "▤", label: "My orders" },
    { id: "cart", icon: "♧", label: "My basket" },
  ],
  business: [
    { id: "home", icon: "▦", label: "Overview" },
    { id: "orders", icon: "▤", label: "Orders" },
    { id: "menu", icon: "☷", label: "Menu" },
    { id: "settings", icon: "⚙", label: "Restaurant profile" },
  ],
  driver: [
    { id: "home", icon: "⌖", label: "Available jobs" },
    { id: "orders", icon: "↗", label: "My deliveries" },
  ],
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function formatPrice(value) {
  return money.format(Number(value || 0) / 100);
}

function toast(message, isError = false) {
  toastElement.textContent = message;
  toastElement.classList.toggle("is-error", isError);
  toastElement.classList.add("is-visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastElement.classList.remove("is-visible"), 3300);
}

async function api(url, options = {}) {
  const response = await fetch(window.LOCALBITE_API_URL(url), {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}

function setLoading(message = "Loading your LocalBite space…") {
  screenElement.innerHTML = `<div class="loading-card"><span class="spinner"></span><p>${escapeHtml(message)}</p></div>`;
}

function setHeading(title, eyebrow) {
  titleElement.textContent = title;
  eyebrowElement.textContent = eyebrow;
}

function renderNavigation() {
  const items = navigation[state.user.role];
  const link = (item) => `
    <button class="nav-link ${state.screen === item.id ? "is-active" : ""}" type="button" data-screen="${item.id}">
      <span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>
    </button>`;
  navElement.innerHTML = items.map(link).join("");
  mobileNavElement.innerHTML = items.slice(0, 4).map(link).join("");
  mobileNavElement.style.gridTemplateColumns = `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`;
  document.querySelector("#sidebar-role").textContent = `${state.user.role} workspace`;
  document.querySelector("#user-name").textContent = state.user.name;
  document.querySelector("#user-role").textContent = state.user.role;
  document.querySelector("#user-avatar").textContent = state.user.name.trim().charAt(0).toUpperCase();
}

function statusChip(status) {
  return `<span class="status status--${escapeHtml(status)}">${escapeHtml(status.replaceAll("_", " "))}</span>`;
}

function emptyState(icon, heading, body, button = "") {
  return `<div class="empty-state"><span class="empty-icon" aria-hidden="true">${icon}</span><h2>${heading}</h2><p>${body}</p>${button}</div>`;
}

function renderRestaurantCards(restaurants) {
  if (!restaurants.length) return emptyState("⌕", "No kitchens found", "Try another search, or check back soon for more local restaurants.");
  const tones = ["", "green", "rose"];
  return `<div class="restaurant-grid">${restaurants.map((restaurant, index) => `
    <button class="restaurant-card" type="button" data-open-restaurant="${restaurant.id}" aria-label="View ${escapeHtml(restaurant.name)} menu">
      <div class="restaurant-art" data-tone="${tones[index % tones.length]}"><span class="restaurant-tag">${escapeHtml(restaurant.category)}</span></div>
      <div class="restaurant-info">
        <div class="restaurant-title-row"><h3>${escapeHtml(restaurant.name)}</h3><span class="rating">★ ${Number(restaurant.rating).toFixed(1)}</span></div>
        <p>${escapeHtml(restaurant.description || "Fresh local favorites made to order.")}</p>
        <div class="restaurant-meta"><span>${restaurant.is_open ? "Open now" : "Closed"}</span><span>${restaurant.eta_min}–${restaurant.eta_max} min</span><span>${formatPrice(restaurant.delivery_fee)} delivery</span></div>
      </div>
    </button>`).join("")}</div>`;
}

async function loadRestaurants() {
  const data = await api(`/api/restaurants?q=${encodeURIComponent(state.search)}`);
  state.restaurants = data.restaurants;
  renderCustomerHome();
}

function renderCustomerHome() {
  state.screen = "home";
  setHeading("Discover good food", "YOUR LOCAL FOOD COMMUNITY");
  renderNavigation();
  screenElement.innerHTML = `
    <section class="welcome-banner">
      <div class="welcome-copy">
        <div class="location-pill"><span>⌖</span> Delivering around Lagos</div>
        <h2>Your neighborhood,<br>hungry?</h2>
        <p>Find something delicious from the kitchens just around your corner.</p>
      </div>
      <div class="banner-art" aria-hidden="true"></div>
    </section>
    <div class="search-row">
      <label class="search-box"><span aria-hidden="true">⌕</span><input id="restaurant-search" type="search" value="${escapeHtml(state.search)}" placeholder="Search restaurants or food" aria-label="Search restaurants or food"></label>
      <span class="filter-chip">★ Top rated</span>
    </div>
    <div class="section-heading"><div><h2>Popular near you</h2><p>${state.restaurants.length} local ${state.restaurants.length === 1 ? "kitchen" : "kitchens"} ready to serve</p></div></div>
    ${renderRestaurantCards(state.restaurants)}`;
}

async function openRestaurant(id) {
  setLoading("Opening the menu…");
  const data = await api(`/api/restaurants/${Number(id)}`);
  state.restaurant = data.restaurant;
  state.menu = data.menu;
  state.screen = "restaurant";
  renderNavigation();
  setHeading(state.restaurant.name, "FRESH FROM YOUR NEIGHBORHOOD");
  const cartCount = [...state.cart.values()].reduce((sum, item) => sum + item.quantity, 0);
  screenElement.innerHTML = `
    <div class="breadcrumb"><button type="button" data-screen="home">Discover</button><span>›</span><span>${escapeHtml(state.restaurant.name)}</span></div>
    <section class="detail-hero">
      <div class="detail-hero-art" aria-hidden="true"></div>
      <div class="detail-copy">
        <span class="section-label">${escapeHtml(state.restaurant.category)} KITCHEN</span>
        <h2>${escapeHtml(state.restaurant.name)}</h2>
        <p>${escapeHtml(state.restaurant.description)}</p>
        <div class="detail-facts"><span>★ ${Number(state.restaurant.rating).toFixed(1)}</span><span>${state.restaurant.eta_min}–${state.restaurant.eta_max} min</span><span>${formatPrice(state.restaurant.delivery_fee)} delivery</span></div>
      </div>
    </section>
    <div class="section-heading"><div><h2>Popular dishes</h2><p>Made fresh and ready for your table.</p></div></div>
    ${state.menu.length ? `<div class="menu-grid">${state.menu.map((item) => {
      const current = state.cart.get(item.id)?.quantity || 0;
      return `<article class="menu-card">
        <div class="menu-art" aria-hidden="true"></div>
        <div class="menu-card-copy"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p>
          <div class="menu-card-bottom"><span class="price">${formatPrice(item.price)}</span>
            ${current
              ? `<div class="qty-control"><button type="button" data-cart-change="${item.id}" data-delta="-1" aria-label="Remove one ${escapeHtml(item.name)}">−</button><output>${current}</output><button type="button" data-cart-change="${item.id}" data-delta="1" aria-label="Add one ${escapeHtml(item.name)}">+</button></div>`
              : `<button class="button button--small" type="button" data-cart-change="${item.id}" data-delta="1">Add +</button>`}
          </div>
        </div>
      </article>`;
    }).join("")}</div>` : emptyState("☷", "Menu coming soon", "This kitchen is setting up its menu. Check back shortly.")}
    ${cartCount ? `<div class="sticky-cart"><div><strong>${cartCount} ${cartCount === 1 ? "item" : "items"}</strong><small>Added to your basket</small></div><button class="button" type="button" data-screen="cart">View basket →</button></div>` : ""}`;
}

function cartTotals() {
  const items = [...state.cart.values()];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = state.restaurant?.delivery_fee || 0;
  const serviceFee = Math.round(subtotal * 0.05);
  return { items, subtotal, deliveryFee, serviceFee, total: subtotal + deliveryFee + serviceFee };
}

function renderCart() {
  state.screen = "cart";
  renderNavigation();
  setHeading("Your basket", "READY WHEN YOU ARE");
  const { items, subtotal, deliveryFee, serviceFee, total } = cartTotals();
  if (!items.length || !state.restaurant) {
    screenElement.innerHTML = emptyState("♧", "Your basket is waiting", "Explore nearby kitchens and add a dish you love.", `<button class="button" type="button" data-screen="home">Explore restaurants</button>`);
    return;
  }
  screenElement.innerHTML = `
    <div class="section-heading"><div><h2>From ${escapeHtml(state.restaurant.name)}</h2><p>Review your dishes before checkout.</p></div><button class="text-link" type="button" data-screen="restaurant">Add more items</button></div>
    <div class="two-column">
      <section class="panel"><div class="order-list">${items.map((item) => `
        <article class="order-card"><div class="order-card-head"><div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p></div><strong class="price">${formatPrice(item.price * item.quantity)}</strong></div>
          <div class="order-card-foot"><span class="price">${formatPrice(item.price)} each</span>
            <div class="qty-control"><button type="button" data-cart-change="${item.id}" data-delta="-1" aria-label="Remove one ${escapeHtml(item.name)}">−</button><output>${item.quantity}</output><button type="button" data-cart-change="${item.id}" data-delta="1" aria-label="Add one ${escapeHtml(item.name)}">+</button></div>
          </div>
        </article>`).join("")}</div></section>
      <aside class="panel"><h2>Delivery details</h2><p class="panel-subtitle">A demo address is fine for testing. No courier will be dispatched.</p>
        <form class="form-stack" data-form="checkout">
          <div class="field"><label for="delivery-address">Delivery address</label><input id="delivery-address" name="address" autocomplete="street-address" placeholder="Street, neighborhood, city" required></div>
          <div class="field"><label for="delivery-note">Note for the kitchen or driver</label><textarea id="delivery-note" name="note" placeholder="Apartment, gate code, no onions…"></textarea></div>
          <div class="field"><label for="payment-method">Demo payment option</label><select id="payment-method" name="paymentMethod"><option value="card_demo">Card (demo only — no charge)</option><option value="cash_demo">Cash (demo selection)</option></select></div>
          <div class="summary-row"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
          <div class="summary-row"><span>Delivery</span><strong>${formatPrice(deliveryFee)}</strong></div>
          <div class="summary-row"><span>Service fee</span><strong>${formatPrice(serviceFee)}</strong></div>
          <div class="summary-row summary-total"><span>Total</span><strong>${formatPrice(total)}</strong></div>
          <div class="notice">Demo checkout only. Selecting a payment option does not charge you.</div>
          <button class="button button--wide" type="submit">Place demo order · ${formatPrice(total)} <span aria-hidden="true">→</span></button>
        </form>
      </aside>
    </div>`;
}

function orderCard(order, role) {
  const label = role === "business" ? `Order #${order.id} · ${escapeHtml(order.customer_name)}` : `Order #${order.id} · ${escapeHtml(order.restaurant_name)}`;
  const address = role === "business" ? order.delivery_address : order.delivery_address;
  let action = "";
  if (role === "business") {
    const next = { pending: ["accepted", "Accept order"], accepted: ["preparing", "Start preparing"], preparing: ["ready", "Mark ready for pickup"] }[order.status];
    if (next) action = `<button class="button button--small" type="button" data-business-status="${order.id}" data-status="${next[0]}">${next[1]}</button>`;
    if (["pending", "accepted"].includes(order.status)) action += `<button class="button button--danger button--small" type="button" data-business-status="${order.id}" data-status="rejected">Decline</button>`;
  }
  if (role === "driver" && order.status === "ready" && !order.driver_id) {
    action = `<button class="button button--small" type="button" data-driver-accept="${order.id}">Accept delivery</button>`;
  } else if (role === "driver" && order.status === "ready" && order.driver_id) {
    action = `<button class="button button--small" type="button" data-driver-status="${order.id}" data-status="picked_up">Confirm pickup</button>`;
  } else if (role === "driver" && order.status === "picked_up") {
    action = `<button class="button button--small" type="button" data-driver-status="${order.id}" data-status="delivered">Complete delivery</button>`;
  }
  return `<article class="order-card">
    <div class="order-card-head"><div><h3>${label}</h3><p>${role === "business" ? "Delivery to" : "Delivering to"} ${escapeHtml(address)}</p>${role === "driver" && order.customer_name ? `<p>Customer: ${escapeHtml(order.customer_name)}</p>` : ""}</div>${statusChip(order.status)}</div>
    <div class="order-items">${order.items.map((item) => `<div>${item.quantity} × ${escapeHtml(item.item_name)} <span>· ${formatPrice(item.unit_price * item.quantity)}</span></div>`).join("")}</div>
    <div class="order-card-foot"><span class="order-total">${formatPrice(order.total)}</span><span class="muted-copy">${new Date(`${order.created_at.replace(" ", "T")}Z`).toLocaleString()}</span></div>
    ${order.delivery_note ? `<p class="order-note">Note: ${escapeHtml(order.delivery_note)}</p>` : ""}
    ${action ? `<div class="order-actions">${action}</div>` : ""}
    ${role === "driver" && order.driver_id ? `<div class="notice">Pickup: ${escapeHtml(order.restaurant_name)} · ${escapeHtml(order.delivery_address)}</div>` : ""}
  </article>`;
}

async function loadCustomerOrders() {
  setLoading("Loading your orders…");
  const data = await api("/api/orders/mine");
  state.orders = data.orders;
  renderCustomerOrders();
}

function renderCustomerOrders() {
  state.screen = "orders";
  renderNavigation();
  setHeading("Your orders", "EVERY GOOD BITE, IN ONE PLACE");
  const current = state.orders.filter((order) => !["delivered", "rejected"].includes(order.status));
  screenElement.innerHTML = `<div class="section-heading"><div><h2>Order history</h2><p>See what’s cooking and follow each order’s progress.</p></div><button class="button button--soft button--small" type="button" data-action="refresh-customer-orders">Refresh</button></div>
    ${current.length || state.orders.length ? `<div class="order-list">${[...current, ...state.orders.filter((order) => ["delivered", "rejected"].includes(order.status))].map((order) => orderCard(order, "customer")).join("")}</div>` : emptyState("▤", "No orders just yet", "Your next favorite local meal is only a few taps away.", `<button class="button" type="button" data-screen="home">Find a restaurant</button>`)}`;
}

async function loadBusinessData() {
  setLoading("Loading your restaurant workspace…");
  const [restaurantData, orderData, menuData] = await Promise.all([
    api("/api/business/restaurant"),
    api("/api/business/orders"),
    api("/api/business/menu"),
  ]);
  state.businessRestaurant = restaurantData.restaurant;
  state.businessOrders = orderData.orders;
  state.businessMenu = menuData.menu;
  if (state.screen === "home") renderBusinessHome();
  else if (state.screen === "orders") renderBusinessOrders();
  else if (state.screen === "menu") await loadBusinessMenu();
  else renderBusinessSettings();
}

function businessStats() {
  const today = new Date().toISOString().slice(0, 10);
  const todaysOrders = state.businessOrders.filter((order) => order.created_at.startsWith(today));
  const sales = todaysOrders.filter((order) => !["rejected"].includes(order.status)).reduce((sum, order) => sum + order.total, 0);
  const openOrders = state.businessOrders.filter((order) => !["delivered", "rejected"].includes(order.status)).length;
  return { sales, openOrders, todaysCount: todaysOrders.length };
}

function renderBusinessHome() {
  state.screen = "home";
  renderNavigation();
  setHeading("Restaurant overview", "YOUR KITCHEN AT A GLANCE");
  const stats = businessStats();
  const latest = state.businessOrders.slice(0, 4);
  screenElement.innerHTML = `
    <section class="welcome-banner"><div class="welcome-copy"><div class="location-pill"><span>⌂</span> ${escapeHtml(state.businessRestaurant.name)}</div><h2>Let’s make today<br>delicious.</h2><p>Review your new orders and keep your menu fresh.</p></div><div class="banner-art" aria-hidden="true"></div></section>
    <div class="stat-grid">
      <article class="stat-card"><span>Today's sales</span><strong>${formatPrice(stats.sales)}</strong><small>From ${stats.todaysCount} orders today</small></article>
      <article class="stat-card"><span>Open orders</span><strong>${stats.openOrders}</strong><small>Orders that need attention</small></article>
      <article class="stat-card"><span>Menu items</span><strong>${state.businessMenu.length || "—"}</strong><small>Manage availability and prices</small></article>
    </div>
    <div class="section-heading"><div><h2>Recent orders</h2><p>Move each order through your kitchen.</p></div><button class="text-link" type="button" data-screen="orders">All orders →</button></div>
    ${latest.length ? `<div class="order-list">${latest.map((order) => orderCard(order, "business")).join("")}</div>` : emptyState("▤", "Your first order will appear here", "When a customer orders from your restaurant, you can accept and prepare it here.", `<button class="button" type="button" data-screen="menu">Set up your menu</button>`)}`;
}

function renderBusinessOrders() {
  state.screen = "orders";
  renderNavigation();
  setHeading("Manage orders", "FROM NEW TO READY FOR PICKUP");
  screenElement.innerHTML = `<div class="section-heading"><div><h2>Kitchen order board</h2><p>Accept incoming orders and update customers as you prepare them.</p></div><button class="button button--soft button--small" type="button" data-action="refresh-business">Refresh</button></div>
    ${state.businessOrders.length ? `<div class="order-list">${state.businessOrders.map((order) => orderCard(order, "business")).join("")}</div>` : emptyState("▤", "No orders to prepare", "New customer orders will show up here once your menu is live.")}`;
}

async function loadBusinessMenu() {
  const data = await api("/api/business/menu");
  state.businessMenu = data.menu;
  renderBusinessMenu();
}

function renderBusinessMenu() {
  state.screen = "menu";
  renderNavigation();
  setHeading("Menu management", "YOUR DISHES, YOUR WAY");
  screenElement.innerHTML = `
    <div class="section-heading"><div><h2>${escapeHtml(state.businessRestaurant.name)} menu</h2><p>Add dishes, edit prices, and mark items available or sold out.</p></div></div>
    <section class="panel">
      <h2>Add a menu item</h2><p class="panel-subtitle">Prices are entered in naira. Changes are saved to your local database.</p>
      <form class="inline-form" data-form="add-menu">
        <div class="field"><label for="menu-name">Dish name</label><input id="menu-name" name="name" placeholder="e.g. Jollof rice" required maxlength="120"></div>
        <div class="field"><label for="menu-description">Description</label><input id="menu-description" name="description" placeholder="Short description" maxlength="300"></div>
        <div class="field"><label for="menu-price">Price (₦)</label><input id="menu-price" name="price" type="number" min="1" step="1" placeholder="2500" required></div>
        <button class="button" type="submit">Add dish</button>
      </form>
      ${state.businessMenu.length ? `<div class="menu-manage-list">${state.businessMenu.map((item) => `
        <div class="menu-manage-row">
          <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.description)}</small></div>
          <input type="number" min="1" step="1" value="${Math.round(item.price / 100)}" aria-label="Price for ${escapeHtml(item.name)}" data-menu-price="${item.id}">
          <div class="availability-control"><button class="button ${item.available ? "button--soft" : ""} button--small" type="button" data-menu-toggle="${item.id}" data-available="${item.available ? "0" : "1"}">${item.available ? "Available" : "Sold out"}</button></div>
        </div>`).join("")}</div>` : emptyState("☷", "Your menu is ready for its first dish", "Add your signature plate above to let customers discover it.") }
    </section>`;
}

function renderBusinessSettings() {
  state.screen = "settings";
  renderNavigation();
  setHeading("Restaurant profile", "YOUR PLACE, YOUR DETAILS");
  const restaurant = state.businessRestaurant;
  screenElement.innerHTML = `
    <div class="section-heading"><div><h2>Restaurant details</h2><p>These details appear to customers browsing nearby.</p></div></div>
    <section class="panel">
      <form class="form-stack" data-form="restaurant-profile">
        <div class="field"><label for="business-name">Restaurant name</label><input id="business-name" name="name" value="${escapeHtml(restaurant.name)}" required maxlength="120"></div>
        <div class="form-row">
          <div class="field"><label for="business-category">Cuisine / category</label><input id="business-category" name="category" value="${escapeHtml(restaurant.category)}" required maxlength="80"></div>
          <div class="field"><label for="business-address">Restaurant address</label><input id="business-address" name="address" value="${escapeHtml(restaurant.address)}" required maxlength="300"></div>
        </div>
        <div class="field"><label for="business-description">Description</label><textarea id="business-description" name="description" maxlength="500">${escapeHtml(restaurant.description)}</textarea></div>
          <label class="toggle-row"><input name="isOpen" type="checkbox" ${restaurant.is_open ? "checked" : ""}><span><strong>Accepting customer orders</strong><small>Only open restaurants with an available menu item appear in discovery.</small></span></label>
          <div class="notice">Map placement and delivery zones are demo placeholders. Configure real maps and service areas when you connect a maps provider.</div>
        <button class="button" type="submit">Save restaurant details</button>
      </form>
    </section>`;
}

async function loadDriverData() {
  setLoading("Finding deliveries near you…");
  const [jobs, assigned] = await Promise.all([
    api("/api/driver/jobs"),
    api("/api/orders/mine"),
  ]);
  state.driverJobs = jobs.orders;
  state.driverOrders = assigned.orders;
  if (state.screen === "home") renderDriverHome();
  else renderDriverOrders();
}

function renderDriverHome() {
  state.screen = "home";
  renderNavigation();
  setHeading("Nearby deliveries", "DELIVER LOCAL, EARN PER TRIP");
  screenElement.innerHTML = `
    <section class="welcome-banner"><div class="welcome-copy"><div class="location-pill"><span>⌖</span> Delivery area · Lagos</div><h2>Your next delivery<br>starts nearby.</h2><p>Choose an available pickup, then follow the address details to the customer.</p></div><div class="banner-art" aria-hidden="true"></div></section>
    <div class="section-heading"><div><h2>Available for pickup</h2><p>${state.driverJobs.length} ready ${state.driverJobs.length === 1 ? "order" : "orders"} in the demo dispatch board.</p></div><button class="button button--soft button--small" type="button" data-action="refresh-driver">Refresh</button></div>
    ${state.driverJobs.length ? `<div class="two-column"><div class="order-list">${state.driverJobs.map((order) => orderCard(order, "driver")).join("")}</div><div class="driver-map" role="img" aria-label="Illustrative map showing restaurant pickup and customer dropoff"><span class="map-pin map-pin--pickup"><span>P</span></span><span class="map-pin map-pin--drop"><span>D</span></span><span class="map-caption">Illustrative route · Lagos</span></div></div>` : emptyState("⌖", "No delivery jobs right now", "When a restaurant marks an order ready, it will appear here. Refresh to check again.")}`;
}

function renderDriverOrders() {
  state.screen = "orders";
  renderNavigation();
  setHeading("My deliveries", "YOUR ACTIVE AND COMPLETED TRIPS");
  const orders = state.driverOrders;
  screenElement.innerHTML = `<div class="section-heading"><div><h2>Delivery history</h2><p>Pickup and drop-off details for the orders assigned to you.</p></div><button class="button button--soft button--small" type="button" data-action="refresh-driver">Refresh</button></div>
    ${orders.length ? `<div class="two-column"><div class="order-list">${orders.map((order) => orderCard(order, "driver")).join("")}</div><div class="driver-map" role="img" aria-label="Illustrative delivery map"><span class="map-pin map-pin--pickup"><span>P</span></span><span class="map-pin map-pin--drop"><span>D</span></span><span class="map-caption">Illustrative route · Lagos</span></div></div>` : emptyState("↗", "No deliveries assigned yet", "Accept a ready order from Available jobs to start your first trip.", `<button class="button" type="button" data-screen="home">Find available jobs</button>`)}`;
}

async function navigateTo(screen) {
  state.screen = screen;
  renderNavigation();
  try {
    if (state.user.role === "customer") {
      if (screen === "home") return await loadRestaurants();
      if (screen === "orders") return await loadCustomerOrders();
      if (screen === "cart") return renderCart();
      if (screen === "restaurant" && state.restaurant) return openRestaurant(state.restaurant.id);
    }
    if (state.user.role === "business") return await loadBusinessData();
    if (state.user.role === "driver") return await loadDriverData();
  } catch (error) {
    screenElement.innerHTML = emptyState("!", "We couldn't load this screen", escapeHtml(error.message), `<button class="button" type="button" data-action="retry">Try again</button>`);
  }
}

async function updateBusinessOrder(id, status) {
  await api(`/api/business/orders/${Number(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  toast(`Order updated: ${status.replaceAll("_", " ")}.`);
  await loadBusinessData();
}

async function handleSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const submitButton = form.querySelector('[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  const data = new FormData(form);
  try {
    if (form.dataset.form === "checkout") {
      const { items } = cartTotals();
      const result = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          restaurantId: state.restaurant.id,
          address: data.get("address"),
          note: data.get("note"),
          paymentMethod: data.get("paymentMethod"),
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });
      state.cart.clear();
      toast(result.paymentNotice);
      state.screen = "orders";
      await loadCustomerOrders();
    } else if (form.dataset.form === "add-menu") {
      await api("/api/business/menu", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          description: data.get("description"),
          price: Number(data.get("price")) * 100,
        }),
      });
      toast("Dish added to your menu.");
      await loadBusinessMenu();
    } else if (form.dataset.form === "restaurant-profile") {
      const result = await api("/api/business/restaurant", {
        method: "PATCH",
        body: JSON.stringify({
          name: data.get("name"),
          category: data.get("category"),
          address: data.get("address"),
          description: data.get("description"),
          isOpen: data.get("isOpen") === "on",
        }),
      });
      state.businessRestaurant = result.restaurant;
      toast("Restaurant details saved.");
      renderBusinessSettings();
    }
  } catch (error) {
    toast(error.message, true);
  } finally {
    if (submitButton?.isConnected) submitButton.disabled = false;
  }
}

async function handleClick(event) {
  const target = event.target.closest("[data-screen], [data-open-restaurant], [data-cart-change], [data-business-status], [data-driver-accept], [data-driver-status], [data-menu-toggle], [data-menu-save], [data-action]");
  if (!target) return;
  try {
    if (target.dataset.screen) return await navigateTo(target.dataset.screen);
    if (target.dataset.openRestaurant) {
      const restaurantId = Number(target.dataset.openRestaurant);
      if (state.cart.size && state.restaurant?.id !== restaurantId) {
        state.cart.clear();
        toast("Your basket was cleared because you selected a different restaurant.");
      }
      return await openRestaurant(restaurantId);
    }
    if (target.dataset.cartChange) {
      const itemId = Number(target.dataset.cartChange);
      const item = state.menu.find((entry) => entry.id === itemId) || state.cart.get(itemId);
      if (!item) throw new Error("That menu item is no longer available.");
      const quantity = (state.cart.get(itemId)?.quantity || 0) + Number(target.dataset.delta);
      if (quantity > 20) throw new Error("You can add up to 20 of one dish.");
      if (quantity < 1) state.cart.delete(itemId);
      else state.cart.set(itemId, { ...item, quantity });
      if (state.screen === "restaurant") await openRestaurant(state.restaurant.id);
      else renderCart();
      return;
    }
    if (target.dataset.businessStatus) return await updateBusinessOrder(target.dataset.businessStatus, target.dataset.status);
    if (target.dataset.driverAccept) {
      await api(`/api/driver/jobs/${Number(target.dataset.driverAccept)}/accept`, { method: "POST" });
      toast("Delivery accepted. It is now assigned to you.");
      state.screen = "orders";
      return await loadDriverData();
    }
    if (target.dataset.driverStatus) {
      await api(`/api/driver/orders/${Number(target.dataset.driverStatus)}/status`, {
        method: "PATCH", body: JSON.stringify({ status: target.dataset.status }),
      });
      toast(target.dataset.status === "delivered" ? "Delivery completed. Nice work!" : "Pickup confirmed. Head to the customer.");
      return await loadDriverData();
    }
    if (target.dataset.menuToggle) {
      await api(`/api/business/menu/${Number(target.dataset.menuToggle)}`, {
        method: "PATCH", body: JSON.stringify({ available: target.dataset.available === "1" }),
      });
      toast("Menu availability updated.");
      return await loadBusinessMenu();
    }
    if (target.dataset.action === "signout") {
      await api("/api/auth/signout", { method: "POST" });
      window.location.assign("/auth/signin.html");
      return;
    }
    if (target.dataset.action === "refresh-customer-orders") return await loadCustomerOrders();
    if (target.dataset.action === "refresh-business") return await loadBusinessData();
    if (target.dataset.action === "refresh-driver") return await loadDriverData();
    if (target.dataset.action === "retry") return await navigateTo(state.screen);
  } catch (error) {
    toast(error.message, true);
  }
}

let searchTimer;
screenElement.addEventListener("input", (event) => {
  if (event.target.id !== "restaurant-search") return;
  state.search = event.target.value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadRestaurants().catch((error) => toast(error.message, true)), 220);
});

screenElement.addEventListener("change", async (event) => {
  const input = event.target.closest("[data-menu-price]");
  if (!input) return;
  const price = Number(input.value);
  if (!Number.isSafeInteger(price) || price < 1) {
    toast("Enter a price of at least ₦1.", true);
    return loadBusinessMenu();
  }
  try {
    await api(`/api/business/menu/${Number(input.dataset.menuPrice)}`, {
      method: "PATCH", body: JSON.stringify({ price: price * 100 }),
    });
    toast("Menu price saved.");
    await loadBusinessMenu();
  } catch (error) {
    toast(error.message, true);
  }
});

screenElement.addEventListener("submit", handleSubmit);
document.addEventListener("click", handleClick);

async function startApp() {
  try {
    const { user } = await api("/api/auth/me");
    state.user = user;
    renderNavigation();
    await navigateTo("home");
  } catch {
    window.location.replace("/auth/signin.html");
  }
}

startApp();
