const SPREADSHEET_NAME = '2026_公司旅遊';
const HEADERS = ['姓名', 'Email', '單位', '電話', '職稱'];

function doGet() {
  const spreadsheet = getOrCreateSpreadsheet_();
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><meta charset="utf-8"><body>報名服務已啟用。</body></html>'
  ).setTitle(SPREADSHEET_NAME);
}

function doPost(e) {
  const data = e && e.parameter ? e.parameter : {};
  const requestId = String(data.requestId || '');

  try {
    const name = requiredValue_(data.name, '姓名');
    const email = requiredValue_(data.email, 'Email');
    const phone = requiredValue_(data.phone, '電話');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('請輸入有效的 Email。');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getOrCreateSpreadsheet_().getSheets()[0];
      sheet.getRange(1, 4, sheet.getMaxRows(), 1).setNumberFormat('@');
      sheet.appendRow([
        name,
        email,
        String(data.department || '').trim(),
        phone,
        String(data.title || '').trim()
      ]);
    } finally {
      lock.releaseLock();
    }

    return resultPage_(requestId, true, '');
  } catch (error) {
    console.error(error);
    return resultPage_(requestId, false, error.message || '資料儲存失敗，請稍後再試。');
  }
}

function getOrCreateSpreadsheet_() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  let spreadsheet = null;
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
      spreadsheet = SpreadsheetApp.openById(file.getId());
      break;
    }
  }
  if (!spreadsheet) spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);

  const sheet = spreadsheet.getSheets()[0];
  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
  if (currentHeaders.every(value => value === '')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  } else if (HEADERS.some((header, index) => currentHeaders[index] !== header)) {
    throw new Error('試算表第一列標題與報名欄位不符，請先確認試算表欄位。');
  }
  sheet.getRange(1, 4, sheet.getMaxRows(), 1).setNumberFormat('@');
  return spreadsheet;
}

function requiredValue_(value, label) {
  const normalized = String(value || '').trim();
  if (!normalized) throw new Error(label + '為必填欄位。');
  return normalized;
}

function resultPage_(requestId, ok, message) {
  const payload = JSON.stringify({
    type: 'registration-result',
    requestId: requestId,
    ok: ok,
    message: message
  }).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><meta charset="utf-8"><script>window.parent.postMessage(' +
      payload +
      ', "*");</script><body></body></html>'
  );
}
