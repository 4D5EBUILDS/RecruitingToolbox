const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { parseIKromeExport } = require('./parser');
const { deduplicate, markAsSent, getLogStats } = require('./deduplicator');
const { generateMergedDoc } = require('./merger');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// Ensure output dir exists
const OUTPUT_DIR = path.join(__dirname, '../output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// POST /upload — accepts Excel file, returns preview data
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

// POST /generate — generates merged docs for sessionId
app.post('/generate', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });

    const cleanPath = path.join(__dirname, '../uploads', `${sessionId}_clean.json`);
    if (!fs.existsSync(cleanPath)) {
      return res.status(404).json({ error: 'Session expired or not found. Please re-upload.' });
    }

    const prospects = JSON.parse(fs.readFileSync(cleanPath, 'utf8'));
    const outputPath = path.join(OUTPUT_DIR, `${sessionId}_letters.zip`);

    await generateMergedDoc(prospects, outputPath);

    markAsSent(prospects.map(p => p.Email_Address));

    fs.unlinkSync(cleanPath);

    res.json({ downloadUrl: `/download/${sessionId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate documents: ' + err.message });
  }
});

// GET /download/:sessionId — serve the zip
app.get('/download/:sessionId', (req, res) => {
  const filePath = path.join(OUTPUT_DIR, `${req.params.sessionId}_letters.zip`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found or already downloaded.' });
  }
  res.download(filePath, 'army_letters.zip', () => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
});

// GET /stats — sent log stats
app.get('/stats', (req, res) => {
  res.json(getLogStats());
});

app.listen(PORT, () => {
  console.log(`Lead Mailer running on http://localhost:${PORT}`);
});

module.exports = app;
