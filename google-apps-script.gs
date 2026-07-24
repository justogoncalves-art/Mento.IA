/**
 * MENTO.IA — Formulario de demo → Google Sheets + aviso por email
 * ----------------------------------------------------------------
 * CÓMO INSTALARLO (una sola vez, ~2 minutos):
 *
 * 1. Abre tu hoja:
 *    https://docs.google.com/spreadsheets/d/1IwvEL96Pf4I3kY_vLoUuLqHLz5E1vB2icoifgrTilgk/edit
 * 2. Menú: Extensiones → Apps Script
 * 3. Borra el contenido del editor y pega ESTE archivo completo. Guarda (⌘/Ctrl+S).
 * 4. Botón "Implementar" (Deploy) → "Nueva implementación" →
 *    tipo: "Aplicación web" →
 *      - Ejecutar como: "Yo"
 *      - Quién tiene acceso: "Cualquier usuario"
 *    → Implementar → autoriza con tu cuenta → copia la URL (termina en /exec).
 * 5. Abre index.html y pega esa URL en:
 *      window.MENTO_FORM_ENDPOINT = "AQUÍ";
 * 6. Sube index.html actualizado a GitHub. Listo: cada envío añade una fila
 *    a la hoja y te llega un aviso a hola@mypathia.com.
 *
 * 7. SLACK (recomendado): para que cada lead aparezca en el canal #leads
 *    (C0BKLJYJ8L9), crea un Incoming Webhook en Slack:
 *      slack.com → Apps → busca "Incoming Webhooks" → Add to Slack →
 *      elige el canal → copia la URL (https://hooks.slack.com/services/...)
 *    y pégala abajo en SLACK_WEBHOOK_URL. Vuelve a implementar (Deploy →
 *    gestionar implementaciones → editar → nueva versión).
 */

var EMAIL_TO = "hola@mypathia.com";
var SLACK_WEBHOOK_URL = ""; // ← PEGA AQUÍ tu Incoming Webhook SOLO dentro del editor de Apps Script. NUNCA lo subas al repo (GitHub lo bloquea como secreto).

function postToSlack(p) {
  if (!SLACK_WEBHOOK_URL) return;
  var text =
    ":bust_in_silhouette: *Nuevo lead · Mento.IA*\n" +
    "*Nombre:* " + ((p.nombre || "") + " " + (p.apellido || "")).trim() + "\n" +
    "*Correo:* " + (p.email || "—") + "\n" +
    "*Teléfono:* " + (p.telefono || "—") + "\n" +
    "*Institución:* " + (p.colegio || "—") + "\n" +
    "*Cargo:* " + (p.cargo || "—") + "\n" +
    "*País:* " + (p.pais || "—") + "\n" +
    "*Motivo:* " + (p.motivo || "—") + "\n" +
    "*Plataforma:* " + (p.plataforma || "Mento.IA") + " · *Idioma web:* " + (p.lang || "").toUpperCase();
  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ text: text }),
    muteHttpExceptions: true
  });
}

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheets()[0];

    // Encabezados (solo la primera vez)
    if (sh.getLastRow() === 0) {
      sh.appendRow(["Fecha", "Plataforma", "Nombre", "Apellido", "Correo electrónico", "Teléfono", "Institución", "Cargo", "País", "Motivo", "Idioma"]);
      sh.getRange(1, 1, 1, 11).setFontWeight("bold");
    }

    sh.appendRow([
      new Date(),
      p.plataforma || "Mento.IA",
      p.nombre || "",
      p.apellido || "",
      p.email || "",
      p.telefono || "",
      p.colegio || "",
      p.cargo || "",
      p.pais || "",
      p.motivo || "",
      (p.lang || "").toUpperCase()
    ]);

    // Aviso a Slack (canal de leads C0BKLJYJ8L9)
    try { postToSlack(p); } catch (slackErr) { /* no romper el guardado si Slack falla */ }

    // Aviso por correo
    MailApp.sendEmail({
      to: EMAIL_TO,
      subject: "Solicitud de demo · Mento.IA — " + (p.nombre || "") + " " + (p.apellido || ""),
      body:
        "Nueva solicitud de demo desde la web de Mento.IA:\n\n" +
        "Plataforma: " + (p.plataforma || "Mento.IA") + "\n" +
        "Nombre: " + (p.nombre || "") + " " + (p.apellido || "") + "\n" +
        "Correo: " + (p.email || "") + "\n" +
        "Teléfono: " + (p.telefono || "(no indicado)") + "\n" +
        "Institución: " + (p.colegio || "") + "\n" +
        "Cargo: " + (p.cargo || "") + "\n" +
        "País: " + (p.pais || "(no indicado)") + "\n" +
        "Motivo: " + (p.motivo || "(no indicado)") + "\n" +
        "Idioma de la web: " + (p.lang || "") + "\n\n" +
        "Guardado también en la hoja de cálculo."
    });

    return ContentService.createTextOutput("OK");
  } catch (err) {
    return ContentService.createTextOutput("ERROR: " + err);
  }
}
