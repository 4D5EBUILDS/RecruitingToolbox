const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const { parseIKromeExport } = require('./parser');
const { deduplicate, markAsSent, getLogStats } = require('./deduplicator');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const upload = multer({ dest: path.join(__dirname, '../uploads/') });
const TEMPLATES_DIR = path.join(__dirname, '../templates');

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// POST /debug-upload — dumps raw sheet rows for format debugging
app.post('/debug-upload', upload.single('leads'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const workbook = XLSX.readFile(req.file.path);
    const result = {};
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      result[sheetName] = rows.slice(0, 15);
    }
    fs.unlinkSync(req.file.path);
    res.json({ sheets: workbook.SheetNames, rows: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /upload — parse + deduplicate iKrome export, store session
app.post('/upload', upload.single('leads'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const prospects = parseIKromeExport(req.file.path);
    if (prospects.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No valid leads found in file. Check column format.' });
    }

    const { clean, dupes, totalIn } = deduplicate(prospects);

    const sessionId = req.file.filename;
    fs.writeFileSync(
      path.join(__dirname, '../uploads', `${sessionId}_clean.json`),
      JSON.stringify(clean)
    );

    fs.unlinkSync(req.file.path);

    res.json({
      sessionId,
      totalIn,
      totalClean: clean.length,
      totalDupes: dupes.length,
      preview: clean.slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file: ' + err.message });
  }
});

// GET /download-clean/:sessionId — build clean .xlsx, mark as sent, download
app.get('/download-clean/:sessionId', (req, res) => {
  try {
    const cleanPath = path.join(__dirname, '../uploads', `${req.params.sessionId}_clean.json`);
    if (!fs.existsSync(cleanPath)) {
      return res.status(404).json({ error: 'Session expired or not found. Please re-upload.' });
    }

    const prospects = JSON.parse(fs.readFileSync(cleanPath, 'utf8'));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      prospects.map(p => ({
        First_Name: p.First_Name,
        Last_Name: p.Last_Name,
        Email_Address: p.Email_Address,
      }))
    );
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    markAsSent(prospects.map(p => p.Email_Address));
    fs.unlinkSync(cleanPath);

    res.setHeader('Content-Disposition', 'attachment; filename="clean_leads.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate clean list: ' + err.message });
  }
});

// GET /templates — list available .docx templates
app.get('/templates', (req, res) => {
  try {
    const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.docx'));
    res.json(files);
  } catch (err) {
    res.json([]);
  }
});

// GET /templates/:filename — download a template file
app.get('/templates/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename.endsWith('.docx')) {
    return res.status(400).json({ error: 'Invalid file type.' });
  }
  const filePath = path.join(TEMPLATES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Template not found.' });
  }
  res.download(filePath);
});

// GET /stats — sent log count
app.get('/stats', (req, res) => {
  res.json(getLogStats());
});

app.listen(PORT, () => {
  console.log(`Lead Mailer running on http://localhost:${PORT}`);
});

module.exports = app;
