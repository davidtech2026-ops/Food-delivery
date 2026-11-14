# Local Food Delivery Platform – UI/UX Screen Blueprint

This is the UI/UX and implementation guide for a local food delivery app with three main users:

- Customer
- Business / Restaurant
- Driver / Delivery partner

The goal is to define how the app should feel, flow, and look. The repository now includes a frontend-first Express/SQLite implementation of the customer, business, and driver flows, alongside this UI/UX blueprint.

---

## 1. Product vision

A local food delivery platform for neighborhood restaurants that allows:

- Customers to discover nearby restaurants
- Businesses to receive and manage food orders
- Drivers to take delivery jobs and deliver orders efficiently

The design should feel fast, modern, friendly, and trust-building. Food apps need strong visual hierarchy, clear calls to action, and easy location-based browsing.

---

## 2. Design direction

### Style
- Warm, appetizing colors
- Clean white and neutral backgrounds
- Bold buttons for ordering and accepting jobs
- Rounded corners for a friendly mobile experience
- Soft shadows for cards and floating elements

### Core colors
- Primary: #EF6A3A (LocalBite orange)
- Primary hover: #D9562B
- Success: #2E8C58
- Background: #F7F6F1
- Surface: #FFFFFF
- Main text: #252720
- Muted text: #777970
- Border: #E9E8E1

### Typography
- Bold headings for restaurant names and order totals
- Medium weight for labels and summaries
- Clear spacing for readability and mobile speed

### UX principles
- Location-first experience
- Clear status feedback
- Minimal steps to order
- Fast order tracking
- Simple actions for drivers and restaurants

---

## 3. Overall app flow

Customer flow:
1. App opens to location selector
2. User sees nearby restaurants
3. User browses menu and adds food
4. User confirms order and pays
5. User tracks delivery progress

Business flow:
1. Restaurant login
2. View incoming orders
3. Accept or reject orders
4. Prepare food and mark ready for pickup
5. Track sales and earnings

Driver flow:
1. Driver sees available delivery requests near their location
2. Accepts a job
3. Picks up food from business
4. Navigates to customer address
5. Completes delivery and gets paid

---

## 4. Shared layout system

### Mobile app structure
- Top header with location and profile icon
- Search bar or category chips
- Restaurant cards or order cards
- Bottom navigation for app routes
- On desktop, use a persistent side navigation and a wider content area instead of stretching the phone layout

### Bottom navigation (shared concept)
- Home
- Explore
- Orders
- Profile

### Map/location pattern
The app should prominently show the user’s active area such as:
- “Delivering to: Lekki Phase 1, Lagos”
- Delivery radius around a pin on map
- Neighborhood filter or location switcher

This is important because food delivery relies heavily on location accuracy.

---

## 5. Customer screens

### Screen 1: Welcome / location access

This screen should feel warm and easy. It introduces the app and asks for location access.

```text
┌──────────────────────────────────┐
│  FoodieLocal                     │
│                                  │
│        🍔🍟🍕🌮                  │
│                                  │
│  Fresh food from local kitchens  │
│  delivered to your doorstep      │
│                                  │
│  [ Allow location access ]       │
│                                  │
│  Or enter location manually       │
│                                  │
│  Continue as guest               │
└──────────────────────────────────┘
```

Best practice:
- Big CTA button visible immediately
- Friendly onboarding tone
- Location permission should be clear and not intrusive

---

### Screen 2: Home / restaurants near you

This is the main customer screen. It combines a map preview, location, search, and restaurant cards.

```text
┌──────────────────────────────────┐
│  Deliver to: Lekki Phase 1      │
│  Lagos, Nigeria            [🔽]  │
├──────────────────────────────────┤
│  [ Search for food, drinks... ] │
├──────────────────────────────────┤
│   🗺️ Map Preview / delivery area │
│   📍 Pin: Lekki Phase 1         │
│   4 min delivery radius         │
├──────────────────────────────────┤
│  Popular near you                │
│  ┌───────────────┐              │
│  │ Mama's Place  │ 4.8 ★       │
│  │ Nigerian      │ 25-35 min    │
│  │ Free delivery │              │
│  └───────────────┘              │
│  ┌───────────────┐              │
│  │ Burger Hub   │ 4.7 ★       │
│  │ American     │ 20-30 min    │
│  │ 15% off      │              │
│  └───────────────┘              │
│                                  │
│  [🏠] [🔍] [🧾] [👤]             │
└──────────────────────────────────┘
```

Key UX notes:
- Put location at the very top
- Use a compact map preview for trust and clarity
- Restaurant cards should have strong food imagery and clear time/delivery info
- Use category chips if needed later

---

### Screen 3: Restaurant details / menu

```text
┌──────────────────────────────────┐
│  ← Mama's Place                  │
│  Nigerian Kitchen                │
│  4.8 ★  2.3 km  25-35 min        │
├──────────────────────────────────┤
│  [Hero image: jollof rice]      │
├──────────────────────────────────┤
│  Popular dishes                  │
│  ┌──────────────┐               │
│  │ Jollof Rice  │ ₦2,500       │
│  │ Chicken      │               │
│  └──────────────┘               │
│  ┌──────────────┐               │
│  │ Suya Bowl    │ ₦3,200       │
│  │ Spicy + rice │               │
│  └──────────────┘               │
│  ┌──────────────┐               │
│  │ Plantain set │ ₦2,100       │
│  │ with stew    │               │
│  └──────────────┘               │
│                                  │
│  [ Add to cart ]                 │
└──────────────────────────────────┘
```

UX guidance:
- Show pricing clearly
- Large food image increases appetite and conversion
- Use top-level summary info to make the restaurant trustworthy

---

### Screen 4: Cart / order summary

```text
┌──────────────────────────────────┐
│  Your cart                      │
├──────────────────────────────────┤
│  Jollof Rice x1        ₦2,500    │
│  Suya Bowl x1          ₦3,200    │
│  Plantain Set x1       ₦2,100    │
│                                  │
│  Subtotal              ₦7,800    │
│  Delivery fee          ₦700      │
│  Service fee           ₦350      │
│  Total                 ₦8,850    │
├──────────────────────────────────┤
│  Deliver to                     │
│  12 Bode Thomas Street          │
│  Lekki Phase 1, Lagos           │
├──────────────────────────────────┤
│  [ Proceed to checkout ]        │
└──────────────────────────────────┘
```

Good design pattern:
- Clean line item list
- Clear price breakdown
- Delivery address visible before checkout

---

### Screen 5: Checkout / payment

```text
┌──────────────────────────────────┐
│  Checkout                       │
├──────────────────────────────────┤
│  Delivery address               │
│  12 Bode Thomas Street          │
│  Lekki Phase 1, Lagos           │
├──────────────────────────────────┤
│  Payment method                 │
│  ○ Card ending in 4821          │
│  ○ Cash on delivery             │
│  ○ Wallet balance              │
├──────────────────────────────────┤
│  Order notes                    │
│  “No onions please”             │
├──────────────────────────────────┤
│  Total: ₦8,850                  │
│  [ Place order ]                 │
└──────────────────────────────────┘
```

UX note:
- Keep checkout minimal and not overwhelming
- Offer multiple payment methods but not too many options at once

---

### Screen 6: Order tracking

```text
┌──────────────────────────────────┐
│  Order tracking                 │
│  Order #LFD-2841                │
├──────────────────────────────────┤
│  ✅ Restaurant accepted order   │
│  ⏳ Preparing your food          │
│  🚚 Driver picked up order       │
│  🧭 On the way to you           │
├──────────────────────────────────┤
│  Driver: Tobi                  │
│  ETA: 8 mins                   │
│  📍 2.1 km away                │
├──────────────────────────────────┤
│  [ Call driver ]  [ Message ]   │
└──────────────────────────────────┘
```

This is a critical trust-building screen. Customers should see progress and ETA constantly.

---

## 6. Business / Restaurant screens

### Screen 7: Business login dashboard

```text
┌──────────────────────────────────┐
│  Restaurant Admin               │
│  Welcome, Chef Ada              │
├──────────────────────────────────┤
│  📍 Location: Lekki Phase 1     │
│  Open now: 10:00 AM – 11:00 PM │
├──────────────────────────────────┤
│  Total today                   │
│  ₦58,400                       │
│  Orders: 34                    │
├──────────────────────────────────┤
│  New orders                    │
│  • #1042 – Jollof Rice x2      │
│  • #1043 – Suya Bowl x1        │
│  • #1044 – Plantain Set x2     │
├──────────────────────────────────┤
│  [ View orders ] [ Menu ] [ Earnings ] │
└──────────────────────────────────┘
```

UX guidance:
- The dashboard should feel efficient and operational
- Revenue and order count should be immediately visible
- Restaurant managers want speed and calm control

---

### Screen 8: Incoming orders

```text
┌──────────────────────────────────┐
│  Incoming Orders                │
├──────────────────────────────────┤
│  Order #1042                    │
│  Customer: Aisha                │
│  Delivery address: ...          │
│  2 x Jollof Rice                │
│  1 x Coke                       │
│  Total: ₦4,800                  │
│  [ Accept ]   [ Reject ]        │
├──────────────────────────────────┤
│  Order #1043                    │
│  Customer: Paul                 │
│  1 x Suya Bowl                  │
│  Total: ₦3,200                  │
│  [ Accept ]   [ Reject ]        │
└──────────────────────────────────┘
```

Important UX concept:
- Clear action buttons
- Strong but not emotionally heavy feedback
- Order details must be visible in one glance

---

### Screen 9: Kitchen preparation panel

```text
┌──────────────────────────────────┐
│  Kitchen Status                 │
├──────────────────────────────────┤
│  Pending orders: 5              │
│  Ready to pickup: 2             │
├──────────────────────────────────┤
│  Order #1042                     │
│  Status: Preparing              │
│  ETA: 11 mins                   │
│  [ Mark ready ]                 │
├──────────────────────────────────┤
│  Order #1038                    │
│  Status: Ready for pickup       │
│  Driver assigned                │
│  [ Confirm pickup ]             │
└──────────────────────────────────┘
```

This is the restaurant operational view. It should be practical and compact.

---

### Screen 10: Business menu management

```text
┌──────────────────────────────────┐
│  Menu Management                │
├──────────────────────────────────┤
│  [ + Add new item ]             │
│                                  │
│  Jollof Rice                 ₦2,500 │
│  Status: Available               │
│  [ Edit ] [ Hide ]               │
│                                  │
│  Suya Bowl                   ₦3,200 │
│  Status: Available               │
│  [ Edit ] [ Hide ]               │
│                                  │
│  Plantain Set                ₦2,100 │
│  Status: Low stock              │
│  [ Edit ] [ Restock ]            │
└──────────────────────────────────┘
```

UI note:
- Simple table-like card list works well here
- Clear stock visibility helps avoid order errors

---

## 7. Driver screens

### Screen 11: Driver home / available jobs

```text
┌──────────────────────────────────┐
│  Available deliveries           │
│  Near you: Lekki Phase 1        │
├──────────────────────────────────┤
│  🗺️ Map with 3 delivery pins    │
│  Pickup / dropoff route shown   │
├──────────────────────────────────┤
│  Order #1042                    │
│  Pickup: Mama's Place           │
│  Dropoff: Lekki Phase 1         │
│  Distance: 2.8 km               │
│  Earnings: ₦1,200               │
│  [ Accept order ]               │
├──────────────────────────────────┤
│  Order #1045                    │
│  Pickup: Burger Hub             │
│  Dropoff: Ikoyi                 │
│  Distance: 4.1 km               │
│  Earnings: ₦1,600               │
│  [ Accept order ]               │
└──────────────────────────────────┘
```

This screen should feel directional and efficient. Drivers need quick decision-making and route clarity.

---

### Screen 12: Driver active order route

```text
┌──────────────────────────────────┐
│  Active order                   │
│  Order #1042                    │
├──────────────────────────────────┤
│  Pickup: Mama's Place           │
│  Restaurant accepted order      │
│  ETA to pickup: 4 mins          │
├──────────────────────────────────┤
│  Dropoff: 12 Bode Thomas St.   │
│  Customer name: Aisha           │
│  Customer phone: +234...        │
├──────────────────────────────────┤
│  [ Navigate ]  [ Call ] [ Mark picked up ] │
└──────────────────────────────────┘
```

Driver design should prioritize:
- Location visibility
- Pickup/dropoff instructions
- Minimal taps to navigate

---

### Screen 13: Delivery completion

```text
┌──────────────────────────────────┐
│  Delivery complete             │
├──────────────────────────────────┤
│  ✅ Order delivered to Aisha    │
│  Customer confirmed receipt     │
├──────────────────────────────────┤
│  Earnings: ₦1,200              │
│  Tips: ₦150                    │
│  Total: ₦1,350                 │
├──────────────────────────────────┤
│  [ Finish trip ]                │
└──────────────────────────────────┘
```

This screen should be celebratory and reassuring. It confirms payment and gives closure.

---

## 8. Shared app elements to keep consistent

### Buttons
- Primary: orange fill / rounded
- Secondary: white / dark border
- Success: green for confirmed or completed states

### Status chips
Examples:
- Preparing
- Ready for pickup
- On the way
- Delivered
- Accepted
- Rejected

### Cards
Use cards for:
- Restaurant listings
- Orders
- Deliveries
- Profit summary

### Icons to use
- Map pin
- Search
- Cart
- Restaurant
- Clock
- Wallet
- Delivery van
- Checkmark

---

## 9. Recommended user experience flow by role

### Customer UX priorities
- Quick access to nearby restaurants
- Clear menu and pricing
- Secure checkout
- Real-time tracking

### Business UX priorities
- Fast order review
- Simple accept/reject controls
- Menu management
- Daily financial visibility

### Driver UX priorities
- Available jobs map
- Pickup and dropoff clarity
- Low friction navigation
- Fast completion confirmation

---

## 10. Suggested screen set for the first frontend version

For the first frontend build, it is smart to include these screens:

Customer:
- Splash / location access
- Home page
- Restaurant detail
- Cart
- Checkout
- Order tracking

Business:
- Login dashboard
- Orders list
- Order detail
- Kitchen status
- Menu management

Driver:
- Available jobs
- Active delivery route
- Delivery completion

This gives a complete MVP view of the platform without overwhelming the project.

---

## 11. Final design recommendation

The app should feel:
- Local and warm
- Fast and reliable
- Trustworthy and easy to navigate
- Built around location, food, and live delivery updates

The key to success is a consistent mobile-first structure with a strong top-level location bar, simple cards, and clear status-driven action buttons.

---

## 12. Notes for your next step

When you begin frontend implementation, build screens in the following order:

1. Customer home screen
2. Restaurant details screen
3. Cart + checkout screen
4. Business orders dashboard
5. Driver active delivery screen

The current frontend and local Express/SQLite backend are connected for authentication, menus, orders, and delivery status. Real maps, payment processing, email notifications, and password recovery require external providers and are not enabled in the demo.

This is the foundation for a strong, scalable delivery app experience.

---

## 13. Visual screen mockups

The first-pass mobile screen concepts are available as individual SVG images. Open the [mockup gallery](./frontend/mockups/index.html) to preview them together.

### Customer
- [Welcome and location](./frontend/mockups/01-customer-welcome.svg)
- [Nearby restaurants](./frontend/mockups/02-customer-home.svg)
- [Restaurant menu](./frontend/mockups/03-customer-restaurant.svg)
- [Cart](./frontend/mockups/04-customer-cart.svg)
- [Checkout](./frontend/mockups/05-customer-checkout.svg)
- [Order tracking](./frontend/mockups/06-customer-tracking.svg)

### Business
- [Dashboard](./frontend/mockups/07-business-dashboard.svg)
- [Incoming orders](./frontend/mockups/08-business-orders.svg)
- [Kitchen board](./frontend/mockups/09-business-kitchen.svg)
- [Menu management](./frontend/mockups/10-business-menu.svg)

### Driver
- [Available deliveries](./frontend/mockups/11-driver-jobs.svg)
- [Active delivery](./frontend/mockups/12-driver-active.svg)
- [Delivery complete](./frontend/mockups/13-driver-complete.svg)

These are static design concepts. The connected app has illustrative maps and demo checkout; it does not charge a payment method or use live GPS.

---

## 14. Responsive screen sizes and vanilla frontend plan

Design the app mobile-first, but make the customer, business, and driver screens responsive on phones, tablets, and desktop browsers. The pixel sizes below are **design reference viewports**, not fixed widths for the page. The layout should adapt fluidly between them.

### Reference viewport sizes

| Device / test size | Viewport width | Viewport height | Use it to check |
|---|---:|---:|---|
| Small phone | 360 px | 800 px | Narrow Android phones; no horizontal scrolling |
| Main phone design | 390 px | 844 px | Primary reference for the supplied screen mockups |
| Large phone | 430 px | 932 px | Comfortable spacing on larger phones |
| Tablet portrait | 768 px | 1024 px | Two-column browsing and tablet dashboards |
| Laptop | 1280 px | 800 px | Desktop navigation and operational views |
| Desktop design | 1440 px | 900 px | Main desktop reference for all roles |

Use the browser viewport size when testing. The phone mockups are 390 × 844 px; do not set the actual website to a permanent 390 px width.

### Responsive breakpoints

Use a small set of consistent CSS breakpoints:

| Breakpoint | Layout behavior |
|---|---|
| Below 600 px | Phone layout; one main column; compact header; bottom navigation |
| 600–899 px | Large phone / tablet; increase page padding and use two-column cards when there is room |
| 900–1199 px | Small desktop; show side navigation and wider content grids |
| 1200 px and above | Full desktop layout; use a centered content area with a maximum width |

Prefer `min()`, `max()`, `clamp()`, flexible grid columns, and `max-width` over device-specific fixed dimensions.

### Layout dimensions and behavior

#### Phone: 360–599 px
- Page content uses the full viewport width with 16–20 px side padding.
- Restaurant cards, order forms, and checkout content use one column.
- Keep the customer location/search area near the top of the screen.
- Use a fixed bottom navigation for customer screens; reserve enough bottom padding so it never covers content.
- Keep important buttons full-width and at least 48 px high.
- Business order cards should show the most important order details and actions without horizontal scrolling.
- Driver screens should keep the route/map prominent and make the next action easy to reach.

#### Tablet: 600–899 px
- Use 24–32 px page padding.
- Customer restaurant cards can form a two-column grid.
- Keep checkout forms readable; do not stretch a single field across the full tablet width.
- Business and driver lists can sit beside a map or summary panel when the content remains comfortable to read.
- Keep touch targets large, even when there is more screen space.

#### Desktop: 900 px and wider
- Use a left sidebar around 220–250 px wide for business and driver dashboards.
- Use a top navigation for the customer experience, with location, search, and profile controls.
- Center the main page content and cap it around 1280 px wide on very wide screens.
- Customer home can use a 7/5 content split: restaurant listings on the left and a map or delivery-area panel on the right.
- Business dashboards can use a summary row above a two-column order/kitchen area.
- Driver dashboards can show a large map next to the available delivery list.
- Keep forms and text-heavy panels to a readable width instead of expanding edge to edge.

### Vanilla HTML, CSS, and JavaScript structure

The app is organized into separate deployment-ready frontend and backend projects:

```text
food-delivery/
├── frontend/
│   ├── index.html
│   ├── app.html
│   ├── auth/
│   ├── css/
│   ├── js/
│   ├── mockups/
│   └── Customer home/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── .env.example
│   ├── data/
│   └── test/
├── .gitignore
└── README.md
```

Deploy `frontend/` as a static site and deploy `backend/` as a Node.js service. Set the API origin in `frontend/js/config.js`; configure CORS and the session secret in the backend `.env`.

### Start with shared design tokens

Put colors, spacing, radii, and shadows in CSS custom properties. Reusing tokens gives plain CSS the consistency people often associate with a UI framework.

```css
:root {
  color-scheme: light;
  --color-brand: #ef6a3a;
  --color-brand-dark: #d9562b;
  --color-success: #2d9a60;
  --color-text: #20231f;
  --color-muted: #777970;
  --color-page: #f7f7f3;
  --color-surface: #ffffff;
  --color-border: #e9e9e5;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  --radius-card: 16px;
  --radius-control: 12px;
  --shadow-card: 0 8px 24px rgb(32 35 31 / 8%);
  --content-max: 1280px;
}
```

### Responsive CSS starter

Use semantic elements and component-style classes such as `.restaurant-card`, `.order-card`, `.primary-button`, and `.sidebar`. This keeps the code organized without introducing a framework.

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  color: var(--color-text);
  background: var(--color-page);
  font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
}

img {
  display: block;
  max-width: 100%;
}

.page {
  width: min(100% - 32px, var(--content-max));
  margin-inline: auto;
}

.restaurant-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
}

.restaurant-card,
.order-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.primary-button {
  min-height: 48px;
  padding: 12px 20px;
  border: 0;
  border-radius: var(--radius-control);
  color: white;
  background: var(--color-brand);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:hover {
  background: var(--color-brand-dark);
}

.primary-button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid rgb(239 106 58 / 35%);
  outline-offset: 3px;
}

@media (min-width: 600px) {
  .page {
    width: min(100% - 48px, var(--content-max));
  }

  .restaurant-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-6);
  }
}

@media (min-width: 900px) {
  .app-layout {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    min-height: 100vh;
  }

  .restaurant-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .mobile-bottom-nav {
    display: none;
  }
}
```

Treat this as a starting point: adjust the grid for each screen rather than forcing every page into the same layout. For example, the customer home needs restaurant cards and location context, while the driver view needs a map and delivery actions.

### Polish checklist

- Add `<meta name="viewport" content="width=device-width, initial-scale=1">` in every HTML page.
- Use consistent spacing, color, typography, button height, and card radius via CSS variables.
- Use real `<button>`, `<nav>`, `<main>`, `<form>`, and heading elements for accessible interactions.
- Add visible hover, focus, active, loading, empty, and error states; do not rely on color alone to communicate order status.
- Use responsive images with `object-fit: cover` and a consistent aspect ratio for restaurant and food photos.
- Test at 360, 390, 768, 1280, and 1440 px widths; confirm there is no horizontal overflow.
- Use JavaScript for interactions such as menu toggles, cart quantities, tabs, and order-status changes. The current version connects these screens to the local Express API.

These widths and patterns are the implementation guide for turning the current screen concepts into a polished responsive site using only HTML, CSS, and JavaScript.

---

## 15. Exact visual specification

Use this section as the single source of truth when building the screens. Values below describe the current LocalBite direction and the existing sign-in/sign-up styles. Screen mockups are authored at **390 × 844 CSS pixels**; responsive pages should adapt to the viewport rather than being locked to that size.

### Device and page dimensions

| Target | CSS viewport width × height | Outer page padding | Main layout |
|---|---:|---:|---|
| Compact phone | 360 × 800 px | 16 px | Single column |
| Standard phone | 390 × 844 px | 20 px | Single column |
| Large phone | 430 × 932 px | 20 px | Single column |
| Tablet portrait | 768 × 1024 px | 24 px | One or two columns, depending on screen |
| Laptop | 1280 × 800 px | 32 px | Desktop navigation and content |
| Desktop | 1440 × 900 px | 40 px | Centered content, maximum 1280 px |

- These are test sizes; real phones vary due to browser chrome and safe areas.
- The viewport meta tag must be present on each HTML page.
- Use `min-height: 100vh` for full-screen layouts; allow page content to scroll if it is taller than the viewport.
- Do not set `width: 390px` on the body or force fixed heights on forms, menus, or order lists.
- On devices with a display cutout, account for safe areas in fixed bottom navigation using `env(safe-area-inset-bottom)`.

### Responsive layout measurements

#### Customer screens
- Phone: one column; 16–20 px horizontal page padding.
- Tablet: use 24 px padding; show two restaurant cards per row when each card remains at least 250 px wide.
- Desktop: use a centered container up to 1280 px wide and a 7/5 split between restaurant browsing and map/location context.
- Restaurant image: use a consistent 4:3 or 16:10 ratio, `width: 100%`, and `object-fit: cover`.
- Customer bottom navigation: 64–72 px high, plus the device safe-area inset; hide it at desktop widths.

#### Business screens
- Phone: single-column dashboard and order cards, with actions available without horizontal scrolling.
- Tablet: two columns for summary cards or order lists if the text remains readable.
- Desktop: 220–250 px sidebar, with a flexible main area. Keep dashboard summaries above the orders and kitchen panels.
- Order cards should grow to fit their details; avoid fixed card heights that clip notes or item lists.

#### Driver screens
- Phone: map/route first, then pickup/drop-off details and one prominent next-step button.
- Tablet and desktop: show map and delivery list side-by-side when there is enough width.
- Keep the main delivery action reachable, and do not put essential route instructions only inside the map.

#### Authentication screens
- Desktop: two-column layout. Story/illustration column uses `minmax(360px, 0.88fr)` and form column uses `minmax(520px, 1.12fr)`.
- Below 1050 px: use `minmax(310px, 0.78fr)` and `minmax(500px, 1.22fr)`; reduce side padding.
- At 820 px and below: hide the story column and show the compact brand above the form.
- At 520 px and below: one-column form fields, 20 px horizontal page padding, with 16 px at 360 px and below.
- Story column: `height: 100vh`, `min-height: 100vh`, sticky at the top on desktop. Form column: at least `100vh`, but may grow and scroll.
- Signup form maximum width: 490 px. Sign-in form maximum width: 430 px. Top row maximum width: 620 px.
- At 1500 px and above, widen the two-column layout to 600 px minimum for the story panel and 650 px minimum for the form panel.

The authentication breakpoints above describe the current auth pages. For other screens, use the general mobile/tablet/desktop breakpoints in Section 14.

### Color palette

Use the uppercase hex values exactly and avoid introducing a second orange or gray without updating this table.

| Token | Hex | Use |
|---|---|---|
| `--brand` | `#EF6A3A` | Primary buttons, active links, brand mark, active status |
| `--brand-dark` | `#D9562B` | Primary hover, emphasized text links |
| `--ink` | `#252720` | Headings, primary body text, input text |
| `--muted` | `#777970` | Supporting copy, secondary information |
| `--page` | `#F7F6F1` | Overall page/background |
| `--surface` | `#FFFFFF` | Forms, cards, menus, and panels |
| `--line` | `#E9E8E1` | Card borders, separators, unselected role borders |
| `--green` | `#2E8C58` | Success, available/confirmed state, location indicator |
| Story panel base | `#F7F1E4` | Warm promotional side panel |
| Selected role background | `#FFF5EF` | Selected Customer/Business/Driver choice |
| Selected role border | `#EF9A78` | Selected role outline |
| Input border | `#E6E5DF` | Text fields and select controls |
| Input focus border | `#E99A7C` | Focused field border |
| Placeholder | `#AAA99F` | Placeholder text only |
| Label | `#4A4B44` | Form field labels and legends |
| Secondary copy | `#65665F` | Unselected role label |
| Disabled/muted icon | `#A0A097` | Input icons and inactive decorative controls |
| Error text | `#A54127` | Form validation message |
| Error surface | `#FFF4F0` | Form validation message background |
| Error border | `#F0C4B8` | Form validation message outline |
| Success text | `#276B40` | Successful local form/demo message |
| Success surface | `#EFF8F1` | Successful local form/demo message background |
| Success border | `#B9DDC4` | Successful local form/demo message outline |

Primary button hover is `#D9562B`. Primary button text is white (`#FFFFFF`). Secondary buttons use a white background, `#E9E8E1` border, and `#252720` text. Do not use the success green for a primary action.

### Typography

- Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- If Inter is not installed or bundled locally, the system fallback is expected; do not require a remote font service.
- Main display heading: `clamp(38px, 4vw, 58px)`, weight 780, line-height 1.06, letter spacing -2.7 px.
- Form page heading: `clamp(27px, 3vw, 34px)`, weight 780, line-height 1.2, letter spacing -1.25 px.
- Screen/page title: 20–24 px, weight 700–800.
- Card title: 14–16 px, weight 650–750.
- Body/supporting copy: 12–15 px, line-height 1.6–1.75.
- Form label and role text: 10–11 px, weight 650–700.
- Eyebrow / overline: 9–10 px, weight 800, letter spacing 1.2–1.25 px.
- Button label: 12–14 px, weight 700–750.
- Minimum readable text target: 12 px for normal content; reserve 9–11 px for short labels, helper text, and metadata.

### Spacing, radii, borders, and shadows

Use a consistent 4 px spacing rhythm:

| Token | Size | Example |
|---|---:|---|
| `--space-1` | 4 px | Tiny icon/text gap |
| `--space-2` | 8 px | Label-to-control and compact card gaps |
| `--space-3` | 12 px | Compact padding |
| `--space-4` | 16 px | Standard card and form spacing |
| `--space-6` | 24 px | Section spacing |
| `--space-8` | 32 px | Large section spacing |

| Element | Border radius | Border |
|---|---:|---|
| Food/restaurant/order card | 15–18 px (use 16 px by default) | 1 px solid `#E9E8E1` |
| Text input/select | 11 px | 1 px solid `#E6E5DF` |
| Role option | 11 px | 1 px solid `#E9E8E1` |
| Main button | 11–12 px | None |
| Small chip / compact control | 7–10 px | 1 px solid when outlined |
| Form message | 9 px | 1 px state-colored border |
| Avatar/food image | Circle or card radius | Usually none |

- Default card shadow: `0 8px 24px rgb(32 35 31 / 8%)`.
- Auth story/card shadow: `0 24px 70px rgb(52 47 37 / 10%)`.
- Primary button shadow: `0 7px 15px rgb(239 106 58 / 19%)`; hover `0 9px 18px rgb(217 86 43 / 22%)`.
- Dividers use 1 px `#E9E8E1`.
- Focus ring: 3 px `rgb(239 106 58 / 30%)`, offset 3 px. Role selector focus ring uses 3 px at 25% opacity and 2 px offset.

### Component measurements

| Component | Width | Height / minimum height | Notes |
|---|---|---:|---|
| Main content container | `min(100% - page gutters, 1280px)` | Auto | Centered; do not stretch beyond max |
| Desktop business/driver sidebar | 220–250 px (240 px default) | 100vh | Main content fills remaining width |
| Auth brand mark | 31 × 31 px | 31 px | Compact mobile mark is 27 × 27 px |
| Auth role selector | 3 equal columns | 43 px minimum | 8 px gap; 6 px gap on narrow phones |
| Auth input/select | Full available field width | 45 px | 40 px icon slot; input text 11 px in current auth styles |
| Password visibility button | Auto | 34 px | Inside the input; 10 px label |
| Checkbox | 15 × 15 px | 15 px | Brand orange check |
| Auth primary submit | Full form width | 49 px minimum | 11 px radius |
| General primary action | Full width on phone, auto on desktop | 48 px minimum | Use 12–20 px horizontal padding |
| Customer bottom navigation | Full viewport width | 64–72 px plus safe area | Fixed on phone; hide on desktop |
| Mockup artboard | 390 px wide | 844 px high | Design preview only, not a fixed app page size |

For food cards, order cards, forms, and dashboards, use intrinsic height based on content. This keeps variable restaurant names, order notes, and validation messages from being clipped.

### Button and interaction states

| State | Background | Text | Border / treatment |
|---|---|---|---|
| Primary default | `#EF6A3A` | `#FFFFFF` | None; subtle orange shadow |
| Primary hover | `#D9562B` | `#FFFFFF` | Slightly stronger shadow; lift by 1 px |
| Primary pressed | `#D9562B` | `#FFFFFF` | Return to normal position |
| Secondary default | `#FFFFFF` | `#252720` | 1 px `#E9E8E1` |
| Link/button link | Transparent | `#D9562B` | Underline on hover/focus |
| Success/status | Pale green surface | `#276B40` or `#2E8C58` | State text/icon must also identify success |
| Error | `#FFF4F0` | `#A54127` | 1 px `#F0C4B8` |
| Disabled | Neutral gray surface | Muted gray | No hover; preserve readable contrast |

Make every interactive control show a keyboard focus ring. A button or status must not communicate its state with color alone: pair colors with labels, icons, or text such as “Preparing”, “Ready”, and “Delivered”.

### Authentication page field and behavior specification

- Both sign-in and sign-up show the three roles: Customer, Business, Driver.
- Customer is selected by default on both pages.
- Sign-up asks for first name, last name, email, optional phone, password, and password confirmation.
- Selecting Business on sign-up reveals a required restaurant-name field; selecting Customer or Driver hides and disables that field.
- Sign-in asks for email and password, with optional “Remember me” and a “Forgot password?” placeholder interaction.
- Password visibility controls toggle the password between hidden and visible text.
- Browser-side validation checks required fields, valid email format, minimum 8-character password, password match, and signup terms checkbox.
- Until an action has a real provider or backend implementation, clearly identify it as demo-only. Do not imply that demo payments were charged or that illustrative maps represent live GPS.

### Image, icon, and map treatment

- Restaurant/food photography should use rounded 14–18 px corners and `object-fit: cover`.
- Use one consistent visual style for icons (prefer inline SVG or one coherent icon set; avoid mixing emoji, filled icons, and unrelated outline styles).
- Keep decorative artwork separate from controls; hide decorative art from assistive technology.
- Map colors should be low-contrast neutrals/soft greens with orange pickup or route emphasis and a distinct green destination/success marker.
- Always show location as readable text as well as a map pin, for example “Lekki Phase 1, Lagos”.
- If no real map service is connected, show a labeled static map illustration and do not imply that the drawn route is live GPS.

### Copyable CSS variables

Keep the actual CSS tokens in one shared stylesheet and reuse them across customer, business, driver, and auth pages. This set matches the current auth-page palette:

```css
:root {
  color-scheme: light;
  --brand: #ef6a3a;
  --brand-dark: #d9562b;
  --ink: #252720;
  --muted: #777970;
  --page: #f7f6f1;
  --surface: #ffffff;
  --line: #e9e8e1;
  --green: #2e8c58;
  --input-border: #e6e5df;
  --input-focus: #e99a7c;
  --radius-card: 16px;
  --radius-control: 11px;
  --shadow-card: 0 8px 24px rgb(32 35 31 / 8%);
  --content-max: 1280px;
}
```

Use this specification together with the 13 screen mockups. If a later screen needs a new token or exception, add it deliberately here and in the shared CSS rather than choosing a one-off value.

---

## 16. Run the connected LocalBite app

The project has two separate deployable applications:

- `frontend/` is a static site built with vanilla HTML, CSS, and JavaScript.
- `backend/` is the Express API, backed by SQLite.

The frontend calls the backend using the base URL in `frontend/js/config.js`. The backend accepts browser requests only from origins listed in its CORS configuration.

### Requirements

- Node.js 22.13 or newer. The project uses Node's built-in `node:sqlite` API, which Node currently labels experimental.
- npm, included with Node.js.
- A static frontend server for local preview, such as VS Code Live Server.

### Run the backend

In a terminal:

```bash
cd backend
npm install
cp .env.example .env
```

Replace the example `SESSION_SECRET` in `.env` with a private random value. Generate one with `openssl rand -hex 32`; keep the resulting `.env` file private. The starter `FRONTEND_ORIGINS` allows common Live Server origins on ports 5500 and 5173.

Start the API:

```bash
npm run dev
```

The backend listens at [http://localhost:3000](http://localhost:3000). Check [http://localhost:3000/api/health](http://localhost:3000/api/health). `npm start` starts without file watching. SQLite creates `backend/data/localbite.sqlite` and seeds three sample customer restaurants and menus on first start.

### Run the frontend separately

In VS Code, open the `frontend/` folder and use Live Server on `frontend/index.html`. Or serve the folder with any static HTTP server. The app will open the sign-in page. Register an account as a Customer, Business, or Driver.

For another API host, change `window.LOCALBITE_API_BASE` in `frontend/js/config.js` to the backend's public origin, for example `https://api.example.com`. Do not add `/api` at the end—the frontend appends API paths.

Add the exact frontend origin (scheme and host, including a non-default port if used) to `FRONTEND_ORIGINS` in the backend `.env`, for example `FRONTEND_ORIGINS=https://food.example.com`. For a cross-site production deployment, serve both apps over HTTPS; the backend sets a secure, HTTP-only, cross-site session cookie.

Run the backend role-flow tests from the project root:

```bash
npm --prefix backend test
```

### Deploy separately

1. Deploy the contents of `frontend/` to a static hosting provider.
2. Deploy `backend/` as a Node.js service. Install with `npm install`, start with `npm start`, and set `NODE_ENV=production`, `SESSION_SECRET`, `FRONTEND_ORIGINS`, and a persistent `DATABASE_PATH`.
3. Configure `frontend/js/config.js` with the deployed backend origin.
4. Ensure the backend host provides persistent writable storage for SQLite. Do not use an ephemeral filesystem for production database data.
5. Restrict CORS to the exact deployed frontend origin. Never use wildcard CORS with credentialed sessions.

### Implemented flows

#### Customer
- Register and sign in with a selected role; Customer is the default in the forms.
- Browse/search sample local restaurants and view their menu.
- Add/remove basket quantities and submit an order with a delivery address and note.
- View order status and order history.

#### Business
- Register a Business account with a restaurant name; each account manages only its own restaurant.
- Edit the restaurant name, cuisine/category, address, and description.
- Choose whether the restaurant is accepting orders; new businesses are listed only after they have an address and an available menu item.
- Add menu items, update item prices, and toggle availability.
- Accept or reject orders, move accepted orders to preparation, and mark preparing orders ready for pickup.

#### Driver
- View orders the restaurant has marked ready.
- Accept an available delivery; the database atomically assigns it to that driver.
- Confirm pickup and mark the order delivered.
- See assigned/completed delivery history.

### API overview

| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/api/health` | Public health check |
| `POST` | `/api/auth/signup` | Public; creates Customer, Business, or Driver |
| `POST` | `/api/auth/signin` | Public; checks email, password, and selected role |
| `POST` | `/api/auth/signout` | Signed-in user |
| `GET` | `/api/auth/me` | Signed-in user |
| `GET` | `/api/restaurants` | Public restaurant browse/search |
| `GET` | `/api/restaurants/:id` | Public restaurant/menu details |
| `POST` | `/api/orders` | Customer |
| `GET` | `/api/orders/mine` | Signed-in user; scoped to their role |
| `GET`, `PATCH` | `/api/business/restaurant` | Business owner |
| `GET`, `POST` | `/api/business/menu`; `PATCH /api/business/menu/:id` | Business owner |
| `GET` | `/api/business/orders`; `PATCH /api/business/orders/:id/status` | Business owner |
| `GET` | `/api/driver/jobs` | Driver |
| `POST` | `/api/driver/jobs/:id/accept` | Driver |
| `PATCH` | `/api/driver/orders/:id/status` | Assigned driver |

Protected endpoints use an HTTP-only session cookie backed by SQLite. Passwords are hashed using Node's built-in scrypt function. Role checks and order-state transitions are enforced on the server; do not rely on hiding buttons in the frontend for authorization.

Order prices and fees are stored as integer minor currency units (kobo) and displayed as Nigerian naira. The delivery fee is read from the restaurant record; the demo service fee is 5% of the item subtotal.

### Demo-only integrations and production gaps

- The payment choices are labels for a demo; **no payment details are collected and no money is charged**.
- Map artwork, locations, and routes are illustrative. No geocoding, live map tiles, GPS tracking, or dispatch service is connected.
- Password recovery is not available. There is no email/phone verification, notifications, refunds, or customer/driver chat.
- The seeded restaurant records are example data. Business accounts create their own restaurant and need to add menu items before customers can order from them.
- This is a local development starter, not hardened for public production. Before deploying, use HTTPS, a long private session secret, secure cookie/proxy settings, authentication rate limiting, operational monitoring/backups, and a production-supported database/service. Review privacy, payment, food-delivery, and local legal requirements.

To reset the development database, stop the backend and remove only `backend/data/localbite.sqlite` (and any matching `-shm`/`-wal` files). This deletes all locally registered accounts and orders; the sample restaurants will be re-seeded at next start.
