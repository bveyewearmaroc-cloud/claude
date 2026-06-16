/**
 * BV EYEWEAR — Order logger (Google Apps Script)
 * Saves every COD order to a Google Sheet (and optionally emails you),
 * as a safety net alongside the WhatsApp order.
 *
 * SETUP (5 minutes):
 *  1. Create a Google Sheet (e.g. "BV Orders").
 *  2. Extensions ▸ Apps Script. Delete the sample, paste this file.
 *  3. (Optional) put your email in NOTIFY_EMAIL below.
 *  4. Deploy ▸ New deployment ▸ type "Web app".
 *       Execute as: Me   ·   Who has access: Anyone
 *  5. Copy the Web app URL and paste it into js/products.js:
 *       BV_CONFIG.orderEndpoint = "https://script.google.com/macros/s/.../exec"
 *
 * Orders then land in the sheet automatically on every checkout.
 */

const NOTIFY_EMAIL = ""; // e.g. "you@bveyewear.ma" — leave "" to skip email

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Orders") || ss.insertSheet("Orders");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Date", "Réf", "Nom", "Téléphone", "Ville", "Adresse", "Note", "Articles", "Total (DH)"]);
    }
    const items = (data.items || [])
      .map((i) => i.qty + "x " + i.name + " (" + i.color + ")")
      .join(", ");
    sheet.appendRow([
      new Date(), data.ref || "", data.name || "", data.phone || "",
      data.city || "", data.address || "", data.notes || "", items, data.total || "",
    ]);
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(
        NOTIFY_EMAIL,
        "Nouvelle commande " + (data.ref || "") + " — " + (data.total || "") + " DH",
        "Client: " + data.name + "\nTél: " + data.phone + "\nVille: " + data.city +
          "\nAdresse: " + data.address + "\nNote: " + (data.notes || "") +
          "\n\nArticles: " + items + "\nTotal: " + data.total + " DH"
      );
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
