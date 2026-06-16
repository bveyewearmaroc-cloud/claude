/* ============================================================
   BV EYEWEAR — Store configuration & product catalog
   ------------------------------------------------------------
   👉 TO ADD / EDIT A PRODUCT: just edit the BV_PRODUCTS array
      below and refresh. No build step, no admin panel.
   👉 TO RECEIVE ORDERS: set BV_CONFIG.whatsapp to your number.
   ============================================================ */

window.BV_CONFIG = {
  brand: "BV Eyewear",
  currency: "DH",              // Moroccan dirham (MAD)

  // ⚠️ REPLACE with your WhatsApp number, country code first, no "+" or spaces.
  //    Example for Morocco: "2126XXXXXXXX"
  whatsapp: "212600000000",

  codNote: "Paiement à la livraison",   // shown as the COD badge
  shippingFee: 30,             // delivery fee in DH (set 0 for always-free)
  freeShippingFrom: 800,       // free delivery above this subtotal (DH); 0 to disable

  // OPTIONAL: also POST every order as JSON here (Formspree / Web3Forms /
  // Google Apps Script URL). Leave "" to use WhatsApp only.
  orderEndpoint: "",

  // Delivery cities offered at checkout
  cities: ["Casablanca","Rabat","Marrakech","Tanger","Fès","Agadir","Meknès",
           "Oujda","Kénitra","Tétouan","Salé","Mohammedia","El Jadida","Autre"],
};

/* Each product: id, name, collection, frame shape (round | rect | cat),
   price, optional oldPrice, badge, colors[], desc. */
window.BV_PRODUCTS = [
  {
    id: "sahara-oro", name: "Sahara Oro", collection: "Sahara", frame: "round",
    price: 790, oldPrice: 990, badge: "Best-seller",
    colors: [{ name: "Honey", hex: "#C9A24A" }, { name: "Onyx", hex: "#1A1A1A" }, { name: "Bone", hex: "#E7DBC6" }],
    desc: "Oversized round acetate, polished to a liquid gloss. Sun-born honey tone.",
  },
  {
    id: "sahara-dune", name: "Sahara Dune", collection: "Sahara", frame: "round",
    price: 690,
    colors: [{ name: "Amber", hex: "#B5783A" }, { name: "Smoke", hex: "#3A352E" }],
    desc: "A softer round silhouette in warm amber acetate. Everyday golden light.",
  },
  {
    id: "atlas-mono", name: "Atlas Mono", collection: "Atlas", frame: "rect",
    price: 1180, oldPrice: 1390, badge: "Titanium",
    colors: [{ name: "Atlas green", hex: "#3E5C52" }, { name: "Onyx", hex: "#1A1A1A" }, { name: "Steel", hex: "#8A8F8C" }],
    desc: "Cold-forged titanium, weightless and exact. Engineered minimalism.",
  },
  {
    id: "atlas-line", name: "Atlas Line", collection: "Atlas", frame: "rect",
    price: 990,
    colors: [{ name: "Gunmetal", hex: "#4A4E52" }, { name: "Gold", hex: "#C9A24A" }],
    desc: "Ultra-thin rectangular metal. The quiet, precise everyday frame.",
  },
  {
    id: "medina-fauve", name: "Medina Fauve", collection: "Medina", frame: "cat",
    price: 850, badge: "New",
    colors: [{ name: "Terracotta", hex: "#B5563A" }, { name: "Tortoise", hex: "#6B3A1E" }, { name: "Onyx", hex: "#1A1A1A" }],
    desc: "Bold hand-laid cat-eye. A nod to the souk, refined for today.",
  },
  {
    id: "medina-nuit", name: "Medina Nuit", collection: "Medina", frame: "cat",
    price: 920, oldPrice: 1100,
    colors: [{ name: "Midnight", hex: "#2A2C44" }, { name: "Plum", hex: "#5A3A56" }],
    desc: "Evening cat-eye in deep midnight acetate with a violet shimmer.",
  },
];
