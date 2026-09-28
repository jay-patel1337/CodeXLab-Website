/**
 * CodeXLab form receiver: deploy as a Web App (see README.md in this folder).
 * The Next.js route /api/submit POSTs { type, secret, data } here.
 */

/** @OnlyCurrentDoc  Access to this one spreadsheet only, not every Sheet in the account. */

const SHEETS = {
  join: {
    name: "Join",
    columns: ["timestamp", "intent", "name", "email", "branch", "year", "enrollment", "rollNo", "interests", "message"],
  },
  feedback: {
    name: "Feedback",
    columns: ["timestamp", "sessionId", "sessionTitle", "rating", "worked", "improve", "name"],
  },
};

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const expected = PropertiesService.getScriptProperties().getProperty("SECRET") || "";
    if (expected && body.secret !== expected) return json({ ok: false, error: "unauthorized" });

    const cfg = SHEETS[body.type];
    if (!cfg) return json({ ok: false, error: "unknown type" });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getSheet(cfg);
      const data = body.data || {};
      const row = cfg.columns.map(function (col) {
        if (col === "timestamp") return new Date();
        const v = data[col];
        return Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v);
      });
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function getSheet(cfg) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(cfg.name);
  if (!sheet) sheet = ss.insertSheet(cfg.name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.columns);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
