/**
 * BV EYEWEAR — Ameex fulfilment (Google Apps Script, bound to your orders Sheet)
 * Complements order-logger.gs (which fills the "Commandes" tab from the website).
 *
 * Adds a "📦 Ameex" menu to the Sheet with:
 *   • Export confirmed orders  → ready-to-upload sheet (works NOW, no API needed)
 *   • Send via API             → auto-push to Ameex (after you get API access)
 *
 * ───────────────────────────────────────────────────────────────────────────
 * Ameex has no public API docs. Ask Ameex support for ONE of:
 *   (A) API access: the "create parcel / créer colis" endpoint URL, your API
 *       token, and the exact field names they expect → fill AMEEX config below.
 *   (B) Their bulk-import Excel template (column order) → tell me and I'll match
 *       the export columns exactly. Until then the export uses a common layout.
 * ───────────────────────────────────────────────────────────────────────────
 */

// ===== CONFIG — fill these after Ameex gives you API access =====
const AMEEX = {
  apiUrl: "",            // e.g. "https://api.ameex.ma/.../parcels"  (ASK AMEEX)
  token:  "",            // your API token / Bearer                  (ASK AMEEX)

  // Map one order row to Ameex's expected JSON. Rename keys to match their docs.
  payload: function (o) {
    return {
      reference:      o.ref,
      receiver_name:  o.name,
      receiver_phone: o.phone,
      city:           o.city,
      address:        o.address,
      product:        o.items,
      cod_amount:     o.total,   // montant à encaisser à la livraison (DH)
      note:           o.note,
    };
  },

  // Where to read the tracking/colis number from Ameex's response (adjust path).
  readTracking: function (resp) {
    return (resp && (resp.tracking || resp.code || resp.parcel_id || resp.id)) || "";
  },
};

const SHEET = "Commandes";
// Column numbers in "Commandes" (1-based): Date1 Réf2 Nom3 Tél4 Ville5 Adr6 Note7 Articles8 Total9 Statut10 Transporteur11 Colis12
const COL = { ref:2, name:3, phone:4, city:5, address:6, note:7, items:8, total:9, status:10, courier:11, tracking:12 };

function onOpen() {
  SpreadsheetApp.getUi().createMenu("📦 Ameex")
    .addItem("Exporter les commandes confirmées", "ameexExport")
    .addItem("Envoyer via API (commandes confirmées)", "ameexSendApi")
    .addToUi();
}

function _orders() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
  const last = sh.getLastRow();
  const out = [];
  for (let r = 2; r <= last; r++) {
    const status = String(sh.getRange(r, COL.status).getValue()).trim().toLowerCase();
    if (status !== "confirmée" && status !== "confirmee") continue;
    out.push({
      row: r,
      ref: sh.getRange(r, COL.ref).getValue(),
      name: sh.getRange(r, COL.name).getValue(),
      phone: sh.getRange(r, COL.phone).getValue(),
      city: sh.getRange(r, COL.city).getValue(),
      address: sh.getRange(r, COL.address).getValue(),
      note: sh.getRange(r, COL.note).getValue(),
      items: sh.getRange(r, COL.items).getValue(),
      total: sh.getRange(r, COL.total).getValue(),
    });
  }
  return { sh, list: out };
}

/** Works today — no API. Builds an "Export Ameex" sheet you can upload. */
function ameexExport() {
  const { list } = _orders();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!list.length) { ss.toast("Aucune commande au statut « Confirmée »."); return; }
  let ex = ss.getSheetByName("Export Ameex");
  if (ex) ex.clear(); else ex = ss.insertSheet("Export Ameex");
  ex.appendRow(["Nom", "Téléphone", "Ville", "Adresse", "Produit", "Prix COD (DH)", "Référence", "Note"]);
  ex.getRange(1, 1, 1, 8).setFontWeight("bold");
  list.forEach((o) => ex.appendRow([o.name, o.phone, o.city, o.address, o.items, o.total, o.ref, o.note]));
  ss.toast(list.length + " commande(s) exportée(s) → onglet « Export Ameex ».");
}

/** Ready for later — pushes each confirmed order to the Ameex API. */
function ameexSendApi() {
  const ui = SpreadsheetApp.getUi();
  if (!AMEEX.apiUrl || !AMEEX.token) {
    ui.alert("Ameex — API non configurée",
      "Demandez à Ameex : l'URL de l'API de création de colis + votre token, " +
      "puis renseignez-les en haut de ce script (objet AMEEX).", ui.ButtonSet.OK);
    return;
  }
  const { sh, list } = _orders();
  if (!list.length) { SpreadsheetApp.getActiveSpreadsheet().toast("Aucune commande « Confirmée »."); return; }
  let ok = 0, fail = 0;
  list.forEach((o) => {
    try {
      const res = UrlFetchApp.fetch(AMEEX.apiUrl, {
        method: "post", contentType: "application/json",
        headers: { Authorization: "Bearer " + AMEEX.token },
        payload: JSON.stringify(AMEEX.payload(o)),
        muteHttpExceptions: true,
      });
      const code = res.getResponseCode();
      let body = {};
      try { body = JSON.parse(res.getContentText()); } catch (e) {}
      if (code >= 200 && code < 300) {
        const tracking = AMEEX.readTracking(body);
        if (tracking) sh.getRange(o.row, COL.tracking).setValue(tracking);
        sh.getRange(o.row, COL.status).setValue("Expédiée");
        sh.getRange(o.row, COL.courier).setValue("Ameex");
        ok++;
      } else { fail++; }
    } catch (e) { fail++; }
  });
  ui.alert("Ameex", "Envoyées: " + ok + "  ·  Échecs: " + fail, ui.ButtonSet.OK);
}
