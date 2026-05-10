# Packet QC Tool — Upgrade Design Spec
**Date:** 2026-05-09
**Status:** Approved
**File:** `PacketQC.html` (single-file, no server required)

---

## Overview

A comprehensive upgrade to the Packet QC Tool covering four areas in a single implementation pass: retheme to Army Black/Gold design system, six new features, enriched regulatory content across all 85 tip entries, and five missing program document sections (OCS, WOFT, SMP, FLRI, ATP).

---

## 1. Design System

### Token Mapping

Replace all dark navy CSS custom properties with the Army Black/Gold palette used in `medical_v7.html` and `OPAT_Calculator.html`.

| Variable | Current | New |
|---|---|---|
| `--bg` | `#07101f` | `#221F20` (Army Black) |
| `--surface` | `#0d1a2f` | `#2F372F` (OD Green dark) |
| `--surface-2` | `#121f38` | `#3F4B36` (OD Green mid) |
| `--surface-3` | `#162440` | `#4a5a40` |
| `--border` | `#1a3050` | `#4a5a40` |
| `--border-light` | `#1f3a60` | `#5a6e50` |
| `--gold` | `#f0bc1a` | `#FFCC01` (Army Gold) |
| `--gold-dim` | `#b8900e` | `#ccaa00` |
| `--gold-glow` | `rgba(240,188,26,0.12)` | `rgba(255,204,1,0.10)` |
| `--green` | `#16a34a` | `#4F7942` |
| `--green-light` | `#22c55e` | `#5d9150` |
| `--green-glow` | `rgba(22,163,74,0.15)` | `rgba(79,121,66,0.20)` |
| `--red` | `#dc2626` | `#A02E2E` |
| `--red-light` | `#ef4444` | `#c23a3a` |
| `--red-glow` | `rgba(220,38,38,0.15)` | `rgba(160,46,46,0.15)` |
| `--amber` | `#d97706` | `#E25822` (hi-org) |
| `--amber-light` | `#f59e0b` | `#f0723a` |
| `--amber-glow` | `rgba(217,119,6,0.15)` | `rgba(226,88,34,0.15)` |
| `--text` | `#dde6f0` | `#ffffff` |
| `--text-dim` | `#8ea8c3` | `#A8A6A2` (Army Gray) |
| `--text-muted` | `#3d5570` | `#6E6C68` |
| `--font-d` | `'Syne', sans-serif` | `'Archivo Black', 'Arial Black', sans-serif` |
| `--font-m` | `'IBM Plex Mono', monospace` | `'Archivo', Arial, sans-serif` |

### Font Update

Replace Google Fonts `<link>`:
```html
<!-- remove -->
Syne:wght@400;600;700;800 + IBM+Plex+Mono:wght@400;500;600

<!-- add -->
Archivo+Black:wght@400 + Archivo:wght@400;500;600;700
```

No layout changes. Token swap and font swap only. All structural classes (`.hdr`, `.csec`, `.citem`, `.irow`, `.tippanel`, etc.) retain their existing rules — only color and font values change.

---

## 2. Features

### 2.1 GC + SC Name Fields

**Profile form:** Add two text inputs below the Programs row, above the Generate button:
- "Guidance Counselor (GC) Name" — `id="f_gc"`
- "Station Commander (SC) Name" — `id="f_sc"`

Both are optional. They do not gate checklist generation.

**Locked profile summary:** Include GC and SC names as `<span class="ptag">` tags in the post-generation summary bar if populated.

**Applicant bar (`#abar`):** Add two new `.afield` columns — GC and SC — after the QC Date and Recruiter fields.

**Print header:** GC and SC names appear in the printed header block.

**Profile object:** `getProfile()` adds `gc: ..., sc: ...` fields. `lockProfile()` reads and displays them.

---

### 2.2 Recruiter Initials per Section

**Location:** An initials row is appended as the last child of each `.citems` div, after all items and subsection blocks.

**Inactive state:** The row is always present but visually dimmed and non-interactive until the section reaches 100% resolution (all items checked or legitimately N/A'd).

**Active state:** When `resolved === total`, the row activates — border brightens, input becomes editable. The recruiter types 2–3 letter initials and presses Enter or clicks a confirm button labeled `CONFIRM`.

**Confirmed state:** Input locks (readonly). Initials display in Army Gold. A timestamp appended in muted text: `JKS · 09 MAY 2026 14:32`.

**Storage:** `state.initials[sectionId] = { value: 'JKS', ts: 1746793920000 }`. Initials are reset when `generate()` is called (same as checkbox state) — clicking "Edit Profile" alone does not reset them.

**Waiver subsections:** Each waiver subsection (suitability, medical, moral, etc.) gets its own initials row, stored under `state.initials['waivers_suitability']` etc.

**Print:** Initials row prints. Unconfirmed sections show a blank initials line. Confirmed sections show initials + timestamp.

---

### 2.3 Per-Section Notes

**Location:** Below the initials row in each section card.

**Toggle:** A small text link `+ Add note` (hidden when a note already exists; shows `✎ Note` when content is present). Clicking expands/collapses a `<textarea>`.

**Indicator:** When a section has a non-empty note, a small filled dot appears on the section header bar next to the progress fraction.

**Storage:** `state.notes[sectionId]` — plain text string. Notes are reset when `generate()` is called (same as checkbox and initials state) — clicking "Edit Profile" alone does not reset them.

**Print:** Notes print below the section's items in a shaded block labeled `RECRUITER NOTE:`. Empty notes omit the block entirely.

---

### 2.4 Document Count Summary

**Location:** Far left of the sticky section badge bar (`#sbar`), before the section badges.

**Display:** `14 / 22 DOCS` — numerator is resolved items (checked or N/A), denominator is total items generated for the current profile.

**Color:**
- `0%–49%` resolved → `--text-muted`
- `50%–99%` resolved → `--amber-light`
- `100%` resolved → `--gold`

**Updates:** Recalculated on every `updateSbar()` call. Counts all items across all sections including waiver subsection items.

**Implementation:** Aggregate `resolved` and `total` counts from `getAllSecItems()` across all `state.sections`.

---

### 2.5 Quick Links to Other Tools

A `buildLinkChip(label, href)` helper returns:
```html
<a class="tool-chip" href="./asvab_mos_tool_v2.html" target="_blank">→ ASVAB Tool</a>
```

CSS: `.tool-chip` — small inline badge, Army Gold border, muted text, gold on hover. `display:none` in `@media print`.

**Three insertion points in `buildItemEl()`:**

| Item ID | Chip label | Target |
|---|---|---|
| `umf680` (prescreen section) | `→ Medical Screener` | `./medical_v7.html` |
| `arms_680adp`, `arms_mirs` | `→ OPAT Calc` | `./OPAT_Calculator.html` |
| Any OCS/WOFT GT score items | `→ ASVAB Tool` | `./asvab_mos_tool_v2.html` |

Chips are appended inside `.ibtns` after the N/A button and tip toggle.

---

### 2.6 Enhanced Print Layout

Replace the existing `@media print` block wholesale.

**Print-only header (`#print-header`):**
- Injected into `<body>` on page load, `display:none` normally
- Contains: unit crest placeholder box | "PACKET QC TOOL" title | applicant name + SSN last 4 + DOB | QC date | GC name | SC name
- GO/NO GO status in large Archivo Black at top right

**Section layout in print:**
- Section header shows section name + `X/Y` fraction + initials (or blank initials line if not yet confirmed)
- Each item: checkbox symbol (`✓` / `□` / `—`) + label
- N/A items: `—` + label in italic
- Section notes block (if present): shaded background, `RECRUITER NOTE:` label
- Page break before: Core Documents, Waivers/ETPs, GENESIS Profile Verification, Final Verification

**Hidden in print:** `.hdr`, `#sbar`, `.pactions`, `.btn-sec`, `.btn-na`, `.tiptoggle`, `.tippanel`, `.tool-chip`, `#pform` input elements, `#abar` (replaced by `#print-header`)

**Visible in print:** `#print-header`, `.csec`, `.citem`, `.irow`, `.initials-row`, `.notes-block`

---

## 3. Content Enrichment

### 3.1 Reg Citations (43 empty `r:""` fields)

| Tip key(s) | Citation to add |
|---|---|
| `dl` | AR 601-210 para 2-5 |
| `passport_cit` | AR 601-210 para 2-5c |
| `nat_cert` | AR 601-210 para 2-5d |
| `hs_letter`, `hs_trans`, `hs_dip` | AR 601-210 para 2-8 |
| `college_letter`, `college_trans` | AR 601-210 para 2-8 |
| `dd214` | AR 601-210 para 3-2 |
| `redd` | AR 601-210 para 3-2; USAREC Pam 601-32 |
| `da1059` | AR 623-3; AR 601-210 para 3-2 |
| `pha` | AR 40-501; USMEPCOM Reg 40-1 |
| `mar_cert`, `div_dec`, `dep_docs` | AR 601-210 para 2-14 |
| `dd2005` | DoDI 6490.02E; 5 USC 552a |
| `umf680_1` | USMEPCOM Reg 601-23 Ch 3 |
| `dd369` | AR 601-210 para 2-18 |
| `sex_offender` | AR 601-210 para 2-18; USAREC Policy |
| `genesis_person` through `genesis_docs` (12 keys) | UM 331 |
| `sf86` | 5 CFR Part 731; UM 331 |
| `w_stmt` | AR 601-210 Ch 4 |
| `w_co`, `w_bn` | AR 601-210 para 4-4 |
| `w_incident` | AR 601-210 para 4-3 |
| `w_dd370` | AR 601-210; 28 CFR Part 50 |
| `w_mirs` | USMEPCOM Reg 601-23 |
| `w_tat_photo` | AR 601-210 para 3-4 |
| `w_chaplain` | AR 600-20 Ch 5; AR 601-210 |
| `w_caretaker`, `w_da3072`, `w_fcp` | AR 601-210 para 2-15; AR 600-20 Ch 5 |
| `arms_docs` | USAREC ARMS 2.0 Program SOP |

### 3.2 Thin Tips Expanded

Five tips with under-developed `m:` content get expanded to match the depth standard of the rest of the T object:

- **`redd`** — add: applicant signed wrong version (must be current form), data entry errors on separation date/RE code not caught before SC QC
- **`pha`** — add: PHA completed by non-authorized provider, PHA date predates the applicant's most recent duty assignment
- **`umf680_2`** — add: 680-3A-2 completed before 680-3A, applicant data changed after 680-3A submission and 680-3A-2 not updated to match
- **`sex_offender`** — add: check run against applicant's current address only, not all addresses in residence history; results printed but not signed/dated
- **`arms_docs`** — add: 680-ADP submitted without current MIRS confirming ARMS 2.0 eligibility band, applicant retested and eligibility band changed but packet not updated

### 3.3 New Program Sections

Five new section objects added to `buildSections()` inside the existing program block. Each has its own tip keys in T.

#### OCS (Officer Candidate School)
Items:
- DA Form 61 (Application for Appointment as Commissioned Officer)
- Sealed official college transcripts — bachelor's degree required
- Three letters of recommendation (commissioned officer or senior civilian, O-3 or above preferred)
- GT score 110+ — verified in iKrome line scores
- ACFT score documentation — must meet OCS standard
- Official photo — Army uniform, current within 6 months
- Medical — MEPS physical clearance, no pending holds

#### WOFT (Warrant Officer Flight Training)
Items:
- DA Form 61 (Application for Appointment as Warrant Officer)
- SIFT score sheet — minimum 40 required; coordinate retests with RSC if below threshold
- Class 1A Flight Physical — must be scheduled at approved MEPS or military installation; standard MEPS physical is NOT sufficient
- GT score 110+ — verified in iKrome
- College transcripts — 60+ credit hours preferred; degree not always required but strengthens packet
- Letters of recommendation — from WO1 or above; commissioned officers acceptable
- Flight physical coordination note — MEPS must be notified in advance for flight physical scheduling

#### SMP (Simultaneous Membership Program)
Items:
- ROTC enrollment verification letter — from Professor of Military Science (PMS), on ROTC battalion letterhead, confirms active enrollment and expected commissioning date
- Current USAR/NG assignment orders — most recent assignment or attachment orders
- Academic transcript — confirms ROTC enrollment and academic standing
- SMP contract — signed by applicant and ROTC battalion; confirm program year and scholarship status
- Most recent NCOER or OER if applicant holds NCO/officer rank in reserve component

#### FLRI (Future Leaders Recruiting Initiative)
Items:
- Prior service officer separation documents — DD 214 showing commissioned service, separation code, and character of discharge
- DA Form 61 — Application for Appointment, completed and signed
- FLRI eligibility verification memo — from RSC or USAREC; confirm applicant meets current FLRI criteria before initiating packet
- Official college transcripts — degree required; sealed copy
- Letters of recommendation — from O-4 or above

#### ATP (Army Training Program)
Items:
- ATP eligibility verification — confirm applicant meets current USAREC ATP criteria with GC before initiating
- Current ASVAB/line scores — confirm qualifying scores for intended MOS under ATP option
- Enlistment option documentation — ATP contract option confirmed in iKrome before MEPS scheduling
- MOS qualification verification — ATP MOS must be available and applicant must qualify on all line scores

---

## 4. Architecture

### State Object

```js
// Before
state = { profile: null, sections: [], items: {} }

// After
state = {
  profile:  null,      // adds gc, sc string fields
  sections: [],        // unchanged
  items:    {},        // { [itemId]: 'unchecked'|'checked'|'na' }
  initials: {},        // { [sectionId]: { value: 'JKS', ts: 1746793920000 } | null }
  notes:    {}         // { [sectionId]: 'string' }
}
```

State resets fully on profile edit (same behavior as today for `items`).

### Modified Functions

| Function | Change |
|---|---|
| `getProfile()` | Add `gc`, `sc` fields |
| `lockProfile(p)` | Render GC/SC ptags if populated |
| `renderAbar(p)` | Add GC and SC afield columns |
| `buildSections(p)` | Add OCS/WOFT/SMP/FLRI/ATP program blocks |
| `buildSectionEl(sec)` | Append initials row + notes toggle after citems |
| `buildItemEl(item, secId)` | Inject tool-chip for three item IDs |
| `refreshSection(secId)` | Activate initials row when resolved === total |
| `updateSbar()` | Compute and render doc counter |
| `resetAll()` | Also clear `state.initials` and `state.notes` |
| `unlockProfile()` | Also clear `state.initials` and `state.notes` |

### New Functions

| Function | Purpose |
|---|---|
| `buildLinkChip(label, href)` | Returns `.tool-chip` anchor element |
| `buildInitialsRow(secId)` | Returns the initials row DOM element |
| `buildNotesRow(secId)` | Returns the notes toggle + textarea DOM element |
| `confirmInitials(secId)` | Validates, locks, and timestamps the initials input |
| `updateNotes(secId, value)` | Writes to `state.notes[secId]`, toggles note indicator dot |

### T Object

- 43 `r:""` fields populated with regulatory citations
- 5 thin `m:` fields expanded
- ~10 new tip keys added for OCS/WOFT/SMP/FLRI/ATP items (2 per program average)
- No structural changes to existing keys

### Fonts

```html
<!-- Replace existing Google Fonts link -->
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### File Size

| Component | Est. size |
|---|---|
| Current file | ~72 KB |
| New program tip content | +5 KB |
| Feature JS + CSS | +2 KB |
| Reg citations + expanded tips | +1 KB |
| **Estimated total** | **~80 KB** |

Single file. No new CDN links except the Google Fonts URL replacement.

---

## Constraints

- Single-file HTML — no build step, no frameworks, no new CDN links
- No localStorage — state does not persist across page reloads
- Preserves existing state shape for `items` (no breaking changes)
- All regulatory content stays at recruiter-review level (verify/mistakes/reg) — not block-by-block form completion instructions
- Tool links use relative paths (`./filename.html`) for GitHub Pages compatibility
