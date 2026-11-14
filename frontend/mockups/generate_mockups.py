from html import escape
from pathlib import Path


OUT = Path(__file__).parent


def text(x, y, value, size=14, color="#20231f", weight=500, anchor="start"):
    return (
        f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Inter,Arial,sans-serif" '
        f'font-size="{size}" font-weight="{weight}" fill="{color}">{escape(value)}</text>'
    )


def box(x, y, w, h, fill="#ffffff", radius=16, stroke="none"):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" '
        f'fill="{fill}" stroke="{stroke}"/>'
    )


def line(x1, y1, x2, y2, color="#e9e9e5", width=1):
    return f'<path d="M{x1} {y1}H{x2}" stroke="{color}" stroke-width="{width}"/>'


def button(label, y, fill="#ef6a3a", width=342, x=24):
    return (
        box(x, y, width, 54, fill, 16)
        + text(x + width / 2, y + 34, label, 15, "#ffffff", 700, "middle")
    )


def header(title, eyebrow=None):
    parts = [text(24, 57, "‹", 29, "#252720", 500)]
    if eyebrow:
        parts.append(text(57, 35, eyebrow.upper(), 9, "#878980", 700))
    parts.append(text(57, 61, title, 20, "#20231f", 750))
    return "".join(parts)


def nav(active="Home"):
    labels = [("⌂", "Home"), ("⌕", "Explore"), ("▤", "Orders"), ("◉", "Profile")]
    parts = [box(0, 773, 390, 71, "#ffffff", 0), line(0, 773, 390, "#efefeb")]
    for i, (icon, label) in enumerate(labels):
        x = 48 + i * 98
        color = "#ef6a3a" if label == active else "#989991"
        parts.append(text(x, 800, icon, 20, color, 600, "middle"))
        parts.append(text(x, 824, label, 10, color, 650, "middle"))
    return "".join(parts)


def shell(content, background="#f7f7f3"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
<defs>
  <linearGradient id="warm" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0" stop-color="#ffe1c9"/><stop offset="1" stop-color="#ffb88d"/>
  </linearGradient>
  <linearGradient id="green" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0" stop-color="#d8ebcc"/><stop offset="1" stop-color="#a8cc95"/>
  </linearGradient>
</defs>
{box(0, 0, 390, 844, background, 0)}
{text(24, 22, "9:41", 11, "#272a24", 700)}
{text(338, 22, "●  ▰  ▰", 9, "#272a24", 650)}
{content}
</svg>'''


def meal_art(x, y, w, h, color="#f4b783", label="🍲"):
    return (
        box(x, y, w, h, color, 18)
        + f'<circle cx="{x + w / 2}" cy="{y + h / 2}" r="{min(w, h) * .31}" fill="#fff6e8"/>'
        + f'<circle cx="{x + w / 2}" cy="{y + h / 2}" r="{min(w, h) * .24}" fill="#d97839"/>'
        + text(x + w / 2, y + h / 2 + 9, label, 26, "#fff", 500, "middle")
    )


def map_art(x, y, w, h):
    return (
        box(x, y, w, h, "#e5eddf", 18)
        + f'<path d="M{x} {y+h*.35} Q{x+w*.2} {y+h*.48} {x+w*.43} {y+h*.34} T{x+w} {y+h*.37}" fill="none" stroke="#fff" stroke-width="11"/>'
        + f'<path d="M{x+w*.2} {y} Q{x+w*.33} {y+h*.2} {x+w*.28} {y+h} M{x+w*.73} {y} Q{x+w*.67} {y+h*.45} {x+w*.86} {y+h}" fill="none" stroke="#fff" stroke-width="8"/>'
        + f'<path d="M{x+w*.29} {y+h*.65} Q{x+w*.46} {y+h*.26} {x+w*.75} {y+h*.43}" fill="none" stroke="#ef6a3a" stroke-width="4" stroke-dasharray="7 5"/>'
        + f'<circle cx="{x+w*.29}" cy="{y+h*.65}" r="8" fill="#ef6a3a"/><circle cx="{x+w*.75}" cy="{y+h*.43}" r="8" fill="#2d9a60"/>'
        + text(x + 14, y + h - 13, "LEKKI PHASE 1", 9, "#5c6855", 700)
    )


def screen_welcome():
    c = [
        text(24, 76, "●  localbite", 19, "#ef6a3a", 800),
        box(0, 105, 390, 435, "url(#warm)", 0),
        text(195, 205, "GOOD FOOD,", 12, "#92502f", 800, "middle"),
        text(195, 244, "right around", 30, "#27251f", 800, "middle"),
        text(195, 281, "the corner.", 30, "#27251f", 800, "middle"),
        meal_art(94, 317, 202, 177, "#edac76", "🍛"),
        text(195, 584, "Your neighborhood, served.", 22, "#20231f", 750, "middle"),
        text(195, 614, "Discover local kitchens and get the good stuff", 12, "#77796f", 500, "middle"),
        text(195, 634, "delivered fresh to your door.", 12, "#77796f", 500, "middle"),
        button("Use my current location", 672),
        text(195, 750, "Enter address manually", 13, "#ef6a3a", 700, "middle"),
        text(195, 814, "Continue as guest", 12, "#797b72", 600, "middle"),
    ]
    return shell("".join(c), "#fff")


def screen_home():
    c = [
        text(24, 52, "DELIVERING TO", 9, "#888a81", 750),
        text(24, 75, "📍 Lekki Phase 1, Lagos", 15, "#252720", 750),
        text(354, 72, "⌄", 20, "#252720", 700),
        box(20, 92, 350, 47, "#ffffff", 14),
        text(39, 121, "⌕  Search food or restaurants", 13, "#999a92", 500),
        text(24, 169, "Your neighborhood, hungry?", 20, "#24261f", 750),
        text(24, 192, "A little map of what's nearby", 11, "#85877e", 500),
        map_art(20, 207, 350, 118),
        text(24, 363, "Popular near you", 18, "#24261f", 750),
        text(365, 363, "See all  →", 11, "#ef6a3a", 700, "end"),
        box(20, 381, 350, 142, "#fff", 17),
        meal_art(32, 393, 118, 116, "#d99562", "🍛"),
        text(165, 419, "Mama's Place", 16, "#252720", 750),
        text(165, 441, "Nigerian · Lekki", 11, "#83857c", 500),
        text(165, 467, "★ 4.8     ·     25–35 min", 11, "#45473f", 650),
        text(165, 494, "Free delivery", 10, "#2c9b60", 700),
        box(20, 536, 350, 142, "#fff", 17),
        meal_art(32, 548, 118, 116, "#c98b6f", "🍔"),
        text(165, 574, "Burger Hub", 16, "#252720", 750),
        text(165, 596, "Burgers · Victoria Island", 11, "#83857c", 500),
        text(165, 622, "★ 4.7     ·     20–30 min", 11, "#45473f", 650),
        text(165, 649, "15% off today", 10, "#ef6a3a", 700),
        nav("Home"),
    ]
    return shell("".join(c))


def screen_restaurant():
    c = [
        text(24, 60, "‹", 29, "#fff", 600),
        text(365, 59, "♡", 23, "#fff", 600, "end"),
        meal_art(0, 36, 390, 220, "#c98a60", "🍲"),
        box(18, 220, 354, 121, "#fff", 19),
        text(36, 256, "Mama's Place", 23, "#24261f", 800),
        text(36, 280, "Nigerian Kitchen · Lekki Phase 1", 11, "#777970", 500),
        text(36, 309, "★ 4.8   ·   2.3 km   ·   25–35 min", 11, "#44463f", 650),
        text(24, 382, "Popular dishes", 19, "#24261f", 750),
        text(24, 402, "Made fresh in the neighborhood", 11, "#82847a", 500),
        box(20, 420, 350, 93, "#fff", 15),
        text(38, 451, "Jollof rice & chicken", 14, "#252720", 700),
        text(38, 474, "Smoky party rice, tender chicken", 10, "#85877e", 500),
        text(350, 465, "₦2,500", 12, "#252720", 700, "end"),
        box(20, 524, 350, 93, "#fff", 15),
        text(38, 555, "Suya bowl", 14, "#252720", 700),
        text(38, 578, "Spiced beef, rice, fresh slaw", 10, "#85877e", 500),
        text(350, 569, "₦3,200", 12, "#252720", 700, "end"),
        box(20, 628, 350, 82, "#fff", 15),
        text(38, 659, "Sweet fried plantain", 14, "#252720", 700),
        text(350, 673, "₦1,400", 12, "#252720", 700, "end"),
        button("Add items to order  ·  ₦0", 744),
    ]
    return shell("".join(c))


def screen_cart():
    c = [
        header("Your cart"),
        text(24, 102, "Mama's Place", 13, "#81837a", 650),
        box(20, 118, 350, 188, "#fff", 17),
        text(38, 153, "Jollof rice & chicken", 14, "#24261f", 700),
        text(38, 174, "Regular · mild spice", 10, "#8b8d84", 500),
        text(350, 160, "₦2,500", 12, "#24261f", 700, "end"),
        text(38, 208, "Suya bowl", 14, "#24261f", 700),
        text(38, 229, "Extra suya spice", 10, "#8b8d84", 500),
        text(350, 215, "₦3,200", 12, "#24261f", 700, "end"),
        text(38, 264, "Sweet fried plantain", 14, "#24261f", 700),
        text(350, 271, "₦1,400", 12, "#24261f", 700, "end"),
        box(20, 322, 350, 120, "#fff", 17),
        text(38, 354, "Deliver to", 10, "#898b82", 700),
        text(38, 380, "12 Bode Thomas Street", 13, "#24261f", 700),
        text(38, 402, "Lekki Phase 1, Lagos", 11, "#777970", 500),
        text(350, 382, "Change", 10, "#ef6a3a", 700, "end"),
        box(20, 458, 350, 189, "#fff", 17),
        text(38, 490, "Subtotal", 12, "#777970", 500),
        text(350, 490, "₦7,100", 12, "#24261f", 600, "end"),
        text(38, 523, "Delivery fee", 12, "#777970", 500),
        text(350, 523, "₦700", 12, "#24261f", 600, "end"),
        text(38, 556, "Service fee", 12, "#777970", 500),
        text(350, 556, "₦350", 12, "#24261f", 600, "end"),
        line(38, 576, 350, "#eeeeea"),
        text(38, 612, "Total", 15, "#24261f", 750),
        text(350, 612, "₦8,150", 16, "#24261f", 800, "end"),
        button("Continue to checkout  →", 690),
    ]
    return shell("".join(c))


def screen_checkout():
    c = [
        header("Checkout"),
        text(24, 105, "DELIVERY ADDRESS", 9, "#898b82", 750),
        box(20, 118, 350, 91, "#fff", 16),
        text(39, 150, "⌖  Home", 13, "#252720", 700),
        text(39, 174, "12 Bode Thomas Street, Lekki", 11, "#777970", 500),
        text(39, 193, "Phase 1, Lagos", 11, "#777970", 500),
        text(350, 163, "Change", 10, "#ef6a3a", 700, "end"),
        text(24, 252, "PAYMENT METHOD", 9, "#898b82", 750),
        box(20, 265, 350, 62, "#fff", 15, "#ef6a3a"),
        text(40, 302, "◉   Visa ending in 4821", 12, "#252720", 650),
        text(350, 302, "✓", 14, "#ef6a3a", 800, "end"),
        box(20, 337, 350, 57, "#fff", 15),
        text(40, 372, "○   Cash on delivery", 12, "#66685f", 550),
        box(20, 404, 350, 57, "#fff", 15),
        text(40, 439, "○   Wallet balance", 12, "#66685f", 550),
        text(24, 500, "ORDER NOTE", 9, "#898b82", 750),
        box(20, 512, 350, 74, "#fff", 15),
        text(39, 545, "No onions, please. Call when outside.", 11, "#777970", 500),
        text(24, 630, "Your total", 12, "#777970", 550),
        text(366, 632, "₦8,150", 18, "#24261f", 800, "end"),
        text(24, 654, "Includes delivery and service fees", 10, "#8b8d84", 500),
        button("Place my order", 704),
        text(195, 780, "🔒  Secure checkout", 10, "#83857c", 550, "middle"),
    ]
    return shell("".join(c))


def screen_tracking():
    c = [
        header("On its way", "ORDER #LFD-2841"),
        map_art(20, 93, 350, 278),
        box(35, 112, 165, 43, "#fff", 13),
        text(51, 139, "Your driver is nearby", 10, "#252720", 700),
        box(20, 390, 350, 95, "#fff", 17),
        text(40, 422, "ARRIVING IN", 9, "#85877e", 750),
        text(40, 460, "8 minutes", 27, "#252720", 800),
        text(347, 447, "2.1 km away", 10, "#777970", 600, "end"),
        box(20, 500, 350, 157, "#fff", 17),
        text(40, 532, "✓  Restaurant accepted", 12, "#2c9b60", 700),
        text(40, 562, "✓  Preparing your food", 12, "#2c9b60", 700),
        text(40, 592, "●  Driver picked up your order", 12, "#ef6a3a", 700),
        text(40, 622, "○  Delivered to your door", 12, "#9a9c94", 600),
        box(20, 672, 350, 72, "#fff", 16),
        text(40, 703, "Tobi  ·  Your delivery partner", 12, "#252720", 700),
        text(40, 727, "Call or message about your delivery", 10, "#808279", 500),
        text(350, 714, "☎   Message", 10, "#ef6a3a", 700, "end"),
    ]
    return shell("".join(c))


def screen_business_dashboard():
    c = [
        text(24, 55, "LOCALBITE  /  BUSINESS", 9, "#ef6a3a", 800),
        text(24, 91, "Good morning, Ada 👋", 21, "#252720", 800),
        text(24, 114, "Mama's Place · Lekki Phase 1", 11, "#7d7f76", 500),
        box(20, 137, 350, 67, "#eaf5e9", 15),
        text(40, 164, "●  OPEN FOR ORDERS", 10, "#2e8e57", 800),
        text(40, 185, "Today, 10:00 AM – 11:00 PM", 10, "#5b705c", 500),
        box(20, 222, 167, 118, "#252a23", 17),
        text(40, 254, "TODAY'S SALES", 9, "#c2c8bc", 700),
        text(40, 300, "₦58,400", 23, "#fff", 800),
        box(203, 222, 167, 118, "#fff", 17),
        text(223, 254, "ORDERS", 9, "#85877e", 700),
        text(223, 300, "34", 25, "#252720", 800),
        text(24, 383, "New orders", 18, "#252720", 750),
        text(365, 383, "View all  →", 10, "#ef6a3a", 700, "end"),
        box(20, 400, 350, 81, "#fff", 15),
        text(39, 431, "#1042  ·  2 items", 13, "#252720", 700),
        text(39, 455, "Jollof rice ×2  ·  ₦4,800", 10, "#82847a", 500),
        text(350, 444, "Review →", 10, "#ef6a3a", 700, "end"),
        box(20, 493, 350, 81, "#fff", 15),
        text(39, 524, "#1043  ·  1 item", 13, "#252720", 700),
        text(39, 548, "Suya bowl  ·  ₦3,200", 10, "#82847a", 500),
        text(350, 537, "Review →", 10, "#ef6a3a", 700, "end"),
        text(24, 627, "Quick links", 17, "#252720", 750),
        box(20, 644, 105, 76, "#fff", 15),
        box(142, 644, 105, 76, "#fff", 15),
        box(265, 644, 105, 76, "#fff", 15),
        text(72, 677, "▤", 18, "#ef6a3a", 600, "middle"),
        text(72, 701, "Orders", 10, "#5e6057", 650, "middle"),
        text(194, 677, "☷", 18, "#ef6a3a", 600, "middle"),
        text(194, 701, "Menu", 10, "#5e6057", 650, "middle"),
        text(317, 677, "₦", 18, "#ef6a3a", 700, "middle"),
        text(317, 701, "Earnings", 10, "#5e6057", 650, "middle"),
    ]
    return shell("".join(c))


def screen_incoming():
    c = [
        header("Incoming orders", "RESTAURANT"),
        box(20, 94, 350, 65, "#fff0e8", 15),
        text(40, 121, "3 new orders", 14, "#a94e2b", 750),
        text(40, 143, "Review and accept before the timer ends", 10, "#976d5b", 500),
        box(20, 176, 350, 226, "#fff", 17),
        text(40, 210, "ORDER #1042", 9, "#ef6a3a", 800),
        text(350, 210, "04:32", 10, "#a5a69e", 650, "end"),
        text(40, 242, "Aisha · Delivery", 14, "#252720", 700),
        text(40, 269, "2 × Jollof rice & chicken", 11, "#62645c", 500),
        text(40, 291, "1 × Coke", 11, "#62645c", 500),
        line(40, 312, 350, "#eeeeea"),
        text(40, 342, "Order total", 11, "#7f8178", 500),
        text(350, 342, "₦4,800", 14, "#252720", 750, "end"),
        box(40, 360, 140, 32, "#ef6a3a", 10),
        text(110, 381, "Accept", 11, "#fff", 700, "middle"),
        box(193, 360, 140, 32, "#fff", 10, "#e7e7e2"),
        text(263, 381, "Decline", 11, "#676961", 700, "middle"),
        box(20, 419, 350, 226, "#fff", 17),
        text(40, 453, "ORDER #1043", 9, "#ef6a3a", 800),
        text(350, 453, "06:18", 10, "#a5a69e", 650, "end"),
        text(40, 485, "Paul · Delivery", 14, "#252720", 700),
        text(40, 512, "1 × Suya bowl", 11, "#62645c", 500),
        text(40, 534, "1 × Zobo drink", 11, "#62645c", 500),
        line(40, 555, 350, "#eeeeea"),
        text(40, 585, "Order total", 11, "#7f8178", 500),
        text(350, 585, "₦3,700", 14, "#252720", 750, "end"),
        box(40, 603, 140, 32, "#ef6a3a", 10),
        text(110, 624, "Accept", 11, "#fff", 700, "middle"),
        box(193, 603, 140, 32, "#fff", 10, "#e7e7e2"),
        text(263, 624, "Decline", 11, "#676961", 700, "middle"),
        nav("Orders"),
    ]
    return shell("".join(c))


def screen_kitchen():
    c = [
        header("Kitchen board", "MAMA'S PLACE"),
        box(20, 94, 167, 69, "#fff3e9", 14),
        text(40, 120, "IN PREPARATION", 8, "#9c6540", 750),
        text(40, 149, "5", 23, "#252720", 800),
        box(203, 94, 167, 69, "#eaf5e9", 14),
        text(223, 120, "READY FOR PICKUP", 8, "#4e7856", 750),
        text(223, 149, "2", 23, "#252720", 800),
        text(24, 205, "Cooking now", 17, "#252720", 750),
        box(20, 222, 350, 147, "#fff", 17),
        text(40, 255, "#1042", 13, "#252720", 750),
        text(350, 255, "11 min", 10, "#ef6a3a", 700, "end"),
        text(40, 282, "2 × Jollof rice & chicken", 11, "#686a61", 500),
        text(40, 303, "1 × Coke · Note: no onions", 10, "#85877e", 500),
        box(40, 326, 310, 29, "#2f925d", 9),
        text(195, 346, "Mark order ready", 10, "#fff", 700, "middle"),
        box(20, 384, 350, 147, "#fff", 17),
        text(40, 417, "#1038", 13, "#252720", 750),
        text(350, 417, "Driver waiting", 10, "#338b56", 700, "end"),
        text(40, 444, "1 × Suya bowl", 11, "#686a61", 500),
        text(40, 465, "Pickup by driver Tobi", 10, "#85877e", 500),
        box(40, 488, 310, 29, "#fff", 9, "#e8e8e3"),
        text(195, 508, "Confirm pickup", 10, "#55574e", 700, "middle"),
        text(24, 584, "Kitchen note", 11, "#83857c", 650),
        box(20, 599, 350, 65, "#fff", 14),
        text(39, 626, "Keep orders warm until driver arrives.", 11, "#6f7168", 500),
        text(39, 647, "Average prep time today: 18 minutes", 10, "#92948c", 500),
        nav("Orders"),
    ]
    return shell("".join(c))


def screen_menu():
    c = [
        header("Menu management", "MAMA'S PLACE"),
        box(20, 95, 350, 48, "#ef6a3a", 14),
        text(195, 126, "+   Add a menu item", 13, "#fff", 700, "middle"),
        text(24, 177, "Your dishes", 17, "#252720", 750),
        text(365, 177, "12 items", 10, "#83857c", 550, "end"),
        box(20, 195, 350, 108, "#fff", 16),
        meal_art(31, 206, 84, 86, "#d99562", "🍛"),
        text(130, 229, "Jollof rice & chicken", 12, "#252720", 700),
        text(130, 250, "₦2,500", 11, "#55574f", 650),
        text(130, 278, "● Available", 9, "#2c9b60", 700),
        text(350, 229, "Edit", 10, "#ef6a3a", 700, "end"),
        box(20, 316, 350, 108, "#fff", 16),
        meal_art(31, 327, 84, 86, "#bf866f", "🥙"),
        text(130, 350, "Suya bowl", 12, "#252720", 700),
        text(130, 371, "₦3,200", 11, "#55574f", 650),
        text(130, 399, "● Available", 9, "#2c9b60", 700),
        text(350, 350, "Edit", 10, "#ef6a3a", 700, "end"),
        box(20, 437, 350, 108, "#fff", 16),
        meal_art(31, 448, 84, 86, "#ebc26c", "🍌"),
        text(130, 471, "Sweet fried plantain", 12, "#252720", 700),
        text(130, 492, "₦1,400", 11, "#55574f", 650),
        text(130, 520, "● Low stock", 9, "#c7842d", 700),
        text(350, 471, "Edit", 10, "#ef6a3a", 700, "end"),
        box(20, 558, 350, 108, "#fff", 16),
        meal_art(31, 569, 84, 86, "#a5b88a", "🥤"),
        text(130, 592, "Fresh hibiscus zobo", 12, "#252720", 700),
        text(130, 613, "₦700", 11, "#55574f", 650),
        text(130, 641, "● Available", 9, "#2c9b60", 700),
        text(350, 592, "Edit", 10, "#ef6a3a", 700, "end"),
        nav("Profile"),
    ]
    return shell("".join(c))


def screen_driver_jobs():
    c = [
        text(24, 55, "DRIVER", 9, "#ef6a3a", 800),
        text(24, 86, "Nearby deliveries", 21, "#252720", 800),
        text(24, 108, "📍  Lekki Phase 1, Lagos", 11, "#7d7f76", 550),
        map_art(20, 124, 350, 180),
        text(24, 346, "Available jobs", 17, "#252720", 750),
        text(365, 346, "2 nearby", 10, "#83857c", 600, "end"),
        box(20, 364, 350, 146, "#fff", 17),
        text(40, 395, "Mama's Place  →  Lekki Phase 1", 12, "#252720", 700),
        text(40, 420, "Pickup: 0.8 km away", 10, "#7c7e75", 500),
        text(40, 442, "Drop-off: 2.8 km  ·  ~18 min", 10, "#7c7e75", 500),
        text(350, 474, "₦1,200", 14, "#252720", 750, "end"),
        box(40, 463, 175, 31, "#ef6a3a", 10),
        text(127, 484, "Accept delivery", 10, "#fff", 700, "middle"),
        box(20, 526, 350, 146, "#fff", 17),
        text(40, 557, "Burger Hub  →  Ikoyi", 12, "#252720", 700),
        text(40, 582, "Pickup: 1.4 km away", 10, "#7c7e75", 500),
        text(40, 604, "Drop-off: 4.1 km  ·  ~26 min", 10, "#7c7e75", 500),
        text(350, 636, "₦1,600", 14, "#252720", 750, "end"),
        box(40, 625, 175, 31, "#ef6a3a", 10),
        text(127, 646, "Accept delivery", 10, "#fff", 700, "middle"),
        nav("Home"),
    ]
    return shell("".join(c))


def screen_driver_active():
    c = [
        header("Active delivery", "ORDER #1042"),
        map_art(20, 93, 350, 239),
        box(35, 109, 170, 42, "#fff", 13),
        text(52, 136, "Next: pick up order", 10, "#252720", 700),
        box(20, 351, 350, 108, "#fff", 16),
        text(40, 382, "PICKUP  ·  0.8 KM", 9, "#ef6a3a", 750),
        text(40, 412, "Mama's Place", 15, "#252720", 750),
        text(40, 438, "14 Admiralty Way, Lekki", 10, "#7c7e75", 500),
        box(20, 477, 350, 108, "#fff", 16),
        text(40, 508, "DROP-OFF  ·  2.8 KM", 9, "#478a5a", 750),
        text(40, 538, "Aisha · 12 Bode Thomas St.", 14, "#252720", 700),
        text(40, 564, "Lekki Phase 1, Lagos", 10, "#7c7e75", 500),
        box(20, 604, 350, 48, "#fff", 14, "#e6e7e1"),
        text(43, 634, "Order ready · 2 meals", 11, "#676961", 600),
        button("Open navigation", 671, "#252a23", 166, 24),
        box(200, 671, 166, 54, "#ef6a3a", 15),
        text(283, 705, "Picked up", 13, "#fff", 700, "middle"),
    ]
    return shell("".join(c))


def screen_delivery_complete():
    c = [
        box(0, 0, 390, 844, "#f7f7f3", 0),
        text(24, 22, "9:41", 11, "#272a24", 700),
        text(338, 22, "●  ▰  ▰", 9, "#272a24", 650),
        f'<circle cx="195" cy="214" r="77" fill="#e1f1e0"/>',
        f'<circle cx="195" cy="214" r="55" fill="#2f925d"/>',
        text(195, 230, "✓", 42, "#fff", 700, "middle"),
        text(195, 334, "Nice work, Tobi!", 24, "#252720", 800, "middle"),
        text(195, 362, "Order #1042 delivered successfully.", 12, "#777970", 500, "middle"),
        box(20, 408, 350, 176, "#fff", 18),
        text(40, 443, "TODAY'S DELIVERY EARNINGS", 9, "#85877e", 750),
        text(40, 487, "₦1,350", 29, "#252720", 800),
        line(40, 507, 350, "#eeeeea"),
        text(40, 540, "Delivery pay", 11, "#777970", 500),
        text(350, 540, "₦1,200", 11, "#252720", 650, "end"),
        text(40, 565, "Customer tip", 11, "#777970", 500),
        text(350, 565, "₦150", 11, "#252720", 650, "end"),
        box(20, 605, 350, 62, "#eaf5e9", 15),
        text(40, 633, "✓  Customer confirmed delivery", 11, "#347b4a", 700),
        text(40, 652, "Payout added to your balance", 10, "#5b765f", 500),
        button("Back to available deliveries", 703),
        text(195, 793, "Thank you for delivering local.", 10, "#82847a", 550, "middle"),
    ]
    return shell("".join(c))


SCREENS = [
    ("01-customer-welcome", "Customer · Welcome & location", screen_welcome),
    ("02-customer-home", "Customer · Nearby restaurants", screen_home),
    ("03-customer-restaurant", "Customer · Restaurant menu", screen_restaurant),
    ("04-customer-cart", "Customer · Cart", screen_cart),
    ("05-customer-checkout", "Customer · Checkout", screen_checkout),
    ("06-customer-tracking", "Customer · Order tracking", screen_tracking),
    ("07-business-dashboard", "Business · Dashboard", screen_business_dashboard),
    ("08-business-orders", "Business · Incoming orders", screen_incoming),
    ("09-business-kitchen", "Business · Kitchen board", screen_kitchen),
    ("10-business-menu", "Business · Menu management", screen_menu),
    ("11-driver-jobs", "Driver · Available deliveries", screen_driver_jobs),
    ("12-driver-active", "Driver · Active delivery", screen_driver_active),
    ("13-driver-complete", "Driver · Delivery complete", screen_delivery_complete),
]


for slug, _, render in SCREENS:
    (OUT / f"{slug}.svg").write_text(render(), encoding="utf-8")

cards = "\n".join(
    f'<a class="card" href="{slug}.svg"><img src="{slug}.svg" alt="{escape(title)}"><span>{escape(title)}</span></a>'
    for slug, title, _ in SCREENS
)
(OUT / "index.html").write_text(
    f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LocalBite · Screen concepts</title>
<style>
*{{box-sizing:border-box}}body{{margin:0;background:#f3f3ef;color:#24261f;font-family:Inter,Arial,sans-serif}}
header{{max-width:1180px;margin:0 auto;padding:42px 28px 20px}}h1{{font-size:30px;margin:0 0 8px}}p{{color:#74766e;margin:0}}
main{{max-width:1180px;margin:auto;padding:16px 28px 56px;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:22px}}
.card{{display:block;text-decoration:none;color:inherit;background:white;padding:10px;border-radius:16px;box-shadow:0 6px 24px #252a230d}}
.card img{{display:block;width:100%;height:auto;border-radius:10px}}.card span{{display:block;padding:12px 4px 5px;font-weight:700;font-size:13px}}
</style></head><body><header><h1>LocalBite screen concepts</h1>
<p>13 mobile-first screen mockups across customer, restaurant, and driver experiences.</p></header>
<main>{cards}</main></body></html>""",
    encoding="utf-8",
)
