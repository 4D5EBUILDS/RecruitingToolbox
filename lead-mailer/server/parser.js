const XLSX = require('xlsx');

/**
 * Parses an iKrome Excel export.
 * Expects Column A = Name (either "First Last" or "Last, First")
 * Expects Column B = Email
 * Data starts at row 6 (rows 1-5 are headers/settings in the template).
 * Returns array of { First_Name, Last_Name, Email_Address }
 */
function parseIKromeExport(filePath) {
  const workbook = XLSX.readFile(filePath);

  const sheetName = workbook.SheetNames.includes('PASTE RAW DATA HERE')
    ? 'PASTE RAW DATA HERE'
    : workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  let nameFormat = 'First Last';
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    const cell = String(rows[i][1] || '').trim();
    if (cell === 'Last First' || cell.includes('Last First')) {
      nameFormat = 'Last First';
      break;
    }
  }

  const results = [];

  for (let i = 5; i < rows.length; i++) {
    const rawName = String(rows[i][0] || '').trim();
    const email = String(rows[i][1] || '').trim().toLowerCase();

    if (!rawName || !email) continue;
    if (!email.includes('@')) continue;

    let firstName = '';
    let lastName = '';

    if (nameFormat === 'Last First') {
      const parts = rawName.replace(',', '').trim().split(/\s+/);
      lastName = parts[0] || '';
      firstName = parts.slice(1).join(' ') || '';
    } else {
      const parts = rawName.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    firstName = capitalize(firstName);
    lastName = capitalize(lastName);

    if (firstName && lastName && email) {
      results.push({ First_Name: firstName, Last_Name: lastName, Email_Address: email });
    }
  }

  return results;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = { parseIKromeExport };
