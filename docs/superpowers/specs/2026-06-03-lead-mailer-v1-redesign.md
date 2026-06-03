# Lead Mailer V1 Redesign
**Date:** 2026-06-03
**Status:** Approved

## Problem

The initial Lead Mailer build generated individual Word letters using docxtemplater and zipped them for download. This is the wrong level of automation — recruiters at Lincoln North need to run mail merges through Outlook themselves, and the Army's letter templates require proper Word mail merge fields (`«First_Name»` etc.), not programmatic text substitution. The current build also assumed a fixed iKrome column layout that doesn't match real exports.

## Goal

Refocus the app to do exactly one thing well: take a raw iKrome export, clean it, deduplicate it against a persistent sent log, and hand back a ready-to-use Excel file that drops directly into a Word mail merge. A template library gives recruiters the correctly-formatted `.docx` starting points.

## What Changes

### Remove
- `/generate` route (creates individual letters)
- `/download/:sessionId` route (serves zip)
- `server/merger.js`
- npm dependencies: `docxtemplater`, `pizzip`, `archiver`

### Keep
- `server/parser.js` — iKrome Excel parser (already fixed to handle real SearchResults format)
- `server/deduplicator.js` — sent log load/check/save
- `server/sent_log.json` — persistent deduplication log
- `/upload` route
- `/stats` route
- Frontend UI aesthetic (Army dark tactical)

### Add
- `/download-clean/:sessionId` route
- `/templates` route (list available templates)
- `/templates/:filename` route (serve a template file)
- Templates section in the frontend UI

## Architecture

```
lead-mailer/
├── server/
│   ├── index.js          # Routes (upload, download-clean, templates, stats)
│   ├── parser.js         # iKrome Excel parser — unchanged
│   ├── deduplicator.js   # Sent log logic — unchanged
│   └── sent_log.json     # Persistent sent log — unchanged
├── templates/            # .docx files with «First_Name» «Last_Name» «Email_Address» fields
├── public/
│   └── index.html        # Frontend UI
├── uploads/              # Temp storage for session clean JSON files
└── package.json
```

`merger.js` is deleted. No output/ directory needed.

## Data Flow

### Upload flow (unchanged)
1. Recruiter uploads `.xlsx` iKrome export
2. `parser.js` reads the `SearchResults` sheet, finds Name and Email Address columns by header name, splits names, normalizes emails
3. `deduplicator.js` filters out anyone already in `sent_log.json`
4. Server stores the clean array as `uploads/<sessionId>_clean.json`
5. Returns `{ sessionId, totalIn, totalClean, totalDupes, preview }` to the frontend

### Download-clean flow (new)
1. Frontend sends `GET /download-clean/:sessionId`
2. Server reads `uploads/<sessionId>_clean.json`
3. Builds a new `.xlsx` workbook with the `xlsx` library — one sheet, three columns: `First_Name`, `Last_Name`, `Email_Address`; data starts at row 1 (no extra header rows, just the column names Word expects)
4. Marks all emails in the list as sent via `deduplicator.markAsSent()`
5. Deletes the session file
6. Streams the `.xlsx` as a file download named `clean_leads.xlsx`

### Templates flow (new)
1. On page load, frontend fetches `GET /templates`
2. Server reads `templates/` directory, returns array of `.docx` filenames
3. Frontend renders a card for each filename with a download button
4. Button hits `GET /templates/:filename`, server serves the file with `Content-Disposition: attachment`

## Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload` | Parse + deduplicate iKrome export |
| GET | `/download-clean/:sessionId` | Download clean .xlsx, mark as sent |
| GET | `/templates` | List available .docx templates |
| GET | `/templates/:filename` | Download a specific template |
| GET | `/stats` | Sent log count |
| GET | `/health` | Health check |
| GET | `/debug-upload` | Raw sheet dump for format debugging |

## Frontend UI Sections

1. **Sent Log Status** — three stat tiles: Total Sent, Ready to Merge, Duplicates Removed
2. **Step 1 — Upload iKrome Export** — drag-drop zone, file input, upload status message
3. **Step 2 — Download Clean List** (appears after upload) — preview table (first 5 rows), note showing total counts, "Download Clean List" button. Clicking downloads `.xlsx` and marks as sent atomically.
4. **Templates** — always visible below the upload section. Shows a card per `.docx` file in `templates/`. Each card has the template name and a Download button. Recruiters use these as their mail merge starting point in Word.

## Mark-as-Sent Timing

Leads are marked as sent **at the moment the clean Excel is downloaded**, not at a separate confirmation step. This is intentional — downloading the file is the recruiter's signal that they intend to use it.

## Template File Requirements

Templates stored in `templates/` must use Word mail merge field syntax:
- `«First_Name»`
- `«Last_Name»`
- `«Email_Address»`

The app serves them as-is. It does not inspect or validate their contents.

## Dependencies After Refactor

| Package | Purpose | Status |
|---------|---------|--------|
| express | Server | Keep |
| cors | CORS headers | Keep |
| multer | File upload handling | Keep |
| xlsx | Parse iKrome exports + generate clean Excel | Keep |
| docxtemplater | Letter generation | **Remove** |
| pizzip | Required by docxtemplater | **Remove** |
| archiver | Zip output | **Remove** |

## V2 Considerations (out of scope)

- Firebase sync for multi-station sent log sharing
- Preview of template contents in the browser
- Bulk template upload UI
