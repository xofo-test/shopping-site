/* ============================================================
   Marigold — cart store & pricing engine (shared by all pages)
   Persists the cart in localStorage; this module is the seam
   where mock data gets replaced by real API calls later.
   ============================================================ */
(function () {
  var F = window.OSC_FIXTURES;
  var CART_KEY = "marigold.cart.v1";
  var COUPON_KEY = "marigold.coupon.v1";

  var formatter = new Intl.NumberFormat(F.currency.locale, {
    style: "currency", currency: F.currency.code, maximumFractionDigits: 0
  });

  var listeners = [];
  function notify() { listeners.forEach(function (fn) { fn(); }); }

  /* ---------- cart lines ---------- */
  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeCart(lines) {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
    notify();
  }

  function productOf(id) {
    return F.products.find(function (p) { return p.id === id; }) || null;
  }

  function add(productId, variant) {
    var id = productId + "|" + (variant || "default");
    var lines = readCart();
    var line = lines.find(function (l) { return l.id === id; });
    if (line) { line.qty += 1; } else {
      lines.push({ id: id, productId: productId, variant: variant || null, qty: 1 });
    }
    writeCart(lines);
  }

  function setQty(lineId, qty) {
    var lines = readCart();
    var line = lines.find(function (l) { return l.id === lineId; });
    if (!line) return;
    if (qty <= 0) { lines = lines.filter(function (l) { return l.id !== lineId; }); }
    else { line.qty = qty; }
    writeCart(lines);
  }

  function remove(lineId) { writeCart(readCart().filter(function (l) { return l.id !== lineId; })); }

  function clear() {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(COUPON_KEY);
    notify();
  }

  function getCart() { return readCart(); }
  function itemCount() { return readCart().reduce(function (s, l) { return s + l.qty; }, 0); }

  /* ---------- coupons ---------- */
  function findCoupon(code) {
    var c = String(code || "").trim().toUpperCase();
    return F.coupons.find(function (x) { return x.code === c; }) || null;
  }

  function formatDate(iso) {
    return new Date(iso + "T00:00:00").toLocaleDateString(F.currency.locale, { day: "numeric", month: "short", year: "numeric" });
  }

  function checkCoupon(coupon, subtotal) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (today > new Date(coupon.expiresOn + "T23:59:59")) {
      return { valid: false, reason: "expired on " + formatDate(coupon.expiresOn) };
    }
    if (subtotal < coupon.minOrder) {
      return { valid: false, reason: "needs a minimum order of " + money(coupon.minOrder) };
    }
    return { valid: true, reason: null };
  }

  function storedCouponCode() { return localStorage.getItem(COUPON_KEY) || null; }

  function applyCoupon(code) {
    var coupon = findCoupon(code);
    if (!coupon) {
      return { ok: false, message: "“" + String(code).trim().toUpperCase() + "” is not a valid coupon code." };
    }
    var subtotal = readCart().reduce(function (s, l) { return s + productOf(l.productId).price * l.qty; }, 0);
    var check = checkCoupon(coupon, subtotal);
    if (!check.valid) {
      if (check.reason.indexOf("expired") === 0) {
        return { ok: false, message: "This coupon " + check.reason + "." };
      }
      var shortfall = coupon.minOrder - subtotal;
      return { ok: false, message: "Add " + money(shortfall) + " more to use this coupon (" + check.reason + ")." };
    }
    localStorage.setItem(COUPON_KEY, coupon.code);
    notify();
    return { ok: true, message: "Coupon " + coupon.code + " applied — " + describe(coupon) + "." };
  }

  function describe(c) {
    return c.type === "percent" ? c.value + "% off" : money(c.value) + " off";
  }

  function clearCoupon() { localStorage.removeItem(COUPON_KEY); notify(); }

  /* ---------- pricing ---------- */
  function totals() {
    var lines = readCart();
    var subtotal = 0;
    lines.forEach(function (l) {
      var p = productOf(l.productId);
      if (p) subtotal += p.price * l.qty;
    });

    var discount = 0;
    var couponInfo = { code: null, applied: false, reason: null };
    var code = storedCouponCode();
    if (code && subtotal > 0) {
      var coupon = findCoupon(code);
      if (coupon) {
        var check = checkCoupon(coupon, subtotal);
        if (check.valid) {
          discount = coupon.type === "percent"
            ? Math.round(subtotal * coupon.value / 100)
            : Math.min(coupon.value, subtotal);
          couponInfo = { code: coupon.code, applied: true, reason: null };
        } else {
          couponInfo = { code: coupon.code, applied: false, reason: check.reason };
        }
      }
    }

    var base = subtotal - discount;
    var delivery = subtotal > 0 ? F.pricing.deliveryFee : 0;
    var tax = Math.round(base * F.pricing.taxRate);
    var total = base + delivery + tax;

    return {
      lines: lines, subtotal: subtotal, discount: discount, coupon: couponInfo,
      delivery: delivery, tax: tax, total: total, itemCount: itemCount()
    };
  }

  function money(n) { return formatter.format(n); }

  /* ---------- toast ---------- */
  function toast(message) {
    var host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      document.body.appendChild(host);
    }
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = message;
    host.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 300);
    }, 2200);
  }

  /* keep other open tabs in sync */
  window.addEventListener("storage", function (e) {
    if (e.key === CART_KEY || e.key === COUPON_KEY) notify();
  });

  window.OSC = {
    fixtures: F,
    productOf: productOf,
    getCart: getCart,
    itemCount: itemCount,
    add: add,
    setQty: setQty,
    remove: remove,
    clear: clear,
    applyCoupon: applyCoupon,
    clearCoupon: clearCoupon,
    storedCouponCode: storedCouponCode,
    totals: totals,
    money: money,
    toast: toast,
    onChange: function (fn) { listeners.push(fn); }
  };
})();
