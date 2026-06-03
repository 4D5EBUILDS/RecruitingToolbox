const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'sent_log.json');

function loadSentLog() {
  if (!fs.existsSync(LOG_PATH)) {
    fs.writeFileSync(LOG_PATH, JSON.stringify({ sent: [] }));
  }
  const raw = fs.readFileSync(LOG_PATH, 'utf8');
  return JSON.parse(raw);
}

function saveSentLog(log) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

function deduplicate(prospects) {
  const log = loadSentLog();
  const sentEmails = new Set(log.sent.map(e => e.toLowerCase()));

  const clean = [];
  const dupes = [];

  for (const p of prospects) {
    if (sentEmails.has(p.Email_Address.toLowerCase())) {
      dupes.push(p);
    } else {
      clean.push(p);
    }
  }

  return { clean, dupes, totalIn: prospects.length };
}

function markAsSent(emails) {
  const log = loadSentLog();
  const existing = new Set(log.sent.map(e => e.toLowerCase()));
  for (const email of emails) {
    if (!existing.has(email.toLowerCase())) {
      log.sent.push(email.toLowerCase());
    }
  }
  saveSentLog(log);
}

function getLogStats() {
  const log = loadSentLog();
  return { totalSent: log.sent.length };
}

module.exports = { deduplicate, markAsSent, getLogStats };
