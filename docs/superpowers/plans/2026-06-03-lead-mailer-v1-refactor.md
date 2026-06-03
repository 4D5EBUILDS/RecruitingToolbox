# Lead Mailer V1 Refactor Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. Work task by task, commit after each one.

**Goal:** Refactor Lead Mailer to output a clean Excel file for Word mail merge instead of generating letters directly, and add a downloadable template library section.

**Architecture:** Remove the docxtemplater letter-generation pipeline entirely. Replace the `/generate` + `/download` routes with a single `/download-clean/:sessionId` route that builds and streams a `.xlsx` file using the already-present `xlsx` library, marks leads as sent atomically, and cleans up the session. Add `/templates` and `/templates/:filename` routes. Update the frontend to match.

**Tech Stack:** Node.js, Express, xlsx (already installed), existing Army dark tactical CSS tokens.

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `server/index.js` | Modify | Remove merger import, OUTPUT_DIR, /generate, /download routes. Add /download-clean, /templates, /templates/:filename routes. |
| `server/merger.js` | Delete | Entire file removed. |
| `package.json` | Modify | Uninstall docxtemplater, pizzip, archiver. |
| `public/index.html` | Modify | Replace generate button + handler with download-clean link. Add Templates section. Update header subtitle. |

`server/parser.js`, `server/deduplicator.js`, `server/sent_log.json` — untouched.

---

## Task 1: Rewrite server/index.js

**Files:**
- Modify: `lead-mailer/server/index.js`

- [ ] **Step 1: Replace the entire file**

Write `lead-mailer/server/index.js` with this content:

```javascript
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
```

- [ ] **Step 2: Verify it starts cleanly**

```bash
cd lead-mailer
node server/index.js
# Expected: Lead Mailer running on http://localhost:3001
# No errors about missing merger module
```

Stop the server with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add lead-mailer/server/index.js
git commit -m "refactor(lead-mailer): replace generate/download routes with download-clean and templates routes"
```

---

## Task 2: Delete merger.js

**Files:**
- Delete: `lead-mailer/server/merger.js`

- [ ] **Step 1: Delete the file**

```bash
rm lead-mailer/server/merger.js
```

- [ ] **Step 2: Commit**

```bash
git add lead-mailer/server/merger.js
git commit -m "chore(lead-mailer): delete merger.js — letter generation removed from V1"
```

---

## Task 3: Remove unused dependencies from package.json

**Files:**
- Modify: `lead-mailer/package.json`
- Modify: `lead-mailer/package-lock.json` (auto-updated by npm)

- [ ] **Step 1: Uninstall the three removed packages**

```bash
cd lead-mailer
npm uninstall --cache /tmp/npm-cache docxtemplater pizzip archiver
```

Expected: package.json `dependencies` no longer contains `docxtemplater`, `pizzip`, or `archiver`. The `node_modules` entries for those packages are removed.

- [ ] **Step 2: Verify the server still starts after uninstall**

```bash
node server/index.js
# Expected: Lead Mailer running on http://localhost:3001
```

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add lead-mailer/package.json lead-mailer/package-lock.json
git commit -m "chore(lead-mailer): uninstall docxtemplater, pizzip, archiver"
```

---

## Task 4: Rewrite public/index.html

**Files:**
- Modify: `lead-mailer/public/index.html`

- [ ] **Step 1: Replace the entire file**

Write `lead-mailer/public/index.html` with this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lead Mailer // Lincoln North</title>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0a0a;
      --surface: #111;
      --border: #2a2a2a;
      --amber: #ffb300;
      --green: #4a5c3a;
      --text: #e0e0e0;
      --muted: #666;
      --danger: #c0392b;
      --success: #27ae60;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'IBM Plex Mono', monospace; min-height: 100vh; }
    header { background: var(--green); border-bottom: 2px solid var(--amber); padding: 16px 24px; display: flex; align-items: center; gap: 12px; }
    header h1 { font-family: 'Oswald', sans-serif; font-size: 1.4rem; letter-spacing: 2px; color: var(--amber); text-transform: uppercase; }
    header span { font-size: 0.75rem; color: #aaa; }
    .container { max-width: 720px; margin: 40px auto; padding: 0 20px; }
    .card { background: var(--surface); border: 1px solid var(--border); padding: 24px; margin-bottom: 24px; }
    .card h2 { font-family: 'Oswald', sans-serif; font-size: 1rem; letter-spacing: 1px; color: var(--amber); text-transform: uppercase; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
    .drop-zone { border: 2px dashed var(--border); padding: 40px; text-align: center; cursor: pointer; transition: border-color 0.2s; }
    .drop-zone:hover, .drop-zone.drag-over { border-color: var(--amber); }
    .drop-zone p { color: var(--muted); font-size: 0.85rem; margin-top: 8px; }
    .drop-zone .icon { font-size: 2rem; color: var(--amber); }
    input[type="file"] { display: none; }
    .btn { background: var(--amber); color: #000; border: none; padding: 10px 24px; font-family: 'Oswald', sans-serif; font-size: 0.95rem; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; width: 100%; margin-top: 12px; }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn.sm { width: auto; margin-top: 0; padding: 6px 14px; font-size: 0.8rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .stat { background: #0d0d0d; border: 1px solid var(--border); padding: 16px; text-align: center; }
    .stat .num { font-family: 'Oswald', sans-serif; font-size: 2rem; color: var(--amber); }
    .stat .label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .preview-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .preview-table th { text-align: left; color: var(--amber); font-family: 'Oswald', sans-serif; letter-spacing: 1px; padding: 6px 8px; border-bottom: 1px solid var(--border); }
    .preview-table td { padding: 6px 8px; border-bottom: 1px solid #1a1a1a; color: var(--text); }
    .template-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .template-row:last-child { border-bottom: none; }
    .template-name { font-size: 0.85rem; color: var(--text); }
    .msg { padding: 12px; font-size: 0.8rem; margin-top: 12px; }
    .msg.error { background: #1a0a0a; border-left: 3px solid var(--danger); color: #e74c3c; }
    .msg.success { background: #0a1a0a; border-left: 3px solid var(--success); color: #2ecc71; }
    .msg.info { background: #1a1500; border-left: 3px solid var(--amber); color: var(--amber); }
    .hidden { display: none; }
  </style>
</head>
<body>
  <header>
    <h1>★ Lead Mailer</h1>
    <span>Lincoln North Recruiting Station // iKrome Export → Clean Excel for Mail Merge</span>
  </header>

  <div class="container">

    <!-- Sent Log Status -->
    <div class="card">
      <h2>Sent Log Status</h2>
      <div class="stats-grid">
        <div class="stat"><div class="num" id="sentLogCount">—</div><div class="label">Total Sent</div></div>
        <div class="stat"><div class="num" id="statClean">—</div><div class="label">Ready to Merge</div></div>
        <div class="stat"><div class="num" id="statDupes">—</div><div class="label">Duplicates Removed</div></div>
      </div>
    </div>

    <!-- Step 1: Upload -->
    <div class="card">
      <h2>Step 1 — Upload iKrome Export</h2>
      <div class="drop-zone" id="dropZone">
        <div class="icon">📋</div>
        <strong>Drop your iKrome Excel export here</strong>
        <p>or click to browse — .xlsx files only</p>
      </div>
      <input type="file" id="fileInput" accept=".xlsx">
      <div id="uploadMsg"></div>
    </div>

    <!-- Step 2: Preview + Download -->
    <div class="card hidden" id="previewCard">
      <h2>Step 2 — Download Clean List</h2>
      <table class="preview-table">
        <thead><tr><th>First Name</th><th>Last Name</th><th>Email</th></tr></thead>
        <tbody id="previewBody"></tbody>
      </table>
      <p style="font-size:0.75rem;color:var(--muted);margin-top:8px;" id="previewNote"></p>
      <button class="btn" id="downloadBtn">Download Clean List & Mark as Sent</button>
      <div id="downloadMsg"></div>
    </div>

    <!-- Templates -->
    <div class="card">
      <h2>Word Templates</h2>
      <p style="font-size:0.75rem;color:var(--muted);margin-bottom:16px;">Download a pre-formatted Word template with mail merge fields built in. In Word: Mailings → Select Recipients → Use an Existing List → select your clean Excel.</p>
      <div id="templatesList"></div>
    </div>

  </div>

  <script>
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    let currentSessionId = null;

    // Load sent log count on page load
    fetch('/stats').then(r => r.json()).then(d => {
      document.getElementById('sentLogCount').textContent = d.totalSent;
    });

    // Load template list on page load
    fetch('/templates').then(r => r.json()).then(files => {
      const list = document.getElementById('templatesList');
      if (files.length === 0) {
        list.innerHTML = '<p style="font-size:0.8rem;color:var(--muted);">No templates found in the templates/ folder.</p>';
        return;
      }
      list.innerHTML = files.map(f => `
        <div class="template-row">
          <span class="template-name">${f.replace(/_/g, ' ')}</span>
          <a href="/templates/${encodeURIComponent(f)}" download style="text-decoration:none;">
            <button class="btn sm">Download</button>
          </a>
        </div>
      `).join('');
    }).catch(() => {
      document.getElementById('templatesList').innerHTML =
        '<p style="font-size:0.8rem;color:var(--muted);">Could not load templates.</p>';
    });

    // Drop zone events
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleUpload(fileInput.files[0]);
    });

    async function handleUpload(file) {
      if (!file.name.endsWith('.xlsx')) {
        showMsg('uploadMsg', 'error', 'File must be .xlsx format.');
        return;
      }
      showMsg('uploadMsg', 'info', 'Processing...');
      const formData = new FormData();
      formData.append('leads', file);
      try {
        const res = await fetch('/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) { showMsg('uploadMsg', 'error', data.error); return; }

        currentSessionId = data.sessionId;
        document.getElementById('statClean').textContent = data.totalClean;
        document.getElementById('statDupes').textContent = data.totalDupes;

        const tbody = document.getElementById('previewBody');
        tbody.innerHTML = '';
        data.preview.forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${p.First_Name}</td><td>${p.Last_Name}</td><td>${p.Email_Address}</td>`;
          tbody.appendChild(tr);
        });

        document.getElementById('previewNote').textContent =
          `Showing ${data.preview.length} of ${data.totalClean} new prospects. ${data.totalDupes} already in sent log.`;

        document.getElementById('previewCard').classList.remove('hidden');
        showMsg('uploadMsg', 'success', `Loaded ${data.totalIn} leads. ${data.totalClean} ready to download.`);
      } catch (err) {
        showMsg('uploadMsg', 'error', 'Upload failed. Is the server running?');
      }
    }

    // Download clean list — triggers file download, marks as sent server-side
    document.getElementById('downloadBtn').addEventListener('click', () => {
      if (!currentSessionId) return;
      showMsg('downloadMsg', 'info', 'Downloading...');
      window.location.href = `/download-clean/${currentSessionId}`;

      // Refresh stats and reset UI after download starts
      setTimeout(() => {
        fetch('/stats').then(r => r.json()).then(d => {
          document.getElementById('sentLogCount').textContent = d.totalSent;
        });
        document.getElementById('previewCard').classList.add('hidden');
        document.getElementById('previewBody').innerHTML = '';
        document.getElementById('statClean').textContent = '—';
        document.getElementById('statDupes').textContent = '—';
        currentSessionId = null;
        showMsg('uploadMsg', 'success', 'Clean list downloaded and leads marked as sent.');
      }, 1500);
    });

    function showMsg(id, type, text) {
      const el = document.getElementById(id);
      el.className = `msg ${type}`;
      el.textContent = text;
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Restart the server and verify in browser**

```bash
node lead-mailer/server/index.js
```

Open `http://localhost:3001` and confirm:
- "Word Templates" section appears with `parent_letter.docx` listed and a Download button
- Upload `WAHOO SENIORS.xlsx` → preview shows 4 leads, counts update
- Click "Download Clean List & Mark as Sent" → `clean_leads.xlsx` downloads
- Open `clean_leads.xlsx` — should have header row `First_Name | Last_Name | Email_Address` followed by 4 data rows
- Re-upload the same file → all 4 are now duplicates, totalClean = 0

- [ ] **Step 3: Commit**

```bash
git add lead-mailer/public/index.html
git commit -m "feat(lead-mailer): update UI — download clean list + templates section"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Upload + parse iKrome export — Task 1 `/upload` route (unchanged)
- ✅ Deduplicate against sent log — Task 1 (deduplicator unchanged)
- ✅ Output clean `.xlsx` with `First_Name`, `Last_Name`, `Email_Address` — Task 1 `/download-clean`
- ✅ Mark as sent on download — Task 1 `/download-clean` calls `markAsSent` before responding
- ✅ Template library with download buttons — Task 1 `/templates` routes + Task 4 UI section
- ✅ Remove `/generate` route — Task 1
- ✅ Remove `/download/:sessionId` route — Task 1
- ✅ Delete `merger.js` — Task 2
- ✅ Remove `docxtemplater`, `pizzip`, `archiver` — Task 3
- ✅ Keep `/stats`, `/upload`, parser, deduplicator, sent log, UI aesthetic — all tasks

**Placeholder scan:** None found.

**Type consistency:** `markAsSent(emails[])` used in Task 1 matches the signature in `deduplicator.js`. `parseIKromeExport(filePath)` unchanged. `deduplicate(prospects)` returns `{ clean, dupes, totalIn }` — used correctly in `/upload`.
