const XLSX = require('xlsx');

/**
 * Parses an iKrome leads export (SearchResults sheet).
 * Finds Name and Email Address columns by header name — tolerates any column order.
 * Handles "First Last", "Last, First", and "Last First" name formats.
 * Returns array of { First_Name, Last_Name, Email_Address }
 */
function parseIKromeExport(filePath) {
  const workbook = XLSX.readFile(filePath);

  // Prefer known sheet names, fall back to first sheet
  const preferred = ['SearchResults', 'PASTE RAW DATA HERE', 'Sheet1'];
  const sheetName =
    preferred.find(n => workbook.SheetNames.includes(n)) || workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rows.length < 2) return [];

  // Find header row — first row that contains something resembling "name" or "email"
  let headerRowIndex = -1;
  let nameColIndex = -1;
  let emailColIndex = -1;

  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i].map(c => String(c).toLowerCase().trim());
    const ni = row.findIndex(c => c === 'name' || c === 'full name' || c === 'student name');
    const ei = row.findIndex(c => c.includes('email'));
    if (ni !== -1 && ei !== -1) {
      headerRowIndex = i;
      nameColIndex = ni;
      emailColIndex = ei;
      break;
    }
    // Allow partial match — if we find email column at least, note it
    if (ei !== -1 && emailColIndex === -1) {
      emailColIndex = ei;
      headerRowIndex = i;
    }
  }

  // Fallback: scan every row for one that contains an @ — that row's column is the email column
  if (emailColIndex === -1) {
    for (let i = 0; i < rows.length; i++) {
      const ei = rows[i].findIndex(c => String(c).includes('@'));
      if (ei !== -1) {
        emailColIndex = ei;
        // Name is probably the column just before email, or we scan headers above
        nameColIndex = ei - 1 >= 0 ? ei - 1 : 0;
        headerRowIndex = i - 1;
        break;
      }
    }
  }

  if (emailColIndex === -1) return [];

  const dataStartRow = headerRowIndex + 1;
  const results = [];

  for (let i = dataStartRow; i < rows.length; i++) {
    const row = rows[i];
    const email = String(row[emailColIndex] || '').trim().toLowerCase();
    if (!email || !email.includes('@')) continue;

    let rawName = nameColIndex !== -1 ? String(row[nameColIndex] || '').trim() : '';

    // If no dedicated name column, try to assemble from surrounding cells
    if (!rawName) {
      rawName = row.map(c => String(c)).filter(c => c && !c.includes('@') && isNaN(c)).join(' ').trim();
    }

    if (!rawName) continue;

    const { firstName, lastName } = splitName(rawName);
    if (!firstName || !lastName) continue;

    results.push({
      First_Name: firstName,
      Last_Name: lastName,
      Email_Address: email,
    });
  }

  return results;
}

function splitName(raw) {
  const cleaned = raw.trim();

  // "Last, First" format
  if (cleaned.includes(',')) {
    const [last, ...rest] = cleaned.split(',');
    return {
      lastName: capitalize(last.trim()),
      firstName: rest.join(' ').trim().split(/\s+/).map(capitalize).join(' '),
    };
  }

  // "First Last" or "Last First" — assume "First Last" (most common in iKrome)
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return { firstName: capitalize(parts[0]), lastName: '' };

  return {
    firstName: parts.slice(0, -1).map(capitalize).join(' '),
    lastName: capitalize(parts[parts.length - 1]),
  };
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = { parseIKromeExport };
