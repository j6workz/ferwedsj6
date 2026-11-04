/**
 * RSVP → Telegram (+ Google Sheet) relay for fer.weds.j6.studio
 *
 * The website can't hold the Telegram bot token (anyone can read the page source), so the RSVP form posts here and
 * this Google Apps Script, running under Jawahar's Google account, keeps the token private, sends the Telegram
 * message and appends a row to the sheet it is attached to. Firestore stays the main store; this is a copy + alert.
 *
 * Setup (once):
 *  1. Telegram → @BotFather → /newbot → copy the token.
 *  2. Open a chat with the new bot and send "hi" (or add the bot to a group with Ferina and say "hi" there).
 *  3. Google Sheets → new sheet → File › Settings › Time zone: (GMT+07:00) Jakarta.
 *     Extensions › Apps Script → replace Code.gs with this file → Project Settings (gear) › Script properties:
 *     add TELEGRAM_TOKEN = <the token>.
 *  4. In the editor pick the function `setup` → Run → allow the permissions. You get "✅ RSVP alerts connected".
 *  5. Deploy › New deployment › type "Web app" › Execute as: Me › Who has access: Anyone → Deploy → copy the URL
 *     (ends in /exec). That URL goes into rsvp.js (NOTIFY_URL) and analytics.js.
 *
 * Guest activity (added later): paste the new version, run `setupAnalytics` once, then Deploy › Manage deployments ›
 * ✏️ Edit › Version: New version › Deploy (the /exec URL stays the same).
 */

const SHEET_NAME = 'RSVPs';

const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
// guest-typed text must never become a sheet formula (=IMPORTXML(...) could leak the sheet): a leading = + - @ is
// written as plain text by prefixing an apostrophe, which Sheets hides
const cell = (s) => /^[=+\-@\t\r]/.test(s) ? "'" + s : s;

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out_('bad'); }
  if (d.type === 'events') return events_(d);
  const name = clean(d.name, 150), msg = clean(d.message, 500), phone = clean(d.phone, 20), page = clean(d.page, 40);
  const att = d.attending === 'yes' ? 'yes' : d.attending === 'no' ? 'no' : '';
  const guests = att === 'yes' ? Math.max(1, Math.min(10, parseInt(d.guests, 10) || 1)) : 0;
  if (!name || !att) return out_('bad');

  // flood guard: the URL is public, so cap it at 30 submissions per 10 minutes
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('n') || 0);
  if (n >= 30) return out_('busy');
  cache.put('n', String(n + 1), 600);

  const sh = sheet_();
  sh.appendRow([new Date(), cell(name), att, guests, cell(msg), cell(phone), cell(page)]);

  const lines = [
    '🤍 New RSVP' + (page ? ' (' + page + ')' : ''),
    name + ' — ' + (att === 'yes' ? '✅ attending, ' + guests + (guests === 1 ? ' person' : ' people') : "❌ can't make it"),
  ];
  if (msg) lines.push('', '“' + msg + '”');
  if (phone) lines.push('', '📞 ' + phone);
  telegram_(lines.join('\n'));
  return out_('ok');
}

// ---------- guest activity (analytics.js on the invitation) ----------
// One row per event in "Events"; "Summary" (formulas, made by setupAnalytics) rolls it up per guest.
const EVENTS_SHEET = 'Events';
function events_(d) {
  const list = Array.isArray(d.events) ? d.events.slice(0, 40) : [];
  if (!list.length) return out_('bad');
  const cache = CacheService.getScriptCache();            // flood guard for the public URL: 600 batches / 10 min
  const n = Number(cache.get('ev') || 0);
  if (n >= 600) return out_('busy');
  cache.put('ev', String(n + 1), 600);

  const vid = clean(d.vid, 12), guest = clean(d.guest, 150), page = clean(d.page, 20), lang = clean(d.lang, 5), device = clean(d.device, 30);
  const rows = list.map((ev) => {
    const t = new Date(ev.t); return [isNaN(t) ? new Date() : t, cell(guest || '(no name) ' + vid), cell(clean(ev.event, 30)), cell(clean(ev.detail, 80)), cell(page), cell(lang), cell(device), cell(vid)];
  });
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = eventsSheet_();
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  } finally { lock.releaseLock(); }

  // Telegram ping the first time a guest opens the envelope. The URL is public, so: remembered in the cache (expires,
  // nothing piles up in the settings store), keyed by guest name (made-up device ids can't multiply the pings),
  // and at most 25 pings per hour overall; everything is still logged in the sheet either way.
  if (list.some((ev) => ev.event === 'open_invitation')) {
    const who = (guest || 'device ' + vid).toLowerCase().slice(0, 100);
    const sent = Number(cache.get('pings') || 0);
    if (!cache.get('seen:' + who) && sent < 25) {
      cache.put('seen:' + who, '1', 21600);              // 6 h: a guest re-opening later the same day doesn't ping again
      cache.put('pings', String(sent + 1), 3600);
      telegram_('👀 ' + (guest || 'Someone without a name in the link') + ' opened the invitation (' + page + ' · ' + lang + ' · ' + device + ')');
    }
  }
  return out_('ok');
}

function eventsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(EVENTS_SHEET) || ss.insertSheet(EVENTS_SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Time', 'Guest', 'Event', 'Detail', 'Page', 'Language', 'Device', 'Visitor id']);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Run once after pasting this version: makes the "Summary" tab (one row per guest, live formulas over "Events").
function setupAnalytics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  eventsSheet_();
  const sh = ss.getSheetByName('Summary') || ss.insertSheet('Summary', 0);
  sh.clear();
  sh.getRange('A1').setFormula(
    '=QUERY({Events!B2:B, Events!A2:A, Events!C2:C,' +
    ' ARRAYFORMULA(IF(Events!C2:C="visit",1,0)),' +
    ' ARRAYFORMULA(IF(Events!C2:C="open_invitation",1,0)),' +
    ' ARRAYFORMULA(IF((Events!C2:C="view")*(Events!D2:D="gift"),1,0)),' +
    ' ARRAYFORMULA(IF(LEFT(Events!C2:C,5)="gift_",1,0)),' +
    ' ARRAYFORMULA(IF(Events!C2:C="rsvp_field",1,0)),' +
    ' ARRAYFORMULA(IF(Events!C2:C="rsvp_submit",1,0))},' +
    ' "select Col1, min(Col2), max(Col2), sum(Col4), sum(Col5), sum(Col6), sum(Col7), sum(Col8), sum(Col9)' +
    ' where Col1 is not null group by Col1 order by max(Col2) desc' +
    ' label Col1 \'Guest\', min(Col2) \'First seen\', max(Col2) \'Last seen\', sum(Col4) \'Visits\',' +
    ' sum(Col5) \'Opened envelope\', sum(Col6) \'Reached gift\', sum(Col7) \'Gift taps\',' +
    ' sum(Col8) \'Wish fields tapped\', sum(Col9) \'Sent wish\'", 0)');
  sh.setFrozenRows(1);
  sh.getRange('B:C').setNumberFormat('d mmm, HH:mm');
  return 'Summary ready';
}

// Run once from the editor after messaging the bot: finds the chat and stores its id, then sends a test message.
function setup() {
  const p = PropertiesService.getScriptProperties();
  const token = p.getProperty('TELEGRAM_TOKEN');
  if (!token) throw new Error('Add the script property TELEGRAM_TOKEN first (Project Settings › Script properties).');
  const r = JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/getUpdates').getContentText());
  const chats = (r.result || []).map((u) => (u.message || u.my_chat_member || u.channel_post || {}).chat).filter(Boolean);
  if (!chats.length) throw new Error('No messages yet: send "hi" to the bot (or in the group with the bot), then run setup again.');
  const c = chats[chats.length - 1];
  p.setProperty('TELEGRAM_CHAT_ID', String(c.id));
  sheet_();
  telegram_('✅ RSVP alerts connected to ' + (c.title || c.first_name || 'this chat') + '. New wishes from the invitation will appear here.');
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Received', 'Name', 'Attending', 'Guests', 'Wish', 'Phone', 'Page']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function telegram_(text) {
  const p = PropertiesService.getScriptProperties();
  UrlFetchApp.fetch('https://api.telegram.org/bot' + p.getProperty('TELEGRAM_TOKEN') + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: p.getProperty('TELEGRAM_CHAT_ID'), text: text, disable_web_page_preview: true }),
    muteHttpExceptions: true,
  });
}

function out_(s) { return ContentService.createTextOutput(s); }
