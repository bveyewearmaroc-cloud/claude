/* ============================================================
   BV EYEWEAR — Boutique engine (Cash-on-Delivery)
   Catalog render · cart · COD checkout · WhatsApp order routing
   Pure vanilla JS, no dependencies. Reads window.BV_PRODUCTS / BV_CONFIG.
   ============================================================ */
(function () {
  "use strict";

  const CFG = window.BV_CONFIG || {};
  const PRODUCTS = window.BV_PRODUCTS || [];
  const CUR = CFG.currency || "DH";
  const KEY = "bv_cart_v1";
  const money = (n) => `${Math.round(n).toLocaleString("fr-MA")} ${CUR}`;
  const byId = (id) => PRODUCTS.find((p) => p.id === id);

  /* ---- frame line-art (matches the rest of the site) ---- */
  const FRAME_PATHS = {
    round: `<circle cx="78" cy="66" r="42"/><circle cx="222" cy="66" r="42"/><path d="M120 60 C140 48 160 48 180 60"/><path d="M36 60 L8 50" stroke-linecap="round"/><path d="M264 60 L292 50" stroke-linecap="round"/>`,
    rect: `<rect x="28" y="44" width="104" height="46" rx="9"/><rect x="168" y="44" width="104" height="46" rx="9"/><path d="M132 56 L168 56"/><path d="M28 52 L6 46" stroke-linecap="round"/><path d="M272 52 L294 46" stroke-linecap="round"/>`,
    cat: `<rect x="30" y="40" width="96" height="60" rx="24"/><rect x="174" y="40" width="96" height="60" rx="24"/><path d="M126 54 C140 44 160 44 174 54"/><path d="M30 52 L12 38" stroke-linecap="round"/><path d="M270 52 L288 38" stroke-linecap="round"/>`,
  };
  const frameSVG = (shape, hex, cls) => {
    const sw = shape === "rect" ? 3 : shape === "cat" ? 6 : 4;
    return `<svg class="${cls}" viewBox="0 0 300 130" aria-hidden="true"><g fill="none" stroke="${hex}" stroke-width="${sw}">${FRAME_PATHS[shape] || FRAME_PATHS.round}</g></svg>`;
  };

  /* ---- cart state ---- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  const lineOf = (id, hex) => cart.find((i) => i.id === id && i.hex === hex);
  const subtotal = () => cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
  const shippingOf = (sub) => {
    if (!sub) return 0;
    if (CFG.freeShippingFrom && sub >= CFG.freeShippingFrom) return 0;
    return CFG.shippingFee || 0;
  };
  const count = () => cart.reduce((s, i) => s + i.qty, 0);

  /* ---- DOM refs ---- */
  const $ = (s, r = document) => r.querySelector(s);
  const grid = $("#boutiqueGrid");
  const overlay = $("#shopOverlay");
  const drawer = $("#cart");
  const cartItemsEl = $("#cartItems");
  const cartFootEl = $("#cartFoot");
  const countEl = $("#cartCount");
  const checkout = $("#checkout");

  /* ---- render catalog ---- */
  function renderCatalog() {
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map((p) => {
      const c0 = p.colors[0];
      const price = p.oldPrice
        ? `<s>${money(p.oldPrice)}</s><b>${money(p.price)}</b>`
        : `<b>${money(p.price)}</b>`;
      const swatches = p.colors.map((c, i) =>
        `<button class="pswatch${i === 0 ? " is-active" : ""}" style="--s:${c.hex}" data-hex="${c.hex}" data-name="${c.name}" aria-label="${c.name}"></button>`).join("");
      return `
      <article class="product" data-id="${p.id}" style="--c1:${c0.hex}">
        ${p.badge ? `<span class="product__badge">${p.badge}</span>` : ""}
        <div class="product__visual">
          <div class="product__glow" style="background:radial-gradient(120% 120% at 50% 30%, ${c0.hex}66, transparent 60%)"></div>
          ${frameSVG(p.frame, c0.hex, "product__svg")}
        </div>
        <div class="product__body">
          <span class="product__coll">${p.collection}</span>
          <div class="product__top">
            <h3 class="product__name">${p.name}</h3>
            <span class="product__price">${price}</span>
          </div>
          <p class="product__desc">${p.desc}</p>
          <div class="product__swatches" role="group" aria-label="Couleur">${swatches}</div>
          <span class="product__cod">${CFG.codNote || "Cash on delivery"}</span>
          <button class="product__add" type="button">Ajouter au panier</button>
        </div>
      </article>`;
    }).join("");

    grid.querySelectorAll(".product").forEach((card) => {
      const id = card.dataset.id;
      const p = byId(id);
      const svgWrap = card.querySelector(".product__visual");
      const glow = card.querySelector(".product__glow");
      let sel = p.colors[0];
      card.querySelectorAll(".pswatch").forEach((sw) => {
        sw.addEventListener("click", () => {
          card.querySelectorAll(".pswatch").forEach((s) => s.classList.remove("is-active"));
          sw.classList.add("is-active");
          sel = { hex: sw.dataset.hex, name: sw.dataset.name };
          svgWrap.querySelector(".product__svg").outerHTML = frameSVG(p.frame, sel.hex, "product__svg");
          glow.style.background = `radial-gradient(120% 120% at 50% 30%, ${sel.hex}66, transparent 60%)`;
          card.style.setProperty("--c1", sel.hex);
        });
      });
      card.querySelector(".product__add").addEventListener("click", () => addToCart(id, sel));
    });
  }

  /* ---- cart ops ---- */
  function addToCart(id, color) {
    const line = lineOf(id, color.hex);
    if (line) line.qty += 1;
    else cart.push({ id, hex: color.hex, color: color.name, qty: 1 });
    save(); renderCart(); bump(); openDrawer();
  }
  function setQty(id, hex, delta) {
    const line = lineOf(id, hex);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter((i) => i !== line);
    save(); renderCart();
  }
  function removeLine(id, hex) { cart = cart.filter((i) => !(i.id === id && i.hex === hex)); save(); renderCart(); }

  function bump() {
    if (!countEl) return;
    countEl.classList.add("bump");
    setTimeout(() => countEl.classList.remove("bump"), 320);
  }

  function renderCart() {
    if (countEl) { countEl.textContent = count(); countEl.style.display = count() ? "grid" : "none"; }
    if (!cartItemsEl) return;
    if (!cart.length) {
      cartItemsEl.innerHTML = `<p class="cart__empty">Votre panier est vide.<br>Choisissez une monture pour commencer.</p>`;
      cartFootEl.innerHTML = "";
      return;
    }
    cartItemsEl.innerHTML = cart.map((i) => {
      const p = byId(i.id);
      return `
      <div class="citem">
        <div class="citem__thumb" style="background:radial-gradient(120% 120% at 50% 40%, ${i.hex}44, transparent)">${frameSVG(p.frame, i.hex, "")}</div>
        <div>
          <div class="citem__name">${p.name}</div>
          <div class="citem__meta">${i.color} · ${p.collection}</div>
          <div class="citem__qty">
            <button type="button" data-act="dec" data-id="${i.id}" data-hex="${i.hex}" aria-label="Moins">–</button>
            <span>${i.qty}</span>
            <button type="button" data-act="inc" data-id="${i.id}" data-hex="${i.hex}" aria-label="Plus">+</button>
          </div>
        </div>
        <div class="citem__right">
          <span class="citem__price">${money(p.price * i.qty)}</span>
          <button class="citem__remove" type="button" data-act="rm" data-id="${i.id}" data-hex="${i.hex}">Retirer</button>
        </div>
      </div>`;
    }).join("");

    cartItemsEl.querySelectorAll("button[data-act]").forEach((b) => {
      b.addEventListener("click", () => {
        const { act, id, hex } = b.dataset;
        if (act === "inc") setQty(id, hex, 1);
        else if (act === "dec") setQty(id, hex, -1);
        else if (act === "rm") removeLine(id, hex);
      });
    });

    const sub = subtotal(), ship = shippingOf(sub), total = sub + ship;
    cartFootEl.innerHTML = `
      <div class="cart__row"><span>Sous-total</span><span>${money(sub)}</span></div>
      <div class="cart__row"><span>Livraison</span><span>${ship ? money(ship) : "Gratuite"}</span></div>
      <div class="cart__row cart__row--total"><span>Total</span><b>${money(total)}</b></div>
      <span class="cart__cod">${CFG.codNote || "Cash on delivery"}</span>
      <button class="cart__checkout" id="goCheckout" type="button">Commander — Paiement à la livraison</button>`;
    $("#goCheckout").addEventListener("click", openCheckout);
  }

  /* ---- panels ---- */
  let scrollLocked = false;
  function lock() { if (scrollLocked) return; scrollLocked = true; window.BVLenis && window.BVLenis.stop(); document.body.style.overflow = "hidden"; }
  function unlock() { scrollLocked = false; window.BVLenis && window.BVLenis.start(); document.body.style.overflow = ""; }
  const showOverlay = () => overlay && overlay.classList.add("is-open");
  const maybeHideOverlay = () => {
    if (!drawer.classList.contains("is-open") && !checkout.classList.contains("is-open")) {
      overlay && overlay.classList.remove("is-open"); unlock();
    }
  };
  function openDrawer() { renderCart(); drawer.classList.add("is-open"); showOverlay(); lock(); }
  function closeDrawer() { drawer.classList.remove("is-open"); maybeHideOverlay(); }
  function openCheckout() {
    if (!cart.length) return;
    closeDrawer();
    renderCheckoutSummary();
    checkout.classList.remove("is-success");
    checkout.classList.add("is-open"); showOverlay(); lock();
  }
  function closeCheckout() { checkout.classList.remove("is-open"); maybeHideOverlay(); }

  function renderCheckoutSummary() {
    const sub = subtotal(), ship = shippingOf(sub), total = sub + ship;
    $("#checkoutSummary").innerHTML = `
      <div class="cart__row"><span>${count()} article(s)</span><span>${money(sub)}</span></div>
      <div class="cart__row"><span>Livraison</span><span>${ship ? money(ship) : "Gratuite"}</span></div>
      <div class="cart__row cart__row--total"><span>Total à payer</span><b>${money(total)}</b></div>`;
  }

  /* ---- order submission ---- */
  function buildOrder(form) {
    const sub = subtotal(), ship = shippingOf(sub), total = sub + ship;
    const ref = "BV-" + Date.now().toString(36).slice(-6).toUpperCase();
    const lines = cart.map((i) => {
      const p = byId(i.id);
      return `• ${i.qty}× ${p.name} (${i.color}) — ${money(p.price * i.qty)}`;
    });
    const c = Object.fromEntries(new FormData(form).entries());
    const msg =
`🕶️ *Nouvelle commande ${CFG.brand}*  [${ref}]
————————————————
${lines.join("\n")}
————————————————
Sous-total: ${money(sub)}
Livraison: ${ship ? money(ship) : "Gratuite"}
*TOTAL (à la livraison): ${money(total)}*
————————————————
👤 ${c.name}
📞 ${c.phone}
🏙️ ${c.city}
📍 ${c.address}${c.notes ? `\n📝 ${c.notes}` : ""}`;
    return { ref, msg, customer: c, items: cart.map((i) => ({ ...i, name: byId(i.id).name, price: byId(i.id).price })), sub, ship, total };
  }

  function waLink(msg) {
    return `https://wa.me/${(CFG.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  }

  function submitOrder(form) {
    const order = buildOrder(form);
    const link = waLink(order.msg);

    // Optional: also log/email the order to a backend endpoint
    if (CFG.orderEndpoint) {
      try {
        // text/plain avoids a CORS preflight, so it works with a Google
        // Apps Script web app (the recommended order-log endpoint).
        fetch(CFG.orderEndpoint, {
          method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ ref: order.ref, ...order.customer, items: order.items, total: order.total }),
        }).catch(() => {});
      } catch (e) {}
    }

    // Open WhatsApp with the prefilled order (primary COD channel in MA)
    window.open(link, "_blank");

    // Success state + manual fallback link
    $("#successRef").textContent = order.ref;
    $("#successName").textContent = order.customer.name ? order.customer.name.split(" ")[0] : "";
    $("#successWa").setAttribute("href", link);
    checkout.classList.add("is-success");

    cart = []; save(); renderCart();
  }

  function populateCities() {
    const sel = $("#ck-city");
    if (!sel) return;
    const cities = CFG.cities && CFG.cities.length ? CFG.cities : ["Casablanca", "Autre"];
    sel.innerHTML = `<option value="" disabled selected>Choisir…</option>` +
      cities.map((c) => `<option value="${c}">${c}</option>`).join("");
  }

  function wireCheckoutForm() {
    const form = $("#checkoutForm");
    if (!form) return;
    populateCities();
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("[data-required]").forEach((inp) => {
        const err = inp.parentElement.querySelector(".err");
        let m = "";
        if (!inp.value.trim()) m = "Champ requis";
        else if (inp.name === "phone" && inp.value.replace(/\D/g, "").length < 9) m = "Numéro invalide";
        if (err) err.textContent = m;
        if (m) ok = false;
      });
      if (ok) submitOrder(form);
    });
  }

  /* ---- close wiring ---- */
  function wireClose() {
    overlay && overlay.addEventListener("click", () => { closeDrawer(); closeCheckout(); });
    document.querySelectorAll("[data-cart-open]").forEach((b) => b.addEventListener("click", openDrawer));
    document.querySelectorAll("[data-cart-close]").forEach((b) => b.addEventListener("click", closeDrawer));
    document.querySelectorAll("[data-checkout-close]").forEach((b) => b.addEventListener("click", closeCheckout));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDrawer(); closeCheckout(); } });
  }

  /* ---- SEO: Product structured data from the catalog ---- */
  function injectProductSchema() {
    if (!PRODUCTS.length) return;
    const items = PRODUCTS.map((p, i) => ({
      "@type": "ListItem", position: i + 1,
      item: {
        "@type": "Product", name: p.name, category: "Eyewear", description: p.desc,
        brand: { "@type": "Brand", name: CFG.brand || "BV Eyewear" },
        offers: {
          "@type": "Offer", price: p.price, priceCurrency: "MAD",
          availability: "https://schema.org/InStock",
          areaServed: "MA", url: "https://www.bveyewear.ma/#boutique",
        },
      },
    }));
    const data = { "@context": "https://schema.org", "@type": "ItemList", name: "BV Eyewear — Boutique", itemListElement: items };
    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(data);
    document.head.appendChild(tag);
  }

  /* ---- boot ---- */
  function start() {
    injectProductSchema();
    if (CFG.whatsapp === "212600000000") {
      console.warn("[BV shop] Set BV_CONFIG.whatsapp in js/products.js to receive orders.");
    }
    renderCatalog();
    renderCart();
    wireCheckoutForm();
    wireClose();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
