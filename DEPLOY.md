# 🚀 Launch guide — BV Eyewear

A static site (HTML/CSS/JS, no build). Any static host works. Pick one path.

---

## 1. Put in your real data (do this first)

Edit **`js/products.js`**:

- [ ] `BV_CONFIG.whatsapp` → your number, country code first, no `+`/spaces
      (e.g. `"2126XXXXXXXX"`). **Orders go nowhere until this is set.**
- [ ] `BV_PRODUCTS` → your real frames (name, price in DH, colours, badge, photo-less
      `frame` shape: `round` / `rect` / `cat`). Add as many as you like.
- [ ] `shippingFee` / `freeShippingFrom` → your delivery pricing.
- [ ] `cities` → cities you deliver to.

Also update the footer contact (`index.html`): email, phone, social links.

---

## 2. Deploy

### Option A — Netlify (easiest, recommended)
1. Go to <https://app.netlify.com> → **Add new site** → **Import from GitHub** →
   pick this repo and the `claude/epic-turing-qj6pp0` branch.
2. Build command: *(leave empty)* · Publish directory: `.`
3. Deploy. (`netlify.toml` is already configured.)
   Or simply **drag-and-drop the project folder** onto Netlify for an instant URL.

### Option B — Vercel
1. <https://vercel.com/new> → import the repo.
2. Framework preset: **Other** · Output dir: `.` (root). Deploy. (`vercel.json` included.)

### Option C — GitHub Pages (free, no extra account)
1. Repo **Settings ▸ Pages ▸ Build and deployment ▸ Source: GitHub Actions**.
2. The included workflow (`.github/workflows/deploy-pages.yml`) deploys on every push.
   Trigger it from the **Actions** tab if needed.

---

## 3. Connect your domain (bveyewear.ma)
In your host's **Domain settings**, add `bveyewear.ma` and `www.bveyewear.ma`, then at your
domain registrar point DNS as the host instructs (usually a `CNAME` for `www` and an
`A`/`ALIAS` for the apex). HTTPS is issued automatically.

> The SEO tags (`canonical`, `og:url`, `og:image`, sitemap) already use
> `https://www.bveyewear.ma/`. If you launch on a different domain, find-and-replace it
> in `index.html`, `sitemap.xml` and `robots.txt`.

---

## 4. Never lose an order (recommended safety net)
WhatsApp is the primary channel, but add a backup log so an order is saved even if the
customer doesn't press send:

1. Create a Google Sheet → **Extensions ▸ Apps Script** → paste **`tools/order-logger.gs`**.
2. **Deploy ▸ Web app** · Execute as **Me** · Access **Anyone** → copy the URL.
3. Paste it into `js/products.js` → `BV_CONFIG.orderEndpoint`.

Every checkout now also lands in your sheet (and emails you, if you set `NOTIFY_EMAIL`).

---

## 5. After launch
- Submit `https://www.bveyewear.ma/sitemap.xml` in **Google Search Console**.
- Share the link anywhere — the branded preview image (`assets/img/og.png`) shows
  automatically on WhatsApp, Instagram, Facebook, etc.
