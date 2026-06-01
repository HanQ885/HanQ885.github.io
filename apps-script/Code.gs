const SPREADSHEET_ID = '15JTTxdZCHaMpE0208J8-u8Z4djbqDahcJqWAhNw4F_8';
const SHEET_NAME = 'responses';

const HEADERS = [
  'timestamp_server',
  'submitted_at_client',
  'privacy_consent',
  'affiliation',
  'name',
  'grade',
  'phone',
  'phone_normalized',
  'normal_prefer_1',
  'normal_prefer_2',
  'normal_prefer_3',
  'normal_avoid_1',
  'normal_avoid_2',
  'normal_avoid_3',
  'group_prefer_1',
  'group_prefer_2',
  'group_prefer_3',
  'group_avoid_1',
  'group_avoid_2',
  'group_avoid_3',
  'focus_score',
  'user_agent',
  'submission_id',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = parsePayload(e);
    const validationError = validatePayload(payload);
    if (validationError) {
      return jsonResponse({ ok: false, error: validationError });
    }

    const sheet = getResponseSheet();
    ensureHeaders(sheet);

    const phoneNormalized = normalizePhone(payload.phoneNormalized || payload.phone);
    if (hasDuplicatePhone(sheet, phoneNormalized)) {
      return jsonResponse({ ok: false, duplicate: true });
    }

    const submissionId = Utilities.getUuid();
    const row = [
      new Date(),
      value(payload.submittedAtClient),
      payload.privacyConsent === true || payload.privacyConsent === 'true',
      value(payload.affiliation),
      value(payload.name),
      value(payload.grade),
      value(payload.phone),
      phoneNormalized,
      value(payload.normalPrefer1),
      value(payload.normalPrefer2),
      value(payload.normalPrefer3),
      value(payload.normalAvoid1),
      value(payload.normalAvoid2),
      value(payload.normalAvoid3),
      value(payload.groupPrefer1),
      value(payload.groupPrefer2),
      value(payload.groupPrefer3),
      value(payload.groupAvoid1),
      value(payload.groupAvoid2),
      value(payload.groupAvoid3),
      Number(payload.focusScore),
      value(payload.userAgent),
      submissionId,
    ];

    appendTextSafeRow(sheet, row);
    return jsonResponse({
      ok: true,
      duplicate: false,
      submission_id: submissionId,
      spreadsheet_id: SPREADSHEET_ID,
      sheet_name: SHEET_NAME,
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse({
    ok: true,
    message: 'Seat survey endpoint is running.',
    spreadsheet_id: SPREADSHEET_ID,
    sheet_name: SHEET_NAME,
    spreadsheet_url: 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit',
  });
}

function parsePayload(e) {
  if (!e) return {};
  const contents = e.postData && e.postData.contents ? e.postData.contents : '';
  if (contents) {
    try {
      return JSON.parse(contents);
    } catch (error) {
      return e.parameter || {};
    }
  }
  return e.parameter || {};
}

function validatePayload(payload) {
  if (payload.privacyConsent !== true && payload.privacyConsent !== 'true') return 'privacy_consent_required';

  const requiredFields = [
    'affiliation', 'name', 'grade', 'phone',
    'normalPrefer1', 'normalPrefer2', 'normalPrefer3',
    'normalAvoid1', 'normalAvoid2', 'normalAvoid3',
    'groupPrefer1', 'groupPrefer2', 'groupPrefer3',
    'groupAvoid1', 'groupAvoid2', 'groupAvoid3',
    'focusScore',
  ];

  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null || String(payload[field]).trim() === '') {
      return 'missing_' + field;
    }
  }

  const phoneNormalized = normalizePhone(payload.phoneNormalized || payload.phone);
  if (phoneNormalized.length < 10) return 'invalid_phone';

  const focusScore = Number(payload.focusScore);
  if (!Number.isInteger(focusScore) || focusScore < 1 || focusScore > 5) return 'invalid_focus_score';

  if (!hasUniqueValues([payload.normalPrefer1, payload.normalPrefer2, payload.normalPrefer3])) return 'duplicate_normal_prefer';
  if (!hasUniqueValues([payload.normalAvoid1, payload.normalAvoid2, payload.normalAvoid3])) return 'duplicate_normal_avoid';
  if (!hasUniqueValues([payload.groupPrefer1, payload.groupPrefer2, payload.groupPrefer3])) return 'duplicate_group_prefer';
  if (!hasUniqueValues([payload.groupAvoid1, payload.groupAvoid2, payload.groupAvoid3])) return 'duplicate_group_avoid';

  return '';
}

function getResponseSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const isEmpty = firstRow.every((cell) => String(cell).trim() === '');
  if (isEmpty) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}

function appendTextSafeRow(sheet, row) {
  const nextRow = Math.max(sheet.getLastRow() + 1, 2);
  const phoneColumn = HEADERS.indexOf('phone') + 1;
  const phoneNormalizedColumn = HEADERS.indexOf('phone_normalized') + 1;
  sheet.getRange(nextRow, phoneColumn, 1, 1).setNumberFormat('@');
  sheet.getRange(nextRow, phoneNormalizedColumn, 1, 1).setNumberFormat('@');
  sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([row]);
}

function hasDuplicatePhone(sheet, phoneNormalized) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const phoneColumn = HEADERS.indexOf('phone_normalized') + 1;
  const values = sheet.getRange(2, phoneColumn, lastRow - 1, 1).getDisplayValues();
  const withoutLeadingZero = phoneNormalized.replace(/^0+/, '');

  return values.some((row) => {
    const existing = normalizePhone(row[0]);
    return existing === phoneNormalized || existing === withoutLeadingZero || '0' + existing === phoneNormalized;
  });
}

function hasUniqueValues(values) {
  const normalized = values.map((item) => String(item));
  return new Set(normalized).size === normalized.length;
}

function normalizePhone(input) {
  return String(input || '').replace(/[^0-9]/g, '');
}

function value(input) {
  return input === undefined || input === null ? '' : String(input).trim();
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
