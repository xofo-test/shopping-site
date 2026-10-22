/* ============================================================
   Marigold — mock data fixtures (stand-in for future backend APIs)
   Swap these objects for real HTTP calls later; the UI only
   consumes the shapes below.
   ============================================================ */
(function () {
  function svgArt(icon, c1, c2) {
    var svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='" + c1 + "'/><stop offset='1' stop-color='" + c2 + "'/>" +
      "</linearGradient></defs>" +
      "<rect width='320' height='320' fill='url(#g)'/>" +
      "<circle cx='270' cy='52' r='46' fill='rgba(255,255,255,0.16)'/>" +
      "<circle cx='44' cy='274' r='64' fill='rgba(255,255,255,0.12)'/>" +
      "<text x='160' y='172' font-size='132' text-anchor='middle' dominant-baseline='central'>" + icon + "</text>" +
      "</svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  window.OSC_FIXTURES = {
    currency: { code: "INR", symbol: "₹", locale: "en-IN" },

    pricing: {
      deliveryFee: 79,      // flat estimated delivery charge (₹)
      taxRate: 0.12,        // GST applied to the discounted subtotal
      taxLabel: "GST (12%)"
    },

    coupons: [
      { code: "SAVE10",  type: "percent", value: 10,  minOrder: 999,  expiresOn: "2026-09-30", description: "10% off on orders above ₹999" },
      { code: "FLAT250", type: "flat",    value: 250, minOrder: 1499, expiresOn: "2026-12-31", description: "₹250 off on orders above ₹1,499" },
      { code: "NEW15",   type: "percent", value: 15,  minOrder: 2999, expiresOn: "2026-03-31", description: "15% off on orders above ₹2,999" },
      { code: "WELCOME500", type: "flat", value: 500, minOrder: 0,    expiresOn: "2024-08-31", description: "Expired welcome offer — ₹500 off" }
    ],

    products: [
      {
        id: "p1", name: "Aurora Wireless Headphones", category: "Electronics",
        price: 4999, mrp: 6999, rating: 4.6, reviews: 1284,
        blurb: "40-hour battery, hybrid noise cancellation, USB-C fast charge.",
        icon: "🎧", tone: ["#6366f1", "#8b5cf6"],
        variants: { label: "Colour", options: ["Midnight Black", "Cloud White", "Steel Blue"] }
      },
      {
        id: "p2", name: "Nimbus Runner Sneakers", category: "Footwear",
        price: 2799, mrp: 3999, rating: 4.4, reviews: 862,
        blurb: "Everyday running shoes with a cloud-foam midsole and grip outsole.",
        icon: "👟", tone: ["#0ea5e9", "#14b8a6"],
        variants: { label: "Size", options: ["UK 6", "UK 7", "UK 8", "UK 9"] }
      },
      {
        id: "p3", name: "Ember Pour-Over Kettle", category: "Kitchen",
        price: 2499, mrp: 2999, rating: 4.7, reviews: 316,
        blurb: "Gooseneck kettle with a precision flow spout for perfect brews.",
        icon: "🫖", tone: ["#f59e0b", "#ef4444"],
        variants: null
      },
      {
        id: "p4", name: "Solstice Analog Watch", category: "Accessories",
        price: 3499, mrp: 4999, rating: 4.5, reviews: 540,
        blurb: "Minimal 38 mm dial, sapphire-coated glass, 5 ATM water resistance.",
        icon: "⌚", tone: ["#334155", "#64748b"],
        variants: { label: "Colour", options: ["Ivory", "Slate Grey"] }
      },
      {
        id: "p5", name: "Drift Cotton Tee", category: "Apparel",
        price: 899, mrp: 1299, rating: 4.2, reviews: 2103,
        blurb: "180 GSM combed cotton in a relaxed, pre-shrunk fit.",
        icon: "👕", tone: ["#fb7185", "#f97316"],
        variants: { label: "Size", options: ["S", "M", "L", "XL"] }
      },
      {
        id: "p6", name: "Trailhead 24L Backpack", category: "Travel",
        price: 1899, mrp: 2499, rating: 4.6, reviews: 741,
        blurb: "Water-resistant daypack with padded 15-inch laptop sleeve.",
        icon: "🎒", tone: ["#65a30d", "#166534"],
        variants: { label: "Colour", options: ["Olive", "Charcoal"] }
      },
      {
        id: "p7", name: "Terracotta Mug Set (Set of 2)", category: "Home",
        price: 1299, mrp: 1599, rating: 4.8, reviews: 289,
        blurb: "Hand-glazed 300 ml mugs, safe for microwave and dishwasher.",
        icon: "☕", tone: ["#ea580c", "#9a3412"],
        variants: null
      },
      {
        id: "p8", name: "Fern & Fig Desk Plant", category: "Home",
        price: 649, mrp: 799, rating: 4.3, reviews: 655,
        blurb: "Low-maintenance golden pothos in a matte ceramic pot.",
        icon: "🪴", tone: ["#10b981", "#047857"],
        variants: { label: "Size", options: ["Small", "Medium"] }
      }
    ]
  };

  // Pre-render offline product artwork (SVG data URIs — no network needed)
  window.OSC_FIXTURES.products.forEach(function (p) {
    p.image = svgArt(p.icon, p.tone[0], p.tone[1]);
  });
})();
